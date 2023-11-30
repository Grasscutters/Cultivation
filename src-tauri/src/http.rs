use std::fs::File;
use std::io::Write;
use std::path::Path;

/// Downloads a file from the given URL.
/// Saves it to the specified file.
/// This will overwrite the file if it already exists.
/// url: The URL to download from.
/// to_file: The file to save to.
#[tauri::command]
pub async fn download_file(url: String, to_file: String) -> Result<String, String> {
    let mut response = reqwest::get(&url).await
        .expect("Failed to send request");
    let mut dest = {
        let fname = Path::new(&to_file);
        match File::create(&fname) {
            Ok(f) => f,
            Err(_) => return Err("Failed to create file".to_string()),
        }
    };
    while let Some(chunk) = response.chunk().await
        .expect("Unable to read chunk") {
        dest.write_all(&chunk)
            .expect("Failed to write chunk to file")
    }
    Ok("Downloaded".to_string())
}
