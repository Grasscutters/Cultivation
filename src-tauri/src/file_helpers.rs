use file_diff::diff;
use std::fs;
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::PathBuf;

#[tauri::command]
pub fn rename(path: String, new_name: String) {
  let mut new_path = path.clone();

  // Check if file/folder to replace exists
  if fs::metadata(&path).is_err() {
    return;
  }

  // Check if path uses forward or back slashes
  if new_path.contains('\\') {
    new_path = path.replace('\\', "/");
  }

  let path_replaced = &path.replace(new_path.split('/').last().unwrap(), &new_name);

  match fs::rename(&path, path_replaced) {
    Ok(_) => {
      println!("Renamed {} to {}", &path, path_replaced);
    }
    Err(e) => {
      println!("Error: {}", e);
    }
  };
}

#[tauri::command]
pub fn dir_create(path: String) {
  fs::create_dir_all(path).unwrap();
}

#[tauri::command]
pub fn dir_exists(path: &str) -> bool {
  let path_buf = PathBuf::from(path);
  fs::metadata(path_buf).is_ok()
}

#[tauri::command]
pub fn dir_is_empty(path: &str) -> bool {
  let path_buf = PathBuf::from(path);
  fs::read_dir(path_buf).unwrap().count() == 0
}

#[tauri::command]
pub fn dir_delete(path: &str) {
  let path_buf = PathBuf::from(path);
  fs::remove_dir_all(path_buf).unwrap();
}

#[tauri::command]
pub fn are_files_identical(path1: &str, path2: &str) -> bool {
  diff(path1, path2)
}

#[tauri::command]
pub fn does_file_exist(path1: &str) -> bool {
  fs::metadata(path1).is_ok()
}

#[tauri::command]
pub fn copy_file(path: String, new_path: String) -> bool {
  let filename = &path.split('/').last().unwrap();
  let path_buf = PathBuf::from(&path);

  // If the new path doesn't exist, create it.
  if !dir_exists(PathBuf::from(&new_path).pop().to_string().as_str()) {
    std::fs::create_dir_all(&new_path).unwrap();
  }

  // Copy old to new
  match std::fs::copy(path_buf, format!("{}/{}", new_path, filename)) {
    Ok(_) => true,
    Err(e) => {
      println!("Failed to copy file: {}", e);
      println!("Path: {}", path);
      println!("New Path: {}", new_path);
      false
    }
  }
}

#[tauri::command]
pub fn copy_file_with_new_name(path: String, new_path: String, new_name: String) -> bool {
  let mut new_path_buf = PathBuf::from(&new_path);
  let path_buf = PathBuf::from(&path);

  // If the new path doesn't exist, create it.
  if !dir_exists(PathBuf::from(&new_path).pop().to_string().as_str()) {
    match std::fs::create_dir_all(&new_path) {
      Ok(_) => {}
      Err(e) => {
        println!("Failed to create directory: {}", e);
        return false;
      }
    };
  }

  new_path_buf.push(new_name);

  // Copy old to new
  match std::fs::copy(path_buf, &new_path_buf) {
    Ok(_) => true,
    Err(e) => {
      println!("Failed to copy file: {}", e);
      println!("Path: {}", path);
      println!("New Path: {}", new_path);
      false
    }
  }
}

#[tauri::command]
pub fn delete_file(path: String) -> bool {
  let path_buf = PathBuf::from(&path);

  match std::fs::remove_file(path_buf) {
    Ok(_) => true,
    Err(e) => {
      println!("Failed to delete file: {}", e);
      false
    }
  };

  false
}

#[tauri::command]
pub fn read_file(path: String) -> String {
  let path_buf = PathBuf::from(&path);
  println!("Debug: Reading file of path {}", path.clone(),);

  let mut contents = String::new();

  // Version data is 3 bytes long, 3 bytes in
  let ext = path_buf.extension().unwrap();
  if ext.eq("bytes") {
    let offset_bytes = 3;
    let num_bytes = 3;

    let mut byte_file = match std::fs::File::open(path_buf) {
      Ok(byte_file) => byte_file,
      Err(e) => {
        println!("{}", e);
        return String::new();
      }
    };
    byte_file
      .seek(SeekFrom::Start(offset_bytes))
      .unwrap_or_default();
    let mut buf = vec![0; num_bytes];
    byte_file.read_exact(&mut buf).unwrap_or_default();

    contents = String::from_utf8_lossy(&buf).to_string();
  } else {
    let mut file = match fs::File::open(path_buf) {
      Ok(file) => file,
      Err(e) => {
        if path.contains("config") {
          // Server.ts won't print the error so handle the message here for the user
          println!("Server config not found or invalid. Be sure to run the server at least once to generate it before making edits.");
        } else {
          println!("Failed to open file: {}", e);
        }
        return String::new(); // Send back error for handling by the caller
      }
    };

    file.read_to_string(&mut contents).unwrap();
  }

  contents
}

#[tauri::command]
pub fn write_file(path: String, contents: String) {
  let path_buf = PathBuf::from(&path);

  // Create file if it exists, otherwise just open and rewrite
  let mut file = match fs::File::create(path_buf) {
    Ok(file) => file,
    Err(e) => {
      println!("Failed to open file: {}", e);
      return;
    }
  };

  // Write contents to file
  match file.write_all(contents.as_bytes()) {
    Ok(_) => (),
    Err(e) => {
      println!("Failed to write to file: {}", e);
    }
  }
}
