use std::fs::{read_dir, File};
use std::path;
use std::thread;

#[tauri::command]
pub fn unzip(window: tauri::Window, zipfile: String, destpath: String, top_level: Option<bool>) {
  // Read file TODO: replace test file
  let f = match File::open(&zipfile) {
    Ok(f) => f,
    Err(e) => {
      println!("Failed to open zip file: {}", e);
      return;
    }
  };

  let write_path = path::PathBuf::from(&destpath);

  // Get a list of all current directories
  let mut dirs = vec![];
  for entry in read_dir(&write_path).unwrap() {
    let entry = entry.unwrap();
    let entry_path = entry.path();
    if entry_path.is_dir() {
      dirs.push(entry_path);
    }
  }

  // Run extraction in seperate thread
  thread::spawn(move || {
    let full_path = &write_path;

    window.emit("extract_start", &zipfile).unwrap();

    match zip_extract::extract(&f, &full_path, top_level.unwrap_or(false)) {
      Ok(_) => {
        println!(
          "Extracted zip file to: {}",
          full_path.to_str().unwrap_or("Error")
        );
      }
      Err(e) => {
        println!("Failed to extract zip file: {}", e);
        let mut res_hash = std::collections::HashMap::new();

        res_hash.insert("error".to_string(), e.to_string());

        res_hash.insert("path".to_string(), zipfile.to_string());

        window.emit("download_error", &res_hash).unwrap();
      }
    };

    // Get the name of the inenr file in the zip file
    let mut zip = zip::ZipArchive::new(&f).unwrap();
    let file = zip.by_index(0).unwrap();
    let name = file.name();

    // If the contents is a jar file, emit that we have extracted a new jar file
    if name.ends_with(".jar") {
      window
        .emit("jar_extracted", destpath.to_string() + name)
        .unwrap();
    }

    // Delete zip file
    match std::fs::remove_file(&zipfile) {
      Ok(_) => {
        println!("Deleted zip file: {}", zipfile);
      }
      Err(e) => {
        println!("Failed to delete zip file: {}", e);
      }
    };

    // Get any new directory that could have been created
    let mut new_dir: String = String::new();
    for entry in read_dir(&write_path).unwrap() {
      let entry = entry.unwrap();
      let entry_path = entry.path();
      if entry_path.is_dir() {
        if !dirs.contains(&entry_path) {
          new_dir = entry_path.to_str().unwrap().to_string();
        }
      }
    }

    let mut res_hash = std::collections::HashMap::new();
    res_hash.insert("file", zipfile.to_string());
    res_hash.insert("new_folder", new_dir.to_string());

    window.emit("extract_end", &res_hash).unwrap();
  });
}
