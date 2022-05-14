#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use std::process::Command;
use open;

mod downloader;
mod lang;
mod proxy;

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
fn run_jar(path: String) {
  // Open the program from the specified path.
  match open::with("/k java -jar ".to_string() + &path, "C:\\Windows\\System32\\cmd.exe") {
    Ok(_) => (),
    Err(e) => println!("Failed to open jar ({}): {}", &path, e),
  };
}