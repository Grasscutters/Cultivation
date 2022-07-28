use std::fs::{read_dir, File};
use std::path;
use std::thread;
use unrar::archive::Archive;

#[tauri::command]
pub fn unzip(
  window: tauri::Window,
  zipfile: String,
  destpath: String,
  top_level: Option<bool>,
  folder_if_loose: Option<bool>,
) {
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
    let mut full_path = write_path.clone();

    window.emit("extract_start", &zipfile).unwrap();

    if folder_if_loose.unwrap_or(false) {
      // Create a new folder with the same name as the zip file
      let mut file_name = path::Path::new(&zipfile)
        .file_name()
        .unwrap()
        .to_str()
        .unwrap();

      // remove ".zip" from the end of the file name
      file_name = &file_name[..file_name.len() - 4];

      let new_path = full_path.join(file_name);
      match std::fs::create_dir_all(&new_path) {
        Ok(_) => {}
        Err(e) => {
          println!("Failed to create directory: {}", e);
          return;
        }
      };

      full_path = new_path.clone();
    }

    println!("Is rar file? {}", zipfile.ends_with(".rar"));

    let name;

    // If file ends in zip, OR is unknown, extract as zip, otherwise extract as rar
    if zipfile.ends_with(".rar") {
      extract_rar(
        &window,
        &zipfile,
        &f,
        &full_path,
        top_level.unwrap_or(false),
      );

      let archive = Archive::new(zipfile.clone());
      name = archive.list().unwrap().next().unwrap().unwrap().filename;
    } else {
      extract_zip(
        &window,
        &zipfile,
        &f,
        &full_path,
        top_level.unwrap_or(false),
      );

      // Get the name of the inenr file in the zip file
      let mut zip = zip::ZipArchive::new(&f).unwrap();
      let file = zip.by_index(0).unwrap();
      name = file.name().to_string().clone();
    }

    // If the contents is a jar file, emit that we have extracted a new jar file
    if name.ends_with(".jar") {
      window
        .emit("jar_extracted", destpath.to_string() + name.as_str())
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

fn extract_rar(
  window: &tauri::Window,
  rarfile: &String,
  _f: &File,
  full_path: &path::PathBuf,
  _top_level: bool,
) {
  let archive = Archive::new(rarfile.clone());

  let mut open_archive = archive
    .extract_to(full_path.to_str().unwrap().to_string())
    .unwrap();

  match open_archive.process() {
    Ok(_) => {
      println!(
        "Extracted rar file to: {}",
        full_path.to_str().unwrap_or("Error")
      );
    }
    Err(e) => {
      println!("Failed to extract rar file: {}", e);
      let mut res_hash = std::collections::HashMap::new();

      res_hash.insert("error".to_string(), e.to_string());
      res_hash.insert("path".to_string(), rarfile.to_string());

      window.emit("download_error", &res_hash).unwrap();
    }
  }
}

fn extract_zip(
  window: &tauri::Window,
  zipfile: &String,
  f: &File,
  full_path: &path::PathBuf,
  top_level: bool,
) {
  match zip_extract::extract(f, full_path, top_level) {
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
}
