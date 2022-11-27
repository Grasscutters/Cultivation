use crate::{error::CultivationResult, system_helpers::*};
use dashmap::DashMap;
use std::path::{Path, PathBuf};
use tokio::fs;

#[tauri::command]
pub async fn get_lang(_window: tauri::Window, lang: String) -> CultivationResult<String> {
  let lang = lang.to_lowercase();

  // Send contents of language file back
  let lang_path: PathBuf = [&install_location(), "lang", &format!("{}.json", lang)]
    .iter()
    .collect();
  fs::read_to_string(lang_path).await.map_err(Into::into)
}

#[tauri::command]
pub async fn get_languages() -> CultivationResult<DashMap<String, String>> {
  // for each lang file, set the key as the filename and the value as the
  // lang_name contained in the file
  let languages = DashMap::new();

  let mut lang_files = fs::read_dir(Path::new(&install_location()).join("lang")).await?;

  while let Some(entry) = lang_files.next_entry().await? {
    let path = entry.path();
    let filename = path.file_name().unwrap().to_str().unwrap();

    let content = fs::read_to_string(&path).await?;

    languages.insert(filename.to_string(), content);
  }

  Ok(languages)
}
