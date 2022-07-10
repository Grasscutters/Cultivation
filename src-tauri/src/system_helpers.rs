
use std::thread;
use tauri;
use open;
use duct::cmd;

use crate::file_helpers;

#[tauri::command]
pub fn run_program(path: String) {
  // Open the program from the specified path.

  // Open in new thread to prevent blocking.
  thread::spawn(move || {
    open::that(&path).unwrap();
  });
}

#[tauri::command]
pub fn run_command(program: &str, args: Vec<&str>) {
  cmd(program, args).run()
    .expect("Failed to run command");
}

#[tauri::command]
pub fn run_jar(path: String, execute_in: String, java_path: String) {
  let command = if java_path.is_empty() {
    format!("java -jar \"{}\"", path)
  } else {
    format!("\"{}\" -jar \"{}\"", java_path, path)
  };

  // Open the program from the specified path.
  match open::with(format!("/k cd /D \"{}\" & {}", &execute_in, &command).to_string(), "C:\\Windows\\System32\\cmd.exe") {
    Ok(_) => (),
    Err(e) => println!("Failed to open jar ({} from {}): {}", &path, &execute_in, e),
  };
}

#[tauri::command]
pub fn open_in_browser(url: String) {
  // Open the URL in the default browser.
  match open::that(url) {
    Ok(_) => (),
    Err(e) => println!("Failed to open URL: {}", e),
  };
}

#[tauri::command]
pub fn install_location() -> String {
  let mut exe_path = std::env::current_exe().unwrap();

  // Get the path to the executable.
  exe_path.pop();

  return exe_path.to_str().unwrap().to_string();
}

#[tauri::command]
pub fn is_elevated() -> bool {
  return is_elevated::is_elevated();
}