#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use once_cell::sync::Lazy;
use std::{collections::HashMap, sync::Mutex};

use std::thread;
use structs::APIQuery;
use sysinfo::{System, SystemExt};

mod downloader;
mod file_helpers;
mod gamebanana;
mod lang;
mod metadata_patcher;
mod proxy;
mod structs;
mod system_helpers;
mod unzip;
mod web;

static WATCH_GAME_PROCESS: Lazy<Mutex<String>> = Lazy::new(|| Mutex::new(String::new()));

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      enable_process_watcher,
      connect,
      disconnect,
      req_get,
      get_bg_file,
      is_game_running,
      get_theme_list,
      system_helpers::run_command,
      system_helpers::run_program,
      system_helpers::run_program_relative,
      system_helpers::run_jar,
      system_helpers::open_in_browser,
      system_helpers::install_location,
      system_helpers::is_elevated,
      proxy::set_proxy_addr,
      proxy::generate_ca_files,
      unzip::unzip,
      file_helpers::rename,
      file_helpers::dir_create,
      file_helpers::dir_exists,
      file_helpers::dir_is_empty,
      file_helpers::dir_delete,
      file_helpers::copy_file,
      file_helpers::copy_file_with_new_name,
      file_helpers::delete_file,
      file_helpers::are_files_identical,
      file_helpers::read_file,
      file_helpers::write_file,
      downloader::download_file,
      downloader::stop_download,
      lang::get_lang,
      lang::get_languages,
      web::valid_url,
      web::web_get,
      gamebanana::list_submissions,
      metadata_patcher::patch_metadata
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn is_game_running() -> bool {
  // Grab the game process name
  let proc = WATCH_GAME_PROCESS.lock().unwrap().to_string();

  !proc.is_empty()
}

#[tauri::command]
fn enable_process_watcher(window: tauri::Window, process: String) {
  *WATCH_GAME_PROCESS.lock().unwrap() = process;

  window.listen("disable_process_watcher", |_e| {
    *WATCH_GAME_PROCESS.lock().unwrap() = "".to_string();
  });

  println!("Starting process watcher...");

  thread::spawn(move || {
    let mut system = System::new_all();

    loop {
      thread::sleep(std::time::Duration::from_secs(5));

      // Refresh system info
      system.refresh_all();

      // Grab the game process name
      let proc = WATCH_GAME_PROCESS.lock().unwrap().to_string();

      if !proc.is_empty() {
        let mut proc_with_name = system.processes_by_exact_name(&proc);
        let exists = proc_with_name.next().is_some();

        // If the game process closes, disable the proxy.
        if !exists {
          println!("Game closed");

          *WATCH_GAME_PROCESS.lock().unwrap() = "".to_string();
          disconnect();

          window.emit("game_closed", &()).unwrap();
          break;
        }
      }
    }
  });
}

#[tauri::command]
async fn connect(port: u16, certificate_path: String) {
  // Log message to console.
  println!("Connecting to proxy...");

  // Change proxy settings.
  proxy::connect_to_proxy(port);

  // Create and start a proxy.
  proxy::create_proxy(port, certificate_path).await;
}

#[tauri::command]
fn disconnect() {
  // Log message to console.
  println!("Disconnecting from proxy...");

  // Change proxy settings.
  proxy::disconnect_from_proxy();
}

#[tauri::command]
async fn req_get(url: String) -> String {
  // Send a GET request to the specified URL and send the response body back to the client.
  web::query(&url.to_string()).await
}

#[tauri::command]
async fn get_theme_list(data_dir: String) -> Vec<HashMap<String, String>> {
  let theme_loc = format!("{}/themes", data_dir);

  // Ensure folder exists
  if !std::path::Path::new(&theme_loc).exists() {
    std::fs::create_dir_all(&theme_loc).unwrap();
  }

  // Read each index.json folder in each theme folder
  let mut themes = Vec::new();

  for entry in std::fs::read_dir(&theme_loc).unwrap() {
    let entry = entry.unwrap();
    let path = entry.path();

    if path.is_dir() {
      let index_path = format!("{}/index.json", path.to_str().unwrap());

      if std::path::Path::new(&index_path).exists() {
        let theme_json = std::fs::read_to_string(&index_path).unwrap();

        let mut map = HashMap::new();

        map.insert("json".to_string(), theme_json);
        map.insert("path".to_string(), path.to_str().unwrap().to_string());

        // Push key-value pair containing "json" and "path"
        themes.push(map);
      }
    }
  }

  themes
}

#[tauri::command]
// TODO: Replace with downloading the background file & saving it.
async fn get_bg_file(bg_path: String, appdata: String) -> String {
  let copy_loc = appdata;
  let query = web::query("https://api.grasscutter.io/cultivation/query").await;
  let response_data: APIQuery = match serde_json::from_str(&query) {
    Ok(data) => data,
    Err(e) => {
      println!("Failed to parse response: {}", e);
      return "".to_string();
    }
  };

  let file_name = response_data.bg_file.to_string();

  // First we see if the file already exists in our local bg folder.
  if file_helpers::dir_exists(format!("{}\\bg\\{}", copy_loc, file_name).as_str()) {
    return format!("{}\\{}", copy_loc, response_data.bg_file.as_str());
  }

  // Now we check if the bg folder, which is one directory above the game_path, exists.
  let bg_img_path = format!("{}\\{}", &bg_path, &file_name);

  // If it doesn't, then we do not have backgrounds to grab.
  if !file_helpers::dir_exists(&bg_path) {
    return "".to_string();
  }

  // BG folder does exist, lets see if the image exists.
  if !file_helpers::dir_exists(&bg_img_path) {
    // Image doesn't exist
    return "".to_string();
  }

  // The image exists, lets copy it to our local '\bg' folder.
  let bg_img_path_local = format!("{}\\bg\\{}", copy_loc, file_name.as_str());

  match std::fs::copy(bg_img_path, bg_img_path_local) {
    Ok(_) => {
      // Copy was successful, lets return true.
      format!("{}\\{}", copy_loc, response_data.bg_file)
    }
    Err(e) => {
      // Copy failed, lets return false
      println!("Failed to copy background image: {}", e);
      "".to_string()
    }
  }
}
