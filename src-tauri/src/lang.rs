#[tauri::command]
pub async fn get_lang(window: tauri::Window, lang: String) -> String {
  let lang = lang.to_lowercase();

  // Send contents of language file back
  let contents = match std::fs::read_to_string(format!("../lang/{}.json", lang)) {
    Ok(x) => x,
    Err(e) => {
      emit_lang_err(window, format!("Failed to read language file: {}", e));
      return "".to_string();
    }
  };

  return contents;
}

pub fn emit_lang_err(window: tauri::Window, msg: std::string::String) {
  let mut res_hash = std::collections::HashMap::new();

  res_hash.insert(
      "error".to_string(),
      msg.to_string()
  );

  window.emit("lang_error", &res_hash).unwrap();
}