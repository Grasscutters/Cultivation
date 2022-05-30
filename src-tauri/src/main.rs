#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use lazy_static::lazy_static;
use std::sync::Mutex;

use std::thread;
use sysinfo::{System, SystemExt};
use structs::{APIQuery};

mod structs;
mod system_helpers;
mod file_helpers;
mod unzip;
mod downloader;
mod lang;
mod proxy;
mod web;

lazy_static! {
  static ref WATCH_GAME_PROCESS: Mutex<String> = {
      let m = "".to_string();
      Mutex::new(m)
  };
}

fn main() {
  process_watcher();

  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      enable_process_watcher,
      connect,
      disconnect,
      req_get,
      get_bg_file,
      base64_decode,
      system_helpers::run_command,
      system_helpers::run_program,
      system_helpers::run_jar,
      system_helpers::open_in_browser,
      proxy::set_proxy_addr,
      proxy::generate_ca_files,
      unzip::unzip,
      file_helpers::rename,
      file_helpers::dir_exists,
      downloader::download_file,
      downloader::stop_download,
      lang::get_lang,
      lang::get_languages
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn process_watcher() {
  // Every 5 seconds, see if the game process is still running.
  // If it is not, then we assume the game has closed and disable the proxy
  // to prevent any requests from being sent to the game.

  // Start a thread so as to not block the main thread.
  thread::spawn(|| {
    let mut s = System::new_all();

    loop {
      // Refresh system info
      s.refresh_all();

      // Grab the game process name
      let proc = WATCH_GAME_PROCESS.lock().unwrap().to_string();

      if !&proc.is_empty() {
        let proc_with_name = s.processes_by_exact_name(&proc);
        let mut exists = false;

        for _p in proc_with_name {
          exists = true;
          break;
        }

        // If the game process closes, disable the proxy.
        if !exists {
          *WATCH_GAME_PROCESS.lock().unwrap() = "".to_string();
          disconnect();
        }
      }
      thread::sleep(std::time::Duration::from_secs(5));
    }
  });
}

#[tauri::command]
fn enable_process_watcher(process: String) {
  *WATCH_GAME_PROCESS.lock().unwrap() = process;
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
  // Send a GET request to the specified URL.
  let response = web::query(&url.to_string()).await;

  // Send the response body back to the client.
  return response;
}

#[tauri::command]
async fn get_bg_file(bg_path: String) -> String {
  let query = web::query("https://api.grasscutters.xyz/cultivation/query").await;
  let response_data: APIQuery = match serde_json::from_str(&query) {
    Ok(data) => data,
    Err(e) => {
      println!("Failed to parse response: {}", e);
      return "".to_string();
    }
  };

  let file_name = response_data.bg_file.to_string();

  // First we see if the file already exists in our local bg folder.
  if file_helpers::dir_exists(format!(".\\bg\\{}", file_name).as_str()) {
    let cwd = std::env::current_dir().unwrap();
    return format!("{}\\{}", cwd.display(), response_data.bg_file.as_str());
  }

  // Now we check if the bg folder, which is one directory above the game_path, exists.
  let bg_img_path = format!("{}\\{}", bg_path.clone().to_string(), file_name.as_str());

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
  let bg_img_path_local = format!(".\\bg\\{}", file_name.as_str());

  return match std::fs::copy(bg_img_path, bg_img_path_local) {
    Ok(_) => {
      // Copy was successful, lets return true.
      let cwd = std::env::current_dir().unwrap();
      format!("{}\\{}", cwd.display(), response_data.bg_file.as_str())
    }
    Err(e) => {
      // Copy failed, lets return false
      println!("Failed to copy background image: {}", e);
      "".to_string()
    }
  };
}

#[tauri::command]
fn base64_decode(encoded: String) -> String {
  let decoded = base64::decode(&encoded).unwrap();
  return String::from_utf8(decoded).unwrap();
}