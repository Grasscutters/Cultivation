use crate::error::CultivationResult;
use file_diff::diff;
use std::{
  fs,
  io::{Read, Write},
  path::PathBuf,
};

// TODO: remove this file helper, already exists an api for this in tauri.
#[tauri::command]
#[deprecated = "file helper is redundant"]
pub fn rename(path: String, new_name: String) -> CultivationResult<()> {
  let mut new_path = path.clone();

  // Check if file/folder to replace exists
  if fs::metadata(&path).is_err() {
    return Ok(());
  }

  // Check if path uses forward or back slashes
  if new_path.contains('\\') {
    new_path = path.replace('\\', "/");
  }

  let path_replaced = &path.replace(new_path.split('/').last().unwrap(), &new_name);

  fs::rename(&path, path_replaced).map_err(Into::into)
}

// TODO: remove this file helper, already exists an api for this in tauri.
#[tauri::command]
#[deprecated = "file helper is redundant"]
pub fn dir_create(path: String) -> CultivationResult<()> {
  fs::create_dir_all(path).map_err(Into::into)
}

// TODO: remove this file helper, already exists an api for this in tauri.
#[tauri::command]
#[deprecated = "file helper is redundant"]
pub fn dir_exists(path: &str) -> bool {
  let path_buf = PathBuf::from(path);
  fs::metadata(path_buf).is_ok()
}

// TODO: remove this file helper, already exists an api for this in tauri.
#[tauri::command]
#[deprecated = "file helper is redundant"]
pub fn dir_is_empty(path: &str) -> CultivationResult<bool> {
  let path_buf = PathBuf::from(path);
  Ok(fs::read_dir(path_buf)?.count() == 0)
}

// TODO: remove this file helper, already exists an api for this in tauri.
#[tauri::command]
#[deprecated = "file helper is redundant"]
pub fn dir_delete(path: &str) -> CultivationResult<()> {
  let path_buf = PathBuf::from(path);
  fs::remove_dir_all(path_buf).map_err(Into::into)
}

#[tauri::command]
pub fn are_files_identical(path1: &str, path2: &str) -> bool {
  diff(path1, path2)
}

// TODO: remove this file helper, already exists an api for this in tauri.
#[tauri::command]
#[deprecated = "file helper is redundant"]
pub fn copy_file(path: String, new_path: String) -> CultivationResult<()> {
  let filename = &path.split('/').last().unwrap();
  let path_buf = PathBuf::from(&path);

  // If the new path doesn't exist, create it.
  if !dir_exists(PathBuf::from(&new_path).pop().to_string().as_str()) {
    std::fs::create_dir_all(&new_path)?;
  }

  // Copy old to new
  std::fs::copy(path_buf, format!("{}/{}", new_path, filename))?;
  Ok(())
}

// TODO: remove this file helper, already exists an api for this in tauri.
#[tauri::command]
#[deprecated = "file helper is redundant"]
pub fn copy_file_with_new_name(
  path: String,
  new_path: String,
  new_name: String,
) -> CultivationResult<()> {
  let mut new_path_buf = PathBuf::from(&new_path);
  let path_buf = PathBuf::from(&path);

  // If the new path doesn't exist, create it.
  if !dir_exists(PathBuf::from(&new_path).pop().to_string().as_str()) {
    std::fs::create_dir_all(&new_path)?;
  }

  new_path_buf.push(new_name);

  // Copy old to new
  std::fs::copy(path_buf, &new_path_buf)?;

  Ok(())
}

// TODO: remove this file helper, already exists an api for this in tauri.
#[tauri::command]
#[deprecated = "file helper is redundant"]
pub fn delete_file(path: String) -> CultivationResult<()> {
  let path_buf = PathBuf::from(&path);

  std::fs::remove_file(path_buf).map_err(Into::into)
}

// TODO: remove this file helper, already exists an api for this in tauri.
#[tauri::command]
#[deprecated = "file helper is redundant"]
pub fn read_file(path: String) -> CultivationResult<String> {
  let path_buf = PathBuf::from(&path);

  let mut file = fs::File::open(path_buf)?;

  let mut contents = String::new();
  file.read_to_string(&mut contents).unwrap();

  Ok(contents)
}

// TODO: remove this file helper, already exists an api for this in tauri.
#[tauri::command]
#[deprecated = "file helper is redundant"]
pub fn write_file(path: String, contents: String) -> CultivationResult<()> {
  let path_buf = PathBuf::from(&path);

  // Create file if it exists, otherwise just open and rewrite
  let mut file = fs::File::create(path_buf)?;

  // Write contents to file
  file.write_all(contents.as_bytes()).map_err(Into::into)
}
