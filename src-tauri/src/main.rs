#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use args::{Args, ArgsError};
use file_helpers::dir_exists;

use once_cell::sync::Lazy;
use proxy::set_proxy_addr;
use std::fs;
use std::io::Write;
use std::{collections::HashMap, sync::Mutex};
use system_helpers::is_elevated;
use tauri::api::path::data_dir;
use tauri::async_runtime::block_on;

use std::thread;
use sysinfo::{Pid, ProcessExt, System, SystemExt};

use crate::admin::reopen_as_admin;

mod admin;
mod config;
mod downloader;
mod file_helpers;
mod gamebanana;
mod lang;
mod patch;
mod proxy;
mod release;
mod system_helpers;
mod unzip;
mod web;

static WATCH_GAME_PROCESS: Lazy<Mutex<String>> = Lazy::new(|| Mutex::new(String::new()));
static WATCH_GRASSCUTTER_PROCESS: Lazy<Mutex<String>> = Lazy::new(|| Mutex::new(String::new()));
static GC_PID: std::sync::Mutex<usize> = Mutex::new(696969);

fn try_flush() {
  std::io::stdout().flush().unwrap_or(())
}

async fn parse_args(inp: &Vec<String>) -> Result<Args, ArgsError> {
  let mut args = Args::new(
    "Cultivation",
    "Private server helper program for an Anime Game",
  );
  args.flag("h", "help", "Print various CLI args");
  args.flag("p", "proxy", "Start the proxy server");
  args.flag("G", "launch-game", "Launch the game");
  args.flag(
    "A",
    "no-admin",
    "Launch without requiring admin permissions",
  );
  args.flag(
    "g",
    "no-gui",
    "Run in CLI mode. Requires -A to be passed as well.",
  );
  args.flag("s", "server", "Launch the configured GC server");
  args.flag(
    "P",
    "patch",
    "Patch your game before launching, with whatever your game version needs",
  );
  args.flag(
    "N",
    "non-elevated-game",
    "Launch the game without admin permissions",
  );
  args.option(
    "H",
    "host",
    "Set host to connect to (eg. 'localhost:443' or 'my.awesomeserver.com:6969)",
    "SERVER_HOST",
    getopts::Occur::Optional,
    None,
  );
  args.option(
    "a",
    "game-args",
    "Arguments to pass to the game process, if launching it",
    r#""-opt-one -opt-two""#,
    getopts::Occur::Optional,
    None,
  );

  args.parse(inp).unwrap();

  let config = config::get_config();

  if args.value_of("help")? {
    println!("{}", args.full_usage());
    std::process::exit(0);
  }

  if args.value_of("launch-game")? {
    let game_path = config.game_install_path;
    let game_args: String = args.value_of("game-args").unwrap_or_default();

    // Patch if needed
    if args.value_of("patch")? {
      patch::patch_game().await;
    }

    if game_path.is_some() {
      if args.value_of("non-elevated-game")? {
        system_helpers::run_un_elevated(game_path.unwrap(), Some(game_args))
      } else {
        system_helpers::run_program(game_path.unwrap(), Some(game_args))
      }
    }
  }

  if args.value_of("server")? && config.grasscutter_path.is_some() && config.java_path.is_some() {
    let server_jar = config.grasscutter_path.unwrap();
    let mut server_path = server_jar.clone();
    // Strip jar name from path
    if server_path.contains('/') {
      // Can never panic because of if
      let len = server_jar.rfind('/').unwrap();
      server_path.truncate(len);
    } else if server_path.contains('\\') {
      let len = server_jar.rfind('\\').unwrap();
      server_path.truncate(len);
    }
    let java_path = config.java_path.unwrap();

    system_helpers::run_jar(server_jar, server_path.to_string(), java_path);
  }

  if args.value_of::<String>("host").is_ok() && !args.value_of::<String>("host")?.is_empty() {
    let host = args.value_of::<String>("host")?;
    set_proxy_addr(host);
  }

  if args.value_of("proxy")? {
    println!("Starting proxy server...");
    let mut pathbuf = tauri::api::path::data_dir().unwrap();
    pathbuf.push("cultivation");
    pathbuf.push("ca");

    connect(8035, pathbuf.to_str().unwrap().to_string()).await;
  }

  Ok(args)
}

fn main() -> Result<(), ArgsError> {
  let args: Vec<String> = std::env::args().collect();
  let parsed_args = block_on(parse_args(&args)).unwrap();

  if !is_elevated() && !parsed_args.value_of("no-admin")? {
    println!("===============================================================================");
    println!("You running as a non-elevated user. Some stuff will almost definitely not work.");
    println!("===============================================================================");

    reopen_as_admin();
  }

  // Setup datadir/cultivation just in case something went funky and it wasn't made
  if !dir_exists(data_dir().unwrap().join("cultivation").to_str().unwrap()) {
    fs::create_dir_all(data_dir().unwrap().join("cultivation")).unwrap();
  }

  // Always set CWD to the location of the executable.
  let mut exe_path = std::env::current_exe().unwrap();
  exe_path.pop();
  std::env::set_current_dir(&exe_path).unwrap();

  // For disabled GUI
  ctrlc::set_handler(|| {
    disconnect();
    block_on(patch::unpatch_game());
    std::process::exit(0);
  })
  .unwrap_or(());

  if !parsed_args.value_of("no-gui")? {
    tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![
        enable_process_watcher,
        enable_grasscutter_watcher,
        connect,
        disconnect,
        req_get,
        is_game_running,
        is_grasscutter_running,
        restart_grasscutter,
        get_theme_list,
        system_helpers::run_command,
        system_helpers::run_program,
        system_helpers::run_program_relative,
        system_helpers::start_service,
        system_helpers::service_status,
        system_helpers::stop_service,
        system_helpers::run_jar,
        system_helpers::open_in_browser,
        system_helpers::install_location,
        system_helpers::is_elevated,
        system_helpers::set_migoto_target,
        system_helpers::set_migoto_delay,
        system_helpers::wipe_registry,
        system_helpers::get_platform,
        system_helpers::run_un_elevated,
        proxy::set_proxy_addr,
        proxy::generate_ca_files,
        release::get_latest_release,
        unzip::unzip,
        file_helpers::rename,
        file_helpers::dir_create,
        file_helpers::dir_exists,
        file_helpers::dir_is_empty,
        file_helpers::dir_delete,
        file_helpers::copy_file,
        file_helpers::copy_file_with_new_name,
        file_helpers::delete_file,
        file_helpers::are_files_identical,
        file_helpers::read_file,
        file_helpers::write_file,
        downloader::download_file,
        downloader::stop_download,
        lang::get_lang,
        lang::get_languages,
        web::valid_url,
        web::web_get,
        gamebanana::get_download_links,
        gamebanana::list_submissions,
        gamebanana::list_mods
      ])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
  } else {
    try_flush();
    println!("Press enter or CTRL-C twice to quit...");
    std::io::stdin().read_line(&mut String::new()).unwrap();
  }

  // Always disconnect upon closing the program
  disconnect();

  // Always unpatch game upon closing the program
  block_on(patch::unpatch_game());

  Ok(())
}

#[tauri::command]
fn is_game_running() -> bool {
  // Grab the game process name
  let proc = WATCH_GAME_PROCESS.lock().unwrap().to_string();

  !proc.is_empty()
}

#[tauri::command]
fn enable_process_watcher(window: tauri::Window, process: String) {
  *WATCH_GAME_PROCESS.lock().unwrap() = process;

  window.listen("disable_process_watcher", |_e| {
    *WATCH_GAME_PROCESS.lock().unwrap() = "".to_string();
  });

  println!("Starting process watcher...");

  thread::spawn(move || {
    // Initial sleep for 8 seconds, since running 20 different injectors or whatever can take a while
    std::thread::sleep(std::time::Duration::from_secs(10));

    let mut system = System::new_all();

    loop {
      // Shorten loop timer to avoid user closing Cultivation before unpatching/proxy disconnecting
      thread::sleep(std::time::Duration::from_secs(2));

      // Refresh system info
      system.refresh_all();

      // Grab the game process name
      let proc = WATCH_GAME_PROCESS.lock().unwrap().to_string();

      if !proc.is_empty() {
        let mut proc_with_name = system.processes_by_exact_name(&proc);
        let exists = proc_with_name.next().is_some();

        // If the game process closes, disable the proxy.
        if !exists {
          println!("Game closed");

          *WATCH_GAME_PROCESS.lock().unwrap() = "".to_string();
          disconnect();

          window.emit("game_closed", &()).unwrap();
          break;
        }
      }
    }
  });
}

#[tauri::command]
fn is_grasscutter_running() -> bool {
  // Grab the grasscutter process name
  let proc = WATCH_GRASSCUTTER_PROCESS.lock().unwrap().to_string();

  !proc.is_empty()
}

#[cfg(windows)]
#[tauri::command]
fn restart_grasscutter(window: tauri::Window) -> bool {
  let pid: usize = *GC_PID.lock().unwrap();
  let system = System::new_all();
  // Get the process
  if let Some(process) = system.process(Pid::from(pid)) {
    // Kill it
    if process.kill() {
      // Also kill the cmd it was open in
      if let Some(parent) = system.process(process.parent().unwrap()) {
        parent.kill();
      }
      for process_gc in system.processes_by_name("java") {
        if process_gc.cmd().last().unwrap().contains("grasscutter") {
          process_gc.kill();
        }
      }
      window.emit("disable_grasscutter_watcher", &()).unwrap();
      thread::sleep(std::time::Duration::from_secs(2));
      // Start again
      window.emit("start_grasscutter", &()).unwrap();
      true
    } else {
      false
    }
  } else {
    false
  }
}

#[cfg(unix)]
#[tauri::command]
fn restart_grasscutter(_window: tauri::Window) {
  // Placeholder text for imports
  let s = System::new();
  if let Some(process) = s.process(Pid::from(1337)) {
    println!("{}", process.name());
  }
}

#[cfg(windows)]
#[tauri::command]
fn enable_grasscutter_watcher(window: tauri::Window, process: String) {
  let grasscutter_name = process.clone();
  let mut gc_pid = Pid::from(696969);

  *WATCH_GRASSCUTTER_PROCESS.lock().unwrap() = process;

  window.listen("disable_grasscutter_watcher", |_e| {
    *WATCH_GRASSCUTTER_PROCESS.lock().unwrap() = "".to_string();
  });

  println!("Starting grasscutter watcher...");

  thread::spawn(move || {
    // Initial sleep for 1 second while Grasscutter opens
    std::thread::sleep(std::time::Duration::from_secs(3));

    let mut system = System::new_all();

    for process_gc in system.processes_by_name("java") {
      if process_gc.cmd().last().unwrap().contains(&grasscutter_name) {
        gc_pid = process_gc.pid();
        *GC_PID.lock().unwrap() = gc_pid.into();
        window
          .emit("grasscutter_started", gc_pid.to_string())
          .unwrap();
      }
    }

    loop {
      // Shorten loop timer to avoid user closing Cultivation before automatic stuff
      thread::sleep(std::time::Duration::from_secs(2));

      // Refresh system info
      system.refresh_all();

      // Grab the grasscutter process name
      let proc = WATCH_GRASSCUTTER_PROCESS.lock().unwrap().to_string();

      if !proc.is_empty() {
        let mut exists = true;

        if system.process(gc_pid).is_none() {
          exists = false;
        }

        // If the grasscutter process closes.
        if !exists {
          println!("Grasscutter closed");

          *WATCH_GRASSCUTTER_PROCESS.lock().unwrap() = "".to_string();

          window.emit("grasscutter_closed", &()).unwrap();
          break;
        }
      }
    }
  });
}

#[cfg(unix)]
#[tauri::command]
fn enable_grasscutter_watcher(_window: tauri::Window, _process: String) {
  let gc_pid = Pid::from(696969);
  *GC_PID.lock().unwrap() = gc_pid.into();
}

#[tauri::command]
async fn connect(port: u16, certificate_path: String) {
  // Log message to console.
  println!("Connecting to proxy...");

  // Change proxy settings.
  proxy::connect_to_proxy(port);

  // Create and start a proxy.
  proxy::create_proxy(port, certificate_path).await;
}

#[tauri::command]
fn disconnect() {
  // Log message to console.
  println!("Disconnecting from proxy...");

  // Change proxy settings.
  proxy::disconnect_from_proxy();
}

#[tauri::command]
async fn req_get(url: String) -> String {
  // Send a GET request to the specified URL and send the response body back to the client.
  web::query(&url.to_string()).await
}

#[tauri::command]
async fn get_theme_list(data_dir: String) -> Vec<HashMap<String, String>> {
  let theme_loc = format!("{}/themes", data_dir);

  // Ensure folder exists
  if !std::path::Path::new(&theme_loc).exists() {
    std::fs::create_dir_all(&theme_loc).unwrap();
  }

  // Read each index.json folder in each theme folder
  let mut themes = Vec::new();

  for entry in std::fs::read_dir(&theme_loc).unwrap() {
    let entry = entry.unwrap();
    let path = entry.path();

    if path.is_dir() {
      let index_path = format!("{}/index.json", path.to_str().unwrap());

      if std::path::Path::new(&index_path).exists() {
        let theme_json = std::fs::read_to_string(&index_path).unwrap();

        let mut map = HashMap::new();

        map.insert("json".to_string(), theme_json);
        map.insert("path".to_string(), path.to_str().unwrap().to_string());

        // Push key-value pair containing "json" and "path"
        themes.push(map);
      }
    }
  }

  themes
}
