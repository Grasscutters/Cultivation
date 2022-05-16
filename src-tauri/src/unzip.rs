use zip_extract;
use std::fs::File;
use std::path;
use std::thread;

#[tauri::command]
pub fn unzip(window: tauri::Window, zipfile: String, destpath: String) {
  // Read file TODO: replace test file
  let f = match File::open(&zipfile) {
    Ok(f) => f,
    Err(e) => {
      println!("Failed to open zip file: {}", e);
      return;
    }
  };

  let writePath = path::PathBuf::from(&destpath);

  // Run extraction in seperate thread
  thread::spawn(move || {
    let fullPath = writePath;

    window.emit("extract_start", &zipfile);

    match zip_extract::extract(f, &fullPath, true) {
      Ok(_) => {
        println!("Extracted zip file to: {}", fullPath.to_str().unwrap_or("Error"));
      },
      Err(e) => {
        println!("Failed to extract zip file: {}", e);
      }
    };

    window.emit("extract_end", &zipfile);
  });
}