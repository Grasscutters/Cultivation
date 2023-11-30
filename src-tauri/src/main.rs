// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::create_dir;
use tauri::Manager;
use window_shadows::set_shadow;

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

            // Enable window shadows.
            let main_window = app.get_window("main")
                .expect("Unable to fetch Tauri window.");
            #[cfg(any(windows, target_os = "macos"))]
            set_shadow(&main_window, true).unwrap();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
