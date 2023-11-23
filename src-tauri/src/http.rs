use core::error::Error;
use std::fs::File;
use std::io::Write;
use std::path::Path;

/// Downloads a file from the given URL.
/// Saves it to the specified file.
/// This will overwrite the file if it already exists.
/// url: The URL to download from.
/// to_file: The file to save to.
#[tauri::command]
pub async fn download_file(url: String, to_file: String) -> Result<String, Box<dyn Error>> {
    let mut response = reqwest::get(&url).await?;
    let mut dest = {
        let fname = Path::new(&to_file);
        match File::create(&fname) {
            Ok(f) => f,
            Err(e) => return Err(Box::new(e)),
        }
    };
    while let Some(chunk) = response.chunk().await? {
        dest.write_all(&chunk).await?;
    }
    Ok("Downloaded".to_string())
}
