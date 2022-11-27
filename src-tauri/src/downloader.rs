use dashmap::{mapref::entry::Entry, DashMap};
use std::cmp::min;
use tokio::fs::File;

use crate::{error::CultivationResult, Downloads};
use futures_util::StreamExt;
use reqwest::Client;
use tauri::State;
use tokio::io::AsyncWriteExt;
use tokio_util::sync::CancellationToken;

#[tauri::command]
pub async fn download_file(
  window: tauri::Window,
  url: &str,
  path: &str,
  downloads: State<'_, Downloads>,
  client: State<'_, Client>,
) -> CultivationResult<()> {
  let token = CancellationToken::new();
  // Assuming all goes well, add to the downloads list
  downloads.insert(path.to_string(), token.clone());

  let out = tokio::select! {
    _ = token.cancelled() => {
      println!("Cancelled {path}! Returning...");
      Ok(())
    },
    r = async move {
      // Reqwest setup
      let res = client.get(url).send().await?;
      let total_size = res.content_length().unwrap_or(0);

      // Create file path
      let mut file = File::create(path).await?;
      let mut downloaded: u64 = 0;
      let mut total_downloaded: u64 = 0;

      // File stream
      let mut stream = res.bytes_stream();

      // Await chunks
      while let Some(item) = stream.next().await {
        // Stop the loop if the download is removed from the list
        if !downloads.contains_key(path) {
          break;
        }

        let chunk = item?;

        // Write bytes
        file.write_all(&chunk).await?;

        // New progress
        let new = min(downloaded + (chunk.len() as u64), total_size);
        downloaded = new;

        total_downloaded += chunk.len() as u64;

        let res_hash = DashMap::with_capacity(4);

        res_hash.insert("downloaded".to_string(), downloaded.to_string());
        res_hash.insert("total".to_string(), total_size.to_string());
        res_hash.insert("path".to_string(), path.to_string());
        res_hash.insert("total_downloaded".to_string(), total_downloaded.to_string());

        // Create event to send to frontend
        window.emit("download_progress", &res_hash)?;
      }

      // One more "finish" event
      window.emit("download_finished", &path)?;

      // We are done
      Ok(())
    } => r
  };

  out
}

#[tauri::command]
pub async fn stop_download(path: String, downloads: State<'_, Downloads>) -> CultivationResult<()> {
  match downloads.entry(path) {
    Entry::Occupied(occupied) => {
      let (path, token) = occupied.remove_entry();
      token.cancel();

      // Delete the file from disk
      tokio::fs::remove_file(&path).await?;

      Ok(())
    }
    _ => Ok(()),
  }
}
