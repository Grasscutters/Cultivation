#[cfg(windows)]
pub fn reopen_as_admin() {
  use std::process::{exit, Command};

  let install = std::env::current_exe().unwrap();

  println!("Opening as admin: {}", install.to_str().unwrap());

  Command::new("powershell.exe")
    .arg("powershell")
    .arg(format!(
      "-command \"&{{Start-Process -filepath '{}' -verb runas}}\"",
      install.to_str().unwrap()
    ))
    .spawn()
    .expect("Error starting exec as admin");

  exit(0);
}

#[cfg(target_os = "linux")]
pub fn reopen_as_admin() {}

#[cfg(target_os = "macos")]
pub fn reopen_as_admin() {}
