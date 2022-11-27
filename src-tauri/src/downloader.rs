use once_cell::sync::Lazy;

use std::{cmp::min, fs::File, io::Write, sync::Mutex};

use futures_util::StreamExt;

// This will create a downloads list that will be used to check if we should
// continue downloading the file
static DOWNLOADS: Lazy<Mutex<Vec<String>>> = Lazy::new(|| Mutex::new(Vec::new()));

// Lots of help from: https://gist.github.com/giuliano-oliveira/4d11d6b3bb003dba3a1b53f43d81b30d
// and docs ofc
#[tauri::command]
pub async fn download_file(window: tauri::Window, url: &str, path: &str) -> Result<(), String> {
  // Reqwest setup
  let res = match reqwest::get(url).await {
    Ok(r) => r,
    Err(_e) => {
      emit_download_err(window, format!("Failed to request {}", url), path);
      return Err(format!("Failed to request {}", url));
    }
  };
  let total_size = res.content_length().unwrap_or(0);

  // Create file path
  let mut file = match File::create(path) {
    Ok(f) => f,
    Err(_e) => {
      emit_download_err(window, format!("Failed to create file '{}'", path), path);
      return Err(format!("Failed to create file '{}'", path));
    }
  };
  let mut downloaded: u64 = 0;
  let mut total_downloaded: u64 = 0;

  // File stream
  let mut stream = res.bytes_stream();

  // Assuming all goes well, add to the downloads list
  DOWNLOADS.lock().unwrap().push(path.to_string());

  // Await chunks
  while let Some(item) = stream.next().await {
    // Stop the loop if the download is removed from the list
    if !DOWNLOADS.lock().unwrap().contains(&path.to_string()) {
      break;
    }

    let chunk = match item {
      Ok(itm) => itm,
      Err(e) => {
        emit_download_err(window, "Error while downloading file".to_string(), path);
        return Err(format!("Error while downloading file: {}", e));
      }
    };
    let vect = &chunk.to_vec()[..];

    // Write bytes
    match file.write_all(vect) {
      Ok(x) => x,
      Err(e) => {
        emit_download_err(window, "Error while writing file".to_string(), path);
        return Err(format!("Error while writing file: {}", e));
      }
    }

    // New progress
    let new = min(downloaded + (chunk.len() as u64), total_size);
    downloaded = new;

    total_downloaded += chunk.len() as u64;

    let mut res_hash = std::collections::HashMap::new();

    res_hash.insert("downloaded".to_string(), downloaded.to_string());
    res_hash.insert("total".to_string(), total_size.to_string());
    res_hash.insert("path".to_string(), path.to_string());
    res_hash.insert("total_downloaded".to_string(), total_downloaded.to_string());

    // Create event to send to frontend
    window.emit("download_progress", &res_hash).unwrap();
  }

  // One more "finish" event
  window.emit("download_finished", &path).unwrap();

  // We are done
  Ok(())
}

pub fn emit_download_err(window: tauri::Window, msg: String, path: &str) {
  let mut res_hash = std::collections::HashMap::new();

  res_hash.insert("error".to_string(), msg);
  res_hash.insert("path".to_string(), path.to_string());

  window.emit("download_error", &res_hash).unwrap();
}

#[tauri::command]
pub fn stop_download(path: String) {
  // Check if the path is in the downloads list
  let mut downloads = DOWNLOADS.lock().unwrap();
  let index = downloads.iter().position(|x| x == &path);

  // Remove from list
  if let Some(i) = index {
    downloads.remove(i);
  }

  // Delete the file from disk
  std::fs::remove_file(&path).unwrap_or(());
}
