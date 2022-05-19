use tauri;
use open;

#[tauri::command]
pub fn run_program(path: String) {
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
pub fn run_jar(path: String, execute_in: String, java_path: String) {
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
pub fn open_in_browser(url: String) {
  // Open the URL in the default browser.
  match open::that(url) {
    Ok(_) => (),
    Err(e) => println!("Failed to open URL: {}", e),
  };
}
