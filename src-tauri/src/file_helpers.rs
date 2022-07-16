use std::fs;
use file_diff::diff;

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

  let path_replaced = &path.replace(&new_path.split('/').last().unwrap(), &new_name);

  fs::rename(path, &path_replaced).unwrap();
}

#[tauri::command]
pub fn dir_exists(path: &str) -> bool {
  fs::metadata(&path).is_ok()
}

#[tauri::command]
pub fn dir_is_empty(path: &str) -> bool {
  fs::read_dir(&path).unwrap().count() == 0
}

#[tauri::command]
pub fn dir_delete(path: &str) {
  fs::remove_dir_all(path).unwrap();
}

#[tauri::command]
pub fn are_files_identical(path1: &str, path2: &str) -> bool {
  return diff(path1, path2);
}

#[tauri::command]
pub fn copy_file(path: String, new_path: String) -> bool {
  let filename = &path.split('/').last().unwrap();
  let mut new_path_buf = std::path::PathBuf::from(&new_path);

  // If the new path doesn't exist, create it.
  if !dir_exists(new_path_buf.pop().to_string().as_str()) {
    std::fs::create_dir_all(&new_path).unwrap();
  }

  // Copy old to new
  match std::fs::copy(&path, format!("{}/{}", new_path, filename)) {
    Ok(_) => true,
    Err(e) => {
      println!("Failed to copy file: {}", e);
      false
    }
  }
}

#[tauri::command]
pub fn copy_file_with_new_name(path: String, new_path: String, new_name: String) -> bool {
  let mut new_path_buf = std::path::PathBuf::from(&new_path);

  // If the new path doesn't exist, create it.
  if !dir_exists(new_path_buf.pop().to_string().as_str()) {
    match std::fs::create_dir_all(&new_path) {
      Ok(_) => {}
      Err(e) => {
        println!("Failed to create directory: {}", e);
        return false;
      }
    };
  }

  // Copy old to new
  match std::fs::copy(&path, format!("{}/{}", new_path, new_name)) {
    Ok(_) => true,
    Err(e) => {
      println!("Failed to copy file: {}", e);
      false
    }
  }
}

#[tauri::command]
pub fn delete_file(path: String) -> bool {
  match std::fs::remove_file(path) {
    Ok(_) => return true, 
    Err(e) => {
      println!("Failed to delete file: {}", e);
      return false
    }
  };
}