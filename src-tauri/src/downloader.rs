use std::cmp::min;
use std::fs::File;
use std::io::Write;

use futures_util::StreamExt;

// Lots of help from: https://gist.github.com/giuliano-oliveira/4d11d6b3bb003dba3a1b53f43d81b30d
// and docs ofc

#[tauri::command]
pub async fn download_file(window: tauri::Window, url: &str, path: &str) -> Result<(), String> {
    // Reqwest setup
    let res = match reqwest::get(url)
        .await {
            Ok(r) => r,
            Err(e) => {
                emit_download_err(window, format!("Failed to request {}", url), url);
                return Err(format!("Failed to request {}", url));
            },
        };
    let total_size = res
        .content_length()
        .unwrap_or(0);

    // Create file path
    let mut file = match File::create(path) {
        Ok(f) => f,
        Err(e) => {
            emit_download_err(window, format!("Failed to create file '{}'", path), path);
            return Err(format!("Failed to create file '{}'", path));
        },
    };
    let mut downloaded: u64 = 0;

    // File stream
    let mut stream = res.bytes_stream();

    // Await chunks
    while let Some(item) = stream.next().await {
        let chunk = match item {
            Ok(itm) => itm,
            Err(e) => {
                emit_download_err(window, format!("Error while downloading file"), path);
                return Err(format!("Error while downloading file: {}", e));
            },
        };
        let vect = &chunk.to_vec()[..];

        // Write bytes
        match file.write_all(&vect) {
            Ok(x) => x,
            Err(e) => {
                emit_download_err(window, format!("Error while writing file"), path);
                return Err(format!("Error while writing file: {}", e));
            },
        }

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

pub fn emit_download_err(window: tauri::Window, msg: std::string::String, path: &str) {
    let mut res_hash = std::collections::HashMap::new();

    res_hash.insert(
        "error".to_string(),
        msg.to_string()
    );

    res_hash.insert(
        "path".to_string(),
        path.to_string()
    );

    window.emit("download_error", &res_hash).unwrap();
}