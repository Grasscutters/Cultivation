use once_cell::sync::Lazy;

use dashmap::{DashMap, DashSet};
use std::{cmp::min, sync::Mutex};
use tokio::{fs::File, io::AsyncWriteExt};

use crate::error::{CultivationError, CultivationResult};
use futures_util::StreamExt;
use reqwest::Client;
use tokio_util::sync::CancellationToken;

#[tauri::command]
pub async fn download_file(
  window: tauri::Window,
  client: tauri::State<'_, Client>,
  downloads: tauri::State<'_, DashSet<String>>,
  cancellation_tokens: tauri::State<'_, DashMap<String, CancellationToken>>,
  url: &str,
  path: &str,
) -> CultivationResult<()> {
  let token = CancellationToken::new();
  cancellation_tokens.insert(path.to_string(), token.clone());

  let out = tokio::select! {
    _ = token.cancelled() => {
      println!("Cancelled {path}! returning...");
      Ok(())
    },
    r = async move {
      let res = match client.get(url).send().await {
        Ok(r) => r,
        Err(e) => {
          emit_download_err(window, format!("Failed to request {}", url), path)?;
          return Err(e.into());
        }
      };
      let total_size = res.content_length().unwrap_or(0);

      // Create file path
      let mut file = match File::create(path).await {
        Ok(f) => f,
        Err(e) => {
          emit_download_err(window, format!("Failed to create file '{}'", path), path)?;
          return Err(CultivationError::Custom(format!("{e}, [path: {}]", path)));
        }
      };
      let mut downloaded: u64 = 0;
      let mut total_downloaded: u64 = 0;

      // File stream
      let mut stream = res.bytes_stream();

      // Assuming all goes well, add to the downloads list
      downloads.insert(path.to_string());

      // Await chunks
      while let Some(item) = stream.next().await {
        // Stop the loop if the download is removed from the list
        if !downloads.contains(path) {
          break;
        }

        if let Err(e) = item {
          emit_download_err(window, "Error while downloading file".into(), path)?;
          return Err(e.into());
        }

        let chunk = item?;

        if let Err(e) = file.write_all(&chunk).await {
          emit_download_err(window, "Error while writing file".into(), path)?;
          return Err(CultivationError::Custom(format!("{e}, [path: {}]", path)));
        }

        // New progress
        let new = min(downloaded + (chunk.len() as u64), total_size);
        downloaded = new;

        total_downloaded += chunk.len() as u64;

        let mut res_hash = DashMap::with_capacity(4);

        res_hash.insert("downloaded".to_string(), downloaded.to_string());
        res_hash.insert("total".to_string(), total_size.to_string());
        res_hash.insert("path".to_string(), path.to_string());
        res_hash.insert("total_downloaded".to_string(), total_downloaded.to_string());

        // Create event to send to frontend
        window.emit("download_progress", &res_hash)?;
      }

      // One more "finish" event
      window.emit("download_finished", &path)?;

      Ok(())
    } => r
  };

  out
}

#[inline]
pub fn emit_download_err(window: tauri::Window, msg: String, path: &str) -> CultivationResult<()> {
  let mut res_hash = DashMap::with_capacity(2);

  res_hash.insert("error".to_string(), msg);
  res_hash.insert("path".to_string(), path.to_string());

  window.emit("download_error", &res_hash)?;

  Ok(())
}

#[tauri::command]
pub fn stop_download(
  path: String,
  downloads: tauri::State<'_, DashSet<String>>,
  cancellation_tokens: tauri::State<'_, DashMap<String, CancellationToken>>,
) {
  println!("{:?}", cancellation_tokens);
  if let Some(token) = cancellation_tokens.get(&path) {
    println!("Stopping {path}...");
    token.cancel();
  }

  downloads.remove(&path);

  // Delete the file from disk
  if let Err(_e) = std::fs::remove_file(&path) {
    // Do nothing
  }
}
