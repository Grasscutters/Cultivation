#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use open;
use tokio::sync::oneshot::Sender;
use structs::{APIQuery};

mod file_helpers;
mod unzip;
mod downloader;
mod lang;
mod proxy;
mod web;
mod structs;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      connect,
      disconnect,
      run_program,
      run_jar,
      unzip::unzip,
      file_helpers::rename,
      file_helpers::dir_exists,
      open_in_browser,
      req_get,
      get_bg_file,
      downloader::download_file,
      downloader::stop_download,
      lang::get_lang
    ])
    .run(tauri::generate_context!()) 
    .expect("error while running tauri application");
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
fn run_jar(path: String, execute_in: String) {
  // Open the program from the specified path.
  match open::with(format!("/k cd /D \"{}\" & java -jar {}", &execute_in, &path).to_string(), "C:\\Windows\\System32\\cmd.exe") {
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