use crate::{error::CultivationResult, system_helpers::*};
use std::{
  collections::HashMap,
  path::{Path, PathBuf},
};

#[tauri::command]
pub async fn get_lang(_window: tauri::Window, lang: String) -> CultivationResult<String> {
  let lang = lang.to_lowercase();

  // Send contents of language file back
  let lang_path: PathBuf = [&install_location(), "lang", &format!("{}.json", lang)]
    .iter()
    .collect();
  std::fs::read_to_string(lang_path).map_err(Into::into)
}

#[tauri::command]
pub fn get_languages() -> CultivationResult<HashMap<String, String>> {
  // for each lang file, set the key as the filename and the value as the
  // lang_name contained in the file
  let mut languages = HashMap::new();

  let lang_files = std::fs::read_dir(Path::new(&install_location()).join("lang"))?;

  for entry in lang_files {
    let entry = entry?;
    let path = entry.path();
    let filename = path.file_name().unwrap().to_str().unwrap();

    let content = std::fs::read_to_string(&path)?;

    languages.insert(filename.to_string(), content);
  }

  Ok(languages)
}
