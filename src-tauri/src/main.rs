#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use tracing::log::error;
use opener;

mod proxy;

/**
 * Application shutdown handler.
 */
async fn shutdown_signal() {

}

fn main() {
  tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![run_program])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}

#[tauri::command]
async fn connect() {
  // Create a proxy instance.
  let proxy_server = proxy::create_proxy().await;

  // Create the proxy & listen for errors.
  let result = proxy_server.start(shutdown_signal()).await;
  if result {
    error!("Unable to start proxy");
  }

  // Change proxy settings.
  proxy::connect_to_proxy();
}

#[tauri::command]
fn disconnect() {
  // Change proxy settings.
  proxy::disconnect_from_proxy();
}

#[tauri::command]
fn test() {
  println!("test");
}

#[tauri::command]
fn run_program(path: String) {
  // Open the program from the specified path.
  opener::open(path.clone());
}