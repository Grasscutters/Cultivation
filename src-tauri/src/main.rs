#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod downloader;
mod proxy;

use tauri::{
  command
};
use opener;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![run_program])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn run_program(path: String) {
  opener::open(path.clone());
}

#[tauri::command]
fn connect() {
  
}