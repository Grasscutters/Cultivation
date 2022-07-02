use std::path::{Path, PathBuf};
use crate::system_helpers::*;

#[tauri::command]
pub async fn get_lang(window: tauri::Window, lang: String) -> String {
  let lang = lang.to_lowercase();

  // Send contents of language file back
  let lang_path: PathBuf = [&install_location(), "lang", &format!("{}.json", lang)].iter().collect();
  let contents = match std::fs::read_to_string(&lang_path) {
    Ok(x) => x,
    Err(e) => {
      emit_lang_err(window, format!("Failed to read language file: {}", e));
      return "".to_string();
    }
  };

  return contents;
}

#[tauri::command]
pub async fn get_languages() -> std::collections::HashMap<String, String> {
  // for each lang file, set the key as the filename and the value as the lang_name contained in the file
  let mut languages = std::collections::HashMap::new();

  let mut lang_files = std::fs::read_dir(Path::new(&install_location()).join("lang")).unwrap();

  while let Some(entry) = lang_files.next() {
    let entry = entry.unwrap();
    let path = entry.path();
    let filename = path.file_name().unwrap().to_str().unwrap();

    let content = match std::fs::read_to_string(&path) {
      Ok(x) => x,
      Err(e) => {
        println!("Failed to read language file: {}", e);
        break;
      }
    };

    languages.insert(filename.to_string(), content);
  }

  return languages;
}

pub fn emit_lang_err(window: tauri::Window, msg: std::string::String) {
  let mut res_hash = std::collections::HashMap::new();

  res_hash.insert(
    "error".to_string(),
    msg.to_string(),
  );

  window.emit("lang_error", &res_hash).unwrap();
}