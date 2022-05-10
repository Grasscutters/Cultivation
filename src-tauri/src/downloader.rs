use std::cmp::min;
use std::fs::File;
use std::io::Write;

use futures_util::StreamExt;

// Lots of help from: https://gist.github.com/giuliano-oliveira/4d11d6b3bb003dba3a1b53f43d81b30d
// and docs ofc

#[tauri::command]
pub async fn download_file(window: tauri::Window, url: &str, path: &str) -> Result<(), String> {
    // Reqwest setup
    let res = reqwest::get(url)
        .await
        .or(Err(format!("Failed to get {}", url)))?;
    let total_size = res
        .content_length()
        .unwrap_or(0);

    // Create file path
    let mut file = File::create(path).or(Err(format!("Failed to create file '{}'", path)))?;
    let mut downloaded: u64 = 0;

    // File stream
    let mut stream = res.bytes_stream();

    // Await chunks
    while let Some(item) = stream.next().await {
        let chunk = item.or(Err(format!("Error while downloading file"))).unwrap();
        let vect = &chunk.to_vec()[..];

        // Write bytes
        file.write_all(&vect)
            .or(Err(format!("Error while writing file")))?;

        // New progress
        let new = min(downloaded + (chunk.len() as u64), total_size);
        downloaded = new;

        let mut res_hash = std::collections::HashMap::new();

        res_hash.insert(
            "downloaded".to_string(),
            downloaded.to_string()
        );

        res_hash.insert(
            "total".to_string(),
            total_size.to_string()
        );

        res_hash.insert(
            "path".to_string(),
            path.to_string()
        );

        // Create event to send to frontend
        window.emit("download_progress", &res_hash).unwrap();
    }

    // One more "finish" event
    window.emit("download_finished", &path).unwrap();

    // We are done
    return Ok(());
}