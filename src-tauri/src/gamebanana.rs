use crate::{file_helpers, web};

use crate::error::CultivationResult;
use dashmap::DashMap;
use reqwest::Client;
use std::path::PathBuf;
use tokio::{fs::read_dir, io::AsyncReadExt};

static SITE_URL: &str = "https://gamebanana.com";

#[tauri::command]
pub async fn get_download_links(
  mod_id: String,
  client: tauri::State<'_, Client>,
) -> CultivationResult<String> {
  web::query(
    format!("{}/apiv9/Mod/{}/DownloadPage", SITE_URL, mod_id).as_str(),
    client.inner().clone(),
  )
  .await
}

#[tauri::command]
pub async fn list_submissions(
  mode: String,
  page: String,
  client: tauri::State<'_, Client>,
) -> CultivationResult<String> {
  web::query(
    format!(
      "{}/apiv9/Util/Game/Submissions?_idGameRow=8552&_nPage={}&_nPerpage=50&_sMode={}",
      SITE_URL, page, mode
    )
    .as_str(),
    client.inner().clone(),
  )
  .await
}

#[tauri::command]
pub async fn list_mods(path: String) -> CultivationResult<DashMap<String, String>> {
  let mut path_buf = PathBuf::from(path);

  // If the path includes a file, remove it
  if path_buf.file_name().is_some() {
    path_buf.pop();
  }

  // Ensure we are in the Mods folder
  path_buf.push("Mods");

  // Check if dir is empty
  if file_helpers::dir_is_empty(path_buf.to_str().unwrap()) {
    return Ok(DashMap::new());
  }

  let mut mod_info_files = vec![];
  let mod_info_strings = DashMap::new();

  let mut dir_reader = read_dir(path_buf).await?;

  while let Some(entry) = dir_reader.next_entry().await? {
    let path = entry.path();

    // Check each dir for a modinfo.json file
    if path.is_dir() {
      let mut mod_info_path = path.clone();
      mod_info_path.push("modinfo.json");
      if mod_info_path.exists() {
        // Push path AND file contents into the hashmap using path as key
        mod_info_files.push(mod_info_path.to_str().unwrap().to_string());
      } else {
        // No modinfo, but we can still push a JSON obj with the folder name
        mod_info_strings.insert(
          path.to_str().unwrap().to_string(),
          format!(
            "{{ \"name\": \"{}\" }}",
            path.file_name().unwrap().to_str().unwrap()
          ),
        );
      }
    }
  }

  // Read each modinfo.json file
  for mod_info_file in mod_info_files {
    let mut mod_info_string = String::new();

    // It is safe to unwrap here since we *know* that the file exists
    let mut file = tokio::fs::File::open(&mod_info_file).await?;
    file.read_to_string(&mut mod_info_string).await?;

    // Push into hashmap using path as key
    mod_info_strings.insert(mod_info_file, mod_info_string);
  }

  Ok(mod_info_strings)
}
