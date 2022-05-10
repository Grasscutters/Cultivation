use std::cmp::min;
use std::fs::File;
use std::io::Write;

use futures_util::StreamExt;

use tauri::{
  command,
  Event
};

// Lots of help from: https://gist.github.com/giuliano-oliveira/4d11d6b3bb003dba3a1b53f43d81b30d
// and docs ofc

#[tauri::command]
pub async fn download_file(url: &str, path: &str) -> Result<(), String> {
    // Reqwest setup
    let res = reqwest::get(url).await.or(Err(format!("Failed to get {}", url)))?;
    let total_size = res
        .content_length()
        .ok_or(format!("Failed to get content length from '{}'", &url))?;

    // Create file path
    let mut file = File::create(path).or(Err(format!("Failed to create file '{}'", path)))?;
    let mut downloaded: u64 = 0;

    // File stream
    let mut stream = res.bytes_stream();

    // Await chunks
    while let Some(item) = stream.next().await {
        let chunk = item.or(Err(format!("Error while downloading file")));
        // Write chunk
        file.write_all(&chunk)
            .or(Err(format!("Error while writing to file")))?;
        // New progress
        let new = min(downloaded + (chunk.len() as u64), total_size);
        downloaded = new;
    }

    // We are done
    return Ok(());
}