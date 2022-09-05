use std::process::exit;
use std::process::Command;

#[cfg(windows)]
pub fn reopen_as_admin() {
  let install = std::env::current_exe().unwrap();

  println!("Opening as admin: {}", install.to_str().unwrap());

  Command::new("powershell.exe")
    .arg("powershell")
    .arg(format!(
      "-command \"&{{Start-Process -filepath 'cmd' -argumentlist '/c \"{}\"' -verb runas}}\"",
      install.to_str().unwrap()
    ))
    .spawn()
    .expect("Error starting exec as admin");

  exit(0);
}

#[cfg(linux)]
pub fn reopen_as_admin() {}
