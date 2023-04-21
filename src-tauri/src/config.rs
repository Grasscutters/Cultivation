use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::string::String;

#[derive(Serialize, Deserialize, Debug)]
pub struct Configuration {
  pub toggle_grasscutter: bool,
  pub game_install_path: String,
  pub grasscutter_with_game: bool,
  pub grasscutter_path: String,
  pub java_path: String,
  pub close_action: u64,
  pub startup_launch: bool,
  pub last_ip: String,
  pub last_port: u64,
  pub language: String,
  pub customBackground: String,
  pub cert_generated: bool,
  pub theme: String,
  pub https_enabled: bool,
  pub debug_enabled: bool,
  pub patch_rsa: bool,
  pub use_internal_proxy: bool,
  pub wipe_login: bool,
  pub horny_mode: bool,
  pub auto_mongodb: bool,
  pub un_elevated: bool,
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
