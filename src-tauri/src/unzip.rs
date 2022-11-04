use crate::error::CultivationResult;
use dashmap::DashMap;
use std::{fs::File as StdFile, path, path::PathBuf};
use tokio::fs::{create_dir_all, read_dir, remove_file, File, OpenOptions};
use tokio_util::sync::CancellationToken;
use unrar::archive::Archive;

#[tauri::command]
pub async fn unzip(
  window: tauri::Window,
  zipfile: String,
  destpath: String,
  top_level: Option<bool>,
  folder_if_loose: Option<bool>,
  cancellation_tokens: tauri::State<'_, DashMap<String, CancellationToken>>,
) -> CultivationResult<()> {
  let token = cancellation_tokens.get(&zipfile).unwrap();
  let path = zipfile.clone();
  let out = tokio::select! {
    _ = token.cancelled() => {
      println!("Cancelled unzip {path}");
      Ok(())
    },
    r = async move {
      let tokioF = File::open(&zipfile).await?;
      let f = tokioF.try_clone().await.unwrap().into_std().await;

      let write_path = path::PathBuf::from(&destpath);

      // Get a list of all current directories
      let mut dir_reader = read_dir(&write_path).await?;

      let mut dirs: Vec<PathBuf> = vec![];

      while let Some(entry) = dir_reader.next_entry().await? {
        let entry_path = entry.path();
        if entry_path.is_dir() {
          dirs.push(entry_path);
        }
      }

      let mut full_path = write_path.clone();

      window.emit("extract_start", &zipfile)?;

      if folder_if_loose.unwrap_or(false) {
        // Create a new folder with the same name as the zip file
        let file_name = path::Path::new(&zipfile).with_extension("");

        let new_path = full_path.join(file_name);
        create_dir_all(&new_path).await?;

        full_path = new_path;
      }

      println!("Is rar file? {}", zipfile.ends_with(".rar"));

      let name;
      let success;

      // If file ends in zip, OR is unknown, extract as zip, otherwise extract as rar
      if zipfile.ends_with(".rar") {
        success = extract_rar(&zipfile, &f, &full_path, top_level.unwrap_or(true));

        let archive = Archive::new(zipfile.clone());
        name = archive.list().unwrap().next().unwrap().unwrap().filename;
      } else {
        success = extract_zip(tokioF, &full_path).await;

        // Get the name of the inenr file in the zip file
        let mut zip = zip::ZipArchive::new(&f)?;
        let file = zip.by_index(0)?;
        name = file.name().to_string();
      }

      if !success {
        let res_hash = DashMap::with_capacity(1);

        res_hash.insert("path".to_string(), zipfile.to_string());

        window.emit("download_error", &res_hash)?;
      }

      // If the contents is a jar file, emit that we have extracted a new jar file
      if name.ends_with(".jar") {
        window.emit("jar_extracted", destpath.to_string() + name.as_str())?;
      }

      // Delete zip file
      remove_file(&zipfile).await?;

      // Get any new directory that could have been created
      let mut new_dir: String = String::new();

      let mut dir_reader = read_dir(&write_path).await?;

      while let Some(entry) = dir_reader.next_entry().await? {
        let entry_path = entry.path();
        if entry_path.is_dir() && !dirs.contains(&entry_path) {
          new_dir = entry_path.to_str().unwrap().to_string();
        }
      }

      let res_hash = DashMap::with_capacity(2);
      res_hash.insert("file", zipfile.to_string());
      res_hash.insert("new_folder", new_dir);

      window.emit("extract_end", &res_hash)?;

      Ok(())
    } => r
  };

  out
}

fn extract_rar(rarfile: &str, _f: &StdFile, full_path: &path::Path, _top_level: bool) -> bool {
  let archive = Archive::new(rarfile.to_string());

  let mut open_archive = archive
    .extract_to(full_path.to_str().unwrap().to_string())
    .unwrap();

  match open_archive.process() {
    Ok(_) => {
      println!(
        "Extracted rar file to: {}",
        full_path.to_str().unwrap_or("Error")
      );

      true
    }
    Err(e) => {
      println!("Failed to extract rar file: {}", e);
      false
    }
  }
}

fn sanitize_file_path(path: &str) -> PathBuf {
  path
    .replace('\\', "/")
    .split('/')
    .map(sanitize_filename::sanitize)
    .collect()
}

async fn extract_zip(f: File, full_path: &path::Path) -> bool {
  let mut reader = async_zip::read::seek::ZipFileReader::new(f).await.unwrap();

  for index in 0..reader.entries().len() {
    let entry = reader
      .entry_reader(index)
      .await
      .expect("Failed to read ZipEntry");
    let path = full_path.join(sanitize_file_path(entry.entry().filename()));
    let entry_is_dir = entry.entry().filename().ends_with('/');

    if entry_is_dir {
      if !path.exists() {
        create_dir_all(&path)
          .await
          .expect("Failed to create extracted directory");
      }
    } else {
      let parent = path
        .parent()
        .expect("A file entry should have parent directories");
      if !parent.is_dir() {
        create_dir_all(parent)
          .await
          .expect("Failed to create parent directories");
      }
      if path.exists() {
        tokio::fs::remove_file(&path).await.unwrap();
      }
      let mut writer = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&path)
        .await
        .expect("Failed to create extracted file");
      entry
        .copy_to_end_crc(&mut writer, 65536)
        .await
        .expect("Failed to copy to extracted file");
    }
  }

  true
}
