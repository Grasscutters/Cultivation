use ini::Ini;
use std::path::PathBuf;
use std::process::Command;

#[cfg(windows)]
use std::ffi::OsStr;
#[cfg(windows)]
use {
  registry::{Data, Hive, Security},
  windows_service::service::{ServiceAccess, ServiceState::Stopped},
  windows_service::service_manager::{ServiceManager, ServiceManagerAccess},
};

#[cfg(target_os = "linux")]
use crate::AAGL_THREAD;
#[cfg(target_os = "linux")]
use anime_launcher_sdk::{
  config::ConfigExt, genshin::config::Config, genshin::game, genshin::states::LauncherState,
  wincompatlib::prelude::*,
};
#[cfg(target_os = "linux")]
use std::{path::Path, process::Stdio, thread};
#[cfg(target_os = "linux")]
use term_detect::get_terminal;

#[cfg(target_os = "linux")]
fn guess_user_terminal() -> String {
  if let Ok(term) = get_terminal() {
    return term.0;
  }
  eprintln!("Could not guess default terminal. Try setting the $TERMINAL environment variable.");
  // If everything fails, default to xterm
  "xterm".to_string()
}

#[cfg(target_os = "linux")]
fn rawstrcmd(cmd: &Command) -> String {
  format!("{:?}", cmd)
}

#[cfg(target_os = "linux")]
fn strcmd(cmd: &Command) -> String {
  format!("bash -c {:?}", rawstrcmd(cmd))
}

#[cfg(target_os = "linux")]
pub trait AsRoot {
  fn as_root(&self) -> Self;
  fn as_root_gui(&self) -> Self;
}

#[cfg(target_os = "linux")]
impl AsRoot for Command {
  fn as_root(&self) -> Self {
    let mut cmd = Command::new("sudo");
    cmd.arg("--").arg("bash").arg("-c").arg(rawstrcmd(self));
    cmd
  }
  fn as_root_gui(&self) -> Self {
    let mut cmd = Command::new("pkexec");
    cmd.arg("bash").arg("-c").arg(rawstrcmd(self));
    cmd
  }
}

#[cfg(target_os = "linux")]
trait InTerminalEmulator {
  fn in_terminal(&self) -> Self;
  fn in_terminal_noclose(&self) -> Self;
}
#[cfg(target_os = "linux")]
impl InTerminalEmulator for Command {
  fn in_terminal(&self) -> Self {
    let mut cmd = Command::new(guess_user_terminal());
    cmd.arg("-e").arg(strcmd(self));
    cmd
  }
  fn in_terminal_noclose(&self) -> Self {
    let mut cmd = Command::new(guess_user_terminal());
    cmd.arg("--noclose");
    cmd.arg("-e").arg(strcmd(self));
    cmd
  }
}

#[cfg(target_os = "linux")]
pub trait SpawnItsFineReally {
  fn spawn_its_fine_really(&mut self, msg: &str) -> anyhow::Result<()>;
}

#[cfg(target_os = "linux")]
impl SpawnItsFineReally for Command {
  fn spawn_its_fine_really(&mut self, msg: &str) -> anyhow::Result<()> {
    let res = self.status();
    let Ok(status) = res else {
      let error = res.unwrap_err();
      println!("{}: {}", msg, &error);
      return Err(error.into());
    };
    if !status.success() {
      println!("{}: {}", msg, status);
      Err(anyhow::anyhow!("{}: {}", msg, status))
    } else {
      Ok(())
    }
  }
}

#[tauri::command]
pub fn run_program(path: String, args: Option<String>) {
  // Without unwrap_or, this can crash when UAC prompt is denied
  match open::with(
    format!("{} {}", path, args.unwrap_or_else(|| "".into())),
    path.clone(),
  ) {
    Ok(_) => (),
    Err(e) => println!("Failed to open program ({}): {}", &path, e),
  };
}

#[cfg(target_os = "windows")]
#[tauri::command]
pub fn run_program_relative(path: String, args: Option<String>) {
  // Save the current working directory
  let cwd = std::env::current_dir().unwrap();

  // Set the new working directory to the path before the executable
  let mut path_buf = std::path::PathBuf::from(&path);
  path_buf.pop();

  // Set new working directory
  std::env::set_current_dir(&path_buf).unwrap();

  // Without unwrap_or, this can crash when UAC prompt is denied
  open::that(format!("{} {}", &path, args.unwrap_or_else(|| "".into()))).unwrap_or(());

  // Restore the original working directory
  std::env::set_current_dir(cwd).unwrap();
}

#[cfg(target_os = "linux")]
#[tauri::command]
pub fn run_program_relative(path: String, args: Option<String>) {
  // This program should not run as root
  run_un_elevated(path, args)
}

#[tauri::command]
pub fn run_command(program: &str, args: Vec<&str>, relative: Option<bool>) {
  let prog = program.to_string();
  let args = args.iter().map(|s| s.to_string()).collect::<Vec<String>>();

  // Commands should not block (this is for the reshade injector mostly)
  std::thread::spawn(move || {
    // Save the current working directory
    let cwd = std::env::current_dir().unwrap();

    if relative.unwrap_or(false) {
      // Set the new working directory to the path before the executable
      let mut path_buf = std::path::PathBuf::from(&prog);
      path_buf.pop();

      // Set new working directory
      std::env::set_current_dir(&path_buf).unwrap();
    }

    // Run the command
    let mut command = Command::new(&prog);
    command.args(&args);
    command.spawn().unwrap();

    // Restore the original working directory
    std::env::set_current_dir(cwd).unwrap();
  });
}

#[tauri::command]
pub fn run_jar(path: String, execute_in: String, java_path: String) {
  let command = if java_path.is_empty() {
    format!("java -jar \"{}\"", path)
  } else {
    format!("\"{}\" -jar \"{}\"", java_path, path)
  };

  println!("Launching .jar with command: {}", &command);

  // Open the program from the specified path.
  #[cfg(not(target_os = "linux"))]
  match open::with(
    format!("/k cd /D \"{}\" & {}", &execute_in, &command),
    "C:\\Windows\\System32\\cmd.exe",
  ) {
    Ok(_) => (),
    Err(e) => println!("Failed to open jar ({} from {}): {}", &path, &execute_in, e),
  };
  #[cfg(target_os = "linux")]
  thread::spawn(move || {
    match Command::new(guess_user_terminal())
      .arg("-e")
      .arg(command)
      .current_dir(execute_in.clone())
      .spawn()
    {
      Ok(mut handler) => {
        // Prevent creation of zombie processes
        handler
          .wait()
          .expect("Grasscutter exited with non-zero exit code");
      }
      Err(e) => println!("Failed to open jar ({} from {}): {}", &path, &execute_in, e),
    }
  });
}

#[cfg(not(target_os = "linux"))]
#[tauri::command]
pub fn run_jar_root(_path: String, _execute_in: String, _java_path: String) {
  panic!("Not implemented");
}

#[cfg(target_os = "linux")]
#[tauri::command]
pub fn run_jar_root(path: String, execute_in: String, java_path: String) {
  let mut command = if java_path.is_empty() {
    Command::new("java")
  } else {
    Command::new(java_path)
  };
  command.arg("-jar").arg(&path).current_dir(&execute_in);

  println!("Launching .jar with command: {}", strcmd(&command));

  // Open the program from the specified path.
  thread::spawn(move || {
    match command.as_root_gui().in_terminal().spawn() {
      Ok(mut handler) => {
        // Prevent creation of zombie processes
        handler
          .wait()
          .expect("Grasscutter exited with non-zero exit code");
      }
      Err(e) => println!("Failed to open jar ({} from {}): {}", &path, &execute_in, e),
    }
  });
}

#[cfg(target_os = "windows")]
#[tauri::command]
pub fn run_un_elevated(path: String, args: Option<String>) {
  // Open the program non-elevated.
  match open::with(
    format!(
      "cmd /min /C \"set __COMPAT_LAYER=RUNASINVOKER && start \"\" \"{}\"\" {}",
      path,
      args.unwrap_or_else(|| "".into())
    ),
    "C:\\Windows\\System32\\cmd.exe",
  ) {
    Ok(_) => (),
    Err(e) => println!("Failed to open program ({}): {}", &path, e),
  };
}

#[cfg(target_os = "linux")]
fn aagl_wine_run<P: AsRef<Path>>(path: P, args: Option<String>) -> Command {
  let config = Config::get().unwrap();
  let wine = config.get_selected_wine().unwrap().unwrap();
  let wine_run = wine
    .to_wine(
      config.components.path,
      Some(config.game.wine.builds.join(&wine.name)),
    )
    .with_prefix(config.game.wine.prefix)
    .with_loader(WineLoader::Current)
    .with_arch(WineArch::Win64);
  let env: Vec<(String, String)> = config
    .game
    .wine
    .sync
    .get_env_vars()
    .clone()
    .into_iter()
    .map(|(k, v)| (k.to_string(), v.to_string()))
    .collect();
  use anime_launcher_sdk::components::wine::UnifiedWine::*;
  let wined = match wine_run {
    Default(wine) => wine,
    Proton(proton) => proton.wine().clone(),
  };
  let mut cmd = Command::new(&wined.binary);
  cmd.arg(path.as_ref()).envs(wined.get_envs()).envs(env);
  if let Some(args) = args {
    let mut args: Vec<String> = args.split(' ').map(|x| x.to_string()).collect();
    cmd.args(&mut args);
  };
  cmd
}

#[cfg(target_os = "linux")]
#[tauri::command]
pub fn run_un_elevated(path: String, args: Option<String>) {
  let path = Path::new(&path);
  let exec_name = path.file_name().unwrap().to_str().unwrap();
  if exec_name == ["Yuan", "Shen", ".exe"].join("").as_str()
    || exec_name == ["Gen", "shin", "Impact", ".exe"].join("").as_str()
  {
    let game_thread = thread::spawn(|| {
      'statechk: {
        let state = LauncherState::get_from_config(|_| {});
        let Ok(state) = state else {
          println!("Failed to get state: {}", state.unwrap_err());
          break 'statechk;
        };
        use anime_launcher_sdk::genshin::states::LauncherState::*;
        match state {
          FolderMigrationRequired { from, .. } => Err(format!(
            "A folder migration is required ({:?} needs to be moved)",
            from
          )),
          WineNotInstalled => Err("Wine is not installed".to_string()),
          PrefixNotExists => Err("The Wine prefix does not exist".to_string()),
          GameNotInstalled(_) => Err("The game is not installed".to_string()),
          _ => Ok(()),
        }
        .expect("Can't launch game. Check the other launcher.");
      }
      if let Err(e) = game::run() {
        println!("An error occurred while running the game: {}", e);
      }
    });
    {
      let mut game_thead_lock = AAGL_THREAD.lock().unwrap();
      game_thead_lock.replace(game_thread);
    }
    return;
  }
  // Run exe with wine
  if path.extension().unwrap() == "exe" {
    let path = path.to_owned().clone();
    thread::spawn(move || {
      let _ = aagl_wine_run(&path, args)
        .current_dir(path.parent().unwrap())
        .in_terminal()
        .spawn_its_fine_really(&format!(
          "Failed to open program ({})",
          path.to_str().unwrap()
        ));
    });
  }
  println!(
    "Can't run {:?}. Running this type of file is not supported yet.",
    path
  );
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

  #[cfg(windows)]
  {
    // Get the path to the executable.
    exe_path.pop();

    return exe_path.to_str().unwrap().to_string();
  }
  #[cfg(target_os = "linux")]
  {
    let bin_name = exe_path.file_name().unwrap().to_str().unwrap().to_string();
    exe_path.pop();
    if exe_path.starts_with("/usr/bin") {
      let mut path = PathBuf::from("/usr/lib");
      path.push(bin_name);
      path
    } else {
      exe_path
    }
    .to_str()
    .unwrap()
    .to_string()
  }
}

#[tauri::command]
pub fn set_migoto_delay(migoto_path: String) -> bool {
  let mut migoto_pathbuf = PathBuf::from(migoto_path);

  migoto_pathbuf.pop();
  migoto_pathbuf.push("d3dx.ini");

  let mut conf = match Ini::load_from_file(&migoto_pathbuf) {
    Ok(c) => {
      println!("Loaded migoto ini");
      c
    }
    Err(e) => {
      println!("Error loading migoto config: {}", e);
      return false;
    }
  };

  // Set options
  conf.with_section(Some("Loader")).set("delay", "20");
  conf
    .with_section(Some("Include"))
    .set("include", "ShaderFixes\\help.ini");

  // Write file
  match conf.write_to_file_opt(
    &migoto_pathbuf,
    ini::WriteOption {
      escape_policy: (ini::EscapePolicy::Nothing),
      line_separator: (ini::LineSeparator::SystemDefault),
    },
  ) {
    Ok(_) => {
      println!("Wrote delay!");
      true
    }
    Err(e) => {
      println!("Error writing delay: {}", e);
      false
    }
  }
}

#[cfg(windows)]
#[tauri::command]
pub fn wipe_registry(exec_name: String) {
  // Fetch the 'Internet Settings' registry key.
  let settings =
    match Hive::CurrentUser.open(format!("Software\\miHoYo\\{}", exec_name), Security::Write) {
      Ok(s) => s,
      Err(e) => {
        println!("Error getting registry setting: {}", e);
        return;
      }
    };

  // Wipe login cache
  match settings.set_value(
    "MIHOYOSDK_ADL_PROD_OVERSEA_h1158948810",
    &Data::String("".parse().unwrap()),
  ) {
    Ok(_) => (),
    Err(e) => println!("Error wiping registry: {}", e),
  }

  match settings.set_value(
    "MIHOYOSDK_ADL_PROD_CN_h3123967166",
    &Data::String("".parse().unwrap()),
  ) {
    Ok(_) => (),
    Err(e) => println!("Error wiping registry: {}", e),
  }

  let hsr_settings =
    match Hive::CurrentUser.open(format!("Software\\Cognosphere\\Star Rail"), Security::Write) {
      Ok(s) => s,
      Err(e) => {
        println!("Error getting registry setting: {}", e);
        return;
      }
    };

  match hsr_settings.set_value(
    "MIHOYOSDK_ADL_PROD_OVERSEA_h1158948810",
    &Data::String("".parse().unwrap()),
  ) {
    Ok(_) => (),
    Err(e) => println!("Error wiping registry: {}", e),
  }
}

#[cfg(windows)]
#[tauri::command]
pub fn service_status(service: String) -> bool {
  let manager = match ServiceManager::local_computer(None::<&str>, ServiceManagerAccess::CONNECT) {
    Ok(manager) => manager,
    Err(_e) => return false,
  };
  let my_service = match manager.open_service(service.clone(), ServiceAccess::QUERY_STATUS) {
    Ok(my_service) => my_service,
    Err(_e) => {
      println!("{} service not found! Not installed?", service);
      return false;
    }
  };
  let status_result = my_service.query_status();
  if let Ok(..) = status_result {
    let status = status_result.unwrap();
    println!("{} service status: {:?}", service, status.current_state);
    if status.current_state == Stopped {
      // Start the service if it is stopped
      start_service(service);
    }
    true
  } else {
    false
  }
}

#[cfg(target_os = "linux")]
fn to_linux_service_name(service: &str) -> Option<String> {
  Some(format!(
    "{}.service",
    match service {
      "MongoDB" => "mongod",
      _ => return None,
    }
  ))
}

#[cfg(target_os = "linux")]
#[tauri::command]
pub fn service_status(service: String) -> bool {
  // Change Windows service name into Linux service name
  let service_lnx = to_linux_service_name(&service);
  if service_lnx.is_none() {
    return false;
  }
  let service_lnx = service_lnx.unwrap();
  let status = Command::new("systemctl")
    .arg("is-active")
    .arg(service_lnx)
    .stdout(Stdio::null())
    .status();
  if status.is_err() {
    return false;
  }
  let status = status.unwrap().success();
  if status {
    status
  } else {
    start_service(service)
  }
}

#[cfg(windows)]
#[tauri::command]
pub fn start_service(service: String) -> bool {
  println!("Starting service: {}", service);
  let manager = match ServiceManager::local_computer(None::<&str>, ServiceManagerAccess::CONNECT) {
    Ok(manager) => manager,
    Err(_e) => return false,
  };
  let my_service = match manager.open_service(service, ServiceAccess::START) {
    Ok(my_service) => my_service,
    Err(_e) => return false,
  };
  match my_service.start(&[OsStr::new("Started service!")]) {
    Ok(_s) => true,
    Err(_e) => return false,
  };
  true
}

#[cfg(target_os = "linux")]
#[tauri::command]
pub fn start_service(service: String) -> bool {
  println!("Starting service: {}", service);
  let service_lnx = to_linux_service_name(&service);
  if service_lnx.is_none() {
    return false;
  }
  let service_lnx = service_lnx.unwrap();
  Command::new("systemctl")
    .arg("start")
    .arg(service_lnx)
    .spawn_its_fine_really(&format!("Failed to stop service {}", service))
    .is_ok()
}

#[cfg(windows)]
#[tauri::command]
pub fn stop_service(service: String) -> bool {
  println!("Stopping service: {}", service);
  let manager = match ServiceManager::local_computer(None::<&str>, ServiceManagerAccess::CONNECT) {
    Ok(manager) => manager,
    Err(_e) => return false,
  };
  let my_service = match manager.open_service(service, ServiceAccess::STOP) {
    Ok(my_service) => my_service,
    Err(_e) => return false,
  };
  match my_service.stop() {
    Ok(_s) => true,
    Err(_e) => return false,
  };
  true
}

#[cfg(target_os = "linux")]
#[tauri::command]
pub fn stop_service(service: String) -> bool {
  println!("Stopping service: {}", service);
  let service_lnx = to_linux_service_name(&service);
  if service_lnx.is_none() {
    return false;
  }
  let service_lnx = service_lnx.unwrap();
  Command::new("systemctl")
    .arg("stop")
    .arg(service_lnx)
    .spawn_its_fine_really(&format!("Failed to start service {}", service))
    .is_ok()
}

#[cfg(target_os = "linux")]
#[tauri::command]
pub fn wipe_registry(exec_name: String) {
  println!("Wiping registry");
  let regpath = format!("HKCU\\Software\\miHoYo\\{}", exec_name);
  let mut cmd = aagl_wine_run("reg", None);
  cmd.args([
    "DELETE",
    &regpath,
    "/f",
    "/v",
    "MIHOYOSDK_ADL_PROD_OVERSEA_h1158948810",
  ]);
  let _ = cmd.spawn_its_fine_really("Error wiping registry");
}

#[cfg(target_os = "macos")]
#[tauri::command]
pub fn wipe_registry(_exec_name: String) {}

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

#[tauri::command]
pub fn get_platform() -> &'static str {
  std::env::consts::OS
}

#[cfg(not(target_os = "linux"))]
#[tauri::command]
pub async fn jvm_add_cap(_java_path: String) -> bool {
  panic!("Not implemented");
}

#[cfg(not(target_os = "linux"))]
#[tauri::command]
pub async fn jvm_remove_cap(_java_path: String) -> bool {
  panic!("Not implemented");
}

#[cfg(target_os = "linux")]
#[tauri::command]
pub async fn jvm_add_cap(java_path: String) -> bool {
  let mut java_bin = if java_path.is_empty() {
    which::which("java").expect("Java is not installed")
  } else {
    PathBuf::from(&java_path)
  };
  while java_bin.is_symlink() {
    java_bin = java_bin.read_link().unwrap()
  }
  println!("Removing cap on {:?}", &java_bin);
  Command::new("setcap")
    .arg("CAP_NET_BIND_SERVICE=+eip")
    .arg(java_bin)
    .as_root_gui()
    .spawn_its_fine_really(&format!("Failed to add cap to {}", java_path))
    .is_ok()
}

#[cfg(target_os = "linux")]
#[tauri::command]
pub async fn jvm_remove_cap(java_path: String) -> bool {
  let mut java_bin = if java_path.is_empty() {
    which::which("java").expect("Java is not installed")
  } else {
    PathBuf::from(&java_path)
  };
  while java_bin.is_symlink() {
    java_bin = java_bin.read_link().unwrap()
  }
  println!("Setting cap on {:?}", &java_bin);
  Command::new("setcap")
    .arg("-r")
    .arg(java_bin)
    .as_root_gui()
    .spawn_its_fine_really(&format!("Failed to remove cap from {}", java_path))
    .is_ok()
}
