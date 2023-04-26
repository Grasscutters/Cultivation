use crate::config;
use crate::file_helpers;
use crate::system_helpers;
use std::path::PathBuf;

pub async fn patch_game() -> bool {
  let patch_path = PathBuf::from(system_helpers::install_location()).join("patch/version.dll");

  // Are we already patched with mhypbase? If so, that's fine, just continue as normal
  let game_is_patched = file_helpers::are_files_identical(
    patch_path.clone().to_str().unwrap(),
    PathBuf::from(get_game_rsa_path().await.unwrap())
      .join("mhypbase.dll")
      .to_str()
      .unwrap(),
  );

  // Tell user they won't be unpatched with manual mhypbase patch
  if game_is_patched {
    println!(
      "You are already patched using mhypbase, so you will not be auto patched and unpatched!"
    );
    return true;
  }

  // Copy the patch to game files
  let replaced = file_helpers::copy_file_with_new_name(
    patch_path.clone().to_str().unwrap().to_string(),
    get_game_rsa_path().await.unwrap(),
    String::from("version.dll"),
  );

  if !replaced {
    return false;
  }

  true
}

pub async fn unpatch_game() -> bool {
  // Just delete patch since it's not replacing any existing file
  let deleted = file_helpers::delete_file(
    PathBuf::from(get_game_rsa_path().await.unwrap())
      .join("version.dll")
      .to_str()
      .unwrap()
      .to_string(),
  );

  deleted
}

pub async fn get_game_rsa_path() -> Option<String> {
  let config = config::get_config();

  config.game_install_path.as_ref()?;

  let mut game_folder = PathBuf::from(config.game_install_path.unwrap());
  game_folder.pop();

  Some(format!("{}/", game_folder.to_str().unwrap()).replace('\\', "/"))
}
