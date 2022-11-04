use crate::{error::CultivationResult, system_helpers::*};
use std::{
  path::{Path, PathBuf},
  str::FromStr,
};
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Deserialize, Serialize)]
#[serde(transparent)]
pub struct LanguageObject(serde_json::Map<String, serde_json::Value>);

#[tauri::command]
pub async fn get_lang(window: tauri::Window, lang: String) -> CultivationResult<LanguageObject> {
  let lang = lang.to_lowercase();

  // Send contents of language file back
  let lang_path: PathBuf = [&install_location(), "lang", &format!("{}.json", lang)]
    .into_iter()
    .collect();

  let string = tokio::fs::read_to_string(lang_path).await?;

  serde_json::from_str(&string).map_err(Into::into)
}

#[tauri::command]
pub async fn get_languages() -> CultivationResult<DashMap<String, String>> {
  // for each lang file, set the key as the filename and the value as the
  // lang_name contained in the file
  let mut languages = DashMap::new();

  let mut lang_files = tokio::fs::read_dir(Path::new(&install_location()).join("lang")).await?;

  while let Some(entry) = lang_files.next_entry().await? {
    let path = entry.path();
    let filename = path.file_name().unwrap().to_str().unwrap();

    let content = match tokio::fs::read_to_string(&path).await {
      Ok(x) => x,
      Err(e) => {
        println!("Failed to read language file: {}", e);
        break;
      }
    };

    languages.insert(filename.to_string(), content);
  }

  Ok(languages)
}
