use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::string::String;

#[derive(Serialize, Deserialize, Debug)]
pub struct Configuration {
  toggle_grasscutter: bool,
  game_install_path: String,
  grasscutter_with_game: bool,
  grasscutter_path: String,
  java_path: String,
  close_action: u64,
  startup_launch: bool,
  last_ip: String,
  last_port: u64,
  language: String,
  customBackground: String,
  cert_generated: bool,
  theme: String,
  https_enabled: bool,
  debug_enabled: bool,
  patch_rsa: bool,
  use_internal_proxy: bool,
  wipe_login: bool,
  horny_mode: bool,
  auto_mongodb: bool,
  un_elevated: bool,
}

pub fn config_path() -> PathBuf {
  let mut path = tauri::api::path::data_dir().unwrap();
  path.push("cultivation");
  path.push("configuration.json");

  path
}

pub fn get_config() -> Configuration {
  let path = config_path();
  let config = std::fs::read_to_string(path).unwrap();
  let config: Configuration = serde_json::from_str(&config).unwrap();

  config
}
