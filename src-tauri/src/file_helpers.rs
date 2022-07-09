use std::fs;

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