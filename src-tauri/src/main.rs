#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use open;

mod downloader;
mod lang;
mod proxy;
mod web;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      connect,
      disconnect,
      run_program,
      run_jar,
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

  // Create and start a proxy.
  proxy::create_proxy(port).await;

  // Change proxy settings.
  proxy::connect_to_proxy(port);
}

#[tauri::command]
fn disconnect() {
  // Change proxy settings.
  proxy::disconnect_from_proxy();
}

#[tauri::command]
fn run_program(path: String) {
  // Open the program from the specified path.
  match open::that(path) {
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
async fn get_bg_file() -> String {
    let query = web::query("https://api.grasscutters.xyz/cultivation/query").await;
    let response_data = object!json::parse(&query);
}