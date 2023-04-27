use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::string::String;

// Config may not exist, or may be old, so it's okay if these are optional
#[derive(Serialize, Deserialize, Debug)]
pub struct Configuration {
  pub toggle_grasscutter: Option<bool>,
  pub game_install_path: Option<String>,
  pub grasscutter_with_game: Option<bool>,
  pub grasscutter_path: Option<String>,
  pub java_path: Option<String>,
  pub close_action: Option<u64>,
  pub startup_launch: Option<bool>,
  pub last_ip: Option<String>,
  pub last_port: Option<String>,
  pub language: Option<String>,
  pub custom_background: Option<String>,
  pub cert_generated: Option<bool>,
  pub theme: Option<String>,
  pub https_enabled: Option<bool>,
  pub debug_enabled: Option<bool>,
  pub patch_rsa: Option<bool>,
  pub use_internal_proxy: Option<bool>,
  pub wipe_login: Option<bool>,
  pub horny_mode: Option<bool>,
  pub auto_mongodb: Option<bool>,
  pub un_elevated: Option<bool>,
}

pub fn config_path() -> PathBuf {
  let mut path = tauri::api::path::data_dir().unwrap();
  path.push("cultivation");
  path.push("configuration.json");

  path
}

pub fn get_config() -> Configuration {
  let path = config_path();
  let config = std::fs::read_to_string(path).unwrap_or("{}".to_string());
  let config: Configuration = serde_json::from_str(&config).unwrap();

  config
}
