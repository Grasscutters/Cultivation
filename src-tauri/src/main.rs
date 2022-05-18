#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use lazy_static::lazy_static;
use std::sync::Mutex;

use std::thread;
use sysinfo::{System, SystemExt};

use open;
use structs::{APIQuery};

mod file_helpers;
mod unzip;
mod downloader;
mod lang;
mod proxy;
mod web;
mod structs;

lazy_static!{
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
      run_program,
      run_jar,
      open_in_browser,
      req_get,
      get_bg_file,
      proxy::set_proxy_addr,
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

  // Start in thread so as to not block the main thread.
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
      std::thread::sleep(std::time::Duration::from_secs(5));
    }
  });
}

#[tauri::command]
fn enable_process_watcher(process: String) {
  *WATCH_GAME_PROCESS.lock().unwrap() = process;
}

#[tauri::command]
async fn connect(port: u16) {
  // Log message to console.
  println!("Connecting to proxy...");

  // Change proxy settings.
  proxy::connect_to_proxy(port);

  // Create and start a proxy.
  proxy::create_proxy(port).await;
}

#[tauri::command]
fn disconnect() {
  // Log message to console.
  println!("Disconnecting from proxy...");

  // Change proxy settings.
  proxy::disconnect_from_proxy();
}

#[tauri::command]
fn run_program(path: String) {
  // Open the program from the specified path.
  // match open::that(path) {
  //   Ok(_) => (),
  //   Err(e) => println!("Failed to open program: {}", e),
  // };
  match open::with(format!("/c \"{}\"", &path), "C:\\Windows\\System32\\cmd.exe") {
    Ok(_) => (),
    Err(e) => println!("Failed to open program: {}", e),
  };
}

#[tauri::command]
fn run_jar(path: String, execute_in: String, java_path: String) {
  let command = if java_path.is_empty() {
    format!("java -jar {}", path)
  } else {
    format!("\"{}\" -jar {}", java_path, path)
  };

  // Open the program from the specified path.
  match open::with(format!("/k cd /D \"{}\" & {}", &execute_in, &command).to_string(), "C:\\Windows\\System32\\cmd.exe") {
    Ok(_) => (),
    Err(e) => println!("Failed to open jar ({} from {}): {}", &path, &execute_in, e),
  };
}

#[tauri::command]
fn open_in_browser(url: String) {
  // Open the URL in the default browser.
  match open::that(url) {
    Ok(_) => (),
    Err(e) => println!("Failed to open URL: {}", e),
  };
}

#[tauri::command]
async fn req_get(url: String) -> String {
  // Send a GET request to the specified URL.
  let response = web::query(&url.to_string()).await;

  // Send the response body back to the client.
  return response;
}

#[tauri::command]
async fn get_bg_file() -> String {
    let query = web::query("https://api.grasscutters.xyz/cultivation/query").await;
    let response_data: APIQuery = serde_json::from_str(&query).unwrap();
    return response_data.backgroundFile;
}