// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::create_dir;

mod http;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            http::download_file
        ])
        .setup(|app| {
            // Create base directories.
            let app_data_dir = app.path_resolver()
                .app_data_dir()
                .expect("Failed to get app data directory");

            let background_directory = app_data_dir.join("bg");
            if !background_directory.exists() {
                create_dir(background_directory.as_path())
                    .expect("Failed to create app data directory");
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
