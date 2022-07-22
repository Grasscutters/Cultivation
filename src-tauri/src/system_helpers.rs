use duct::cmd;

#[tauri::command]
pub fn run_program(path: String) {
  // Without unwrap_or, this can crash when UAC prompt is denied
  open::that(&path).unwrap_or(());
}

#[tauri::command]
pub fn run_program_relative(path: String) {
  // Save the current working directory
  let cwd = std::env::current_dir().unwrap();

  // Set the new working directory to the path before the executable
  let mut path_buf = std::path::PathBuf::from(&path);
  path_buf.pop();

  // Set new working directory
  std::env::set_current_dir(&path_buf).unwrap();

  // Without unwrap_or, this can crash when UAC prompt is denied
  open::that(&path).unwrap_or(());

  // Restore the original working directory
  std::env::set_current_dir(&cwd).unwrap();
}

#[tauri::command]
pub fn run_command(program: &str, args: Vec<&str>) {
  cmd(program, args).run().expect("Failed to run command");
}

#[tauri::command]
pub fn run_jar(path: String, execute_in: String, java_path: String) {
  let command = if java_path.is_empty() {
    format!("java -jar \"{}\"", path)
  } else {
    format!("\"{}\" -jar \"{}\"", java_path, path)
  };

  // Open the program from the specified path.
  match open::with(
    format!("/k cd /D \"{}\" & {}", &execute_in, &command),
    "C:\\Windows\\System32\\cmd.exe",
  ) {
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

#[cfg(windows)]
#[tauri::command]
pub fn is_elevated() -> bool {
  is_elevated::is_elevated()
}

#[cfg(unix)]
#[tauri::command]
pub fn is_elevated() -> bool {
  sudo::check() == sudo::RunningAs::Root
}
