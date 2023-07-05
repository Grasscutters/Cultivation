use crate::config;
use crate::file_helpers;
use crate::system_helpers;
use std::path::PathBuf;

#[cfg(target_os = "linux")]
use anime_launcher_sdk::{config::ConfigExt, genshin::config::Config};
#[cfg(target_os = "linux")]
use once_cell::sync::Lazy;
#[cfg(target_os = "linux")]
use std::sync::Arc;
#[cfg(target_os = "linux")]
use tokio::sync::Mutex;

#[cfg(target_os = "linux")]
static PATCH_STATE: Lazy<Arc<Mutex<Option<PatchState>>>> = Lazy::new(|| Arc::new(Mutex::new(None)));

#[cfg(target_os = "linux")]
#[derive(Debug, Clone, Copy)]
enum PatchState {
  NotExist,
  Same,
  BakNotExist,
  BakExist,
}

#[cfg(target_os = "linux")]
use PatchState::*;

#[cfg(target_os = "linux")]
impl PatchState {
  fn to_unpatch_bools(self) -> WhatToUnpach {
    let (mhyp_renamed, game_was_patched) = match self {
      NotExist => (false, true),
      Same => (false, true),
      BakNotExist => (true, true),
      BakExist => (false, false),
    };
    WhatToUnpach {
      mhyp_renamed,
      game_was_patched,
    }
  }
}

#[cfg(target_os = "linux")]
#[derive(Debug, Clone)]
struct WhatToUnpach {
  mhyp_renamed: bool,
  game_was_patched: bool,
}

#[cfg(target_os = "linux")]
impl WhatToUnpach {
  fn to_union(&self) -> (bool, bool) {
    (self.mhyp_renamed, self.game_was_patched)
  }
}

#[cfg(windows)]
#[tauri::command]
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

#[cfg(target_os = "linux")]
#[tauri::command]
pub async fn patch_game() -> bool {
  let mut patch_state_mutex = PATCH_STATE.lock().await;
  if patch_state_mutex.is_some() {
    println!("Game already patched!");
  }

  let patch_path = PathBuf::from(system_helpers::install_location()).join("patch/version.dll");
  let game_mhyp = PathBuf::from(get_game_rsa_path().await.unwrap()).join("mhypbase.dll");
  let game_mhyp_bak = PathBuf::from(get_game_rsa_path().await.unwrap()).join("mhypbase.dll.bak");

  let patch_state = if !game_mhyp.exists() {
    NotExist
  } else if file_helpers::are_files_identical(
    patch_path.to_str().unwrap(),
    game_mhyp.to_str().unwrap(),
  ) {
    Same
  } else if !game_mhyp_bak.exists() {
    BakNotExist
  } else {
    BakExist
  };

  match patch_state {
    NotExist => {
      // No renaming needed.
      // Copy version.dll as mhypbase.dll
      file_helpers::copy_file_with_new_name(
        patch_path.clone().to_str().unwrap().to_string(),
        get_game_rsa_path().await.unwrap(),
        String::from("mhypbase.dll"),
      );
    }
    Same => {
      // No renaming needed.
      // No copying needed.
      println!("The game is already patched.");
    }
    BakNotExist => {
      // The current mhypbase.dll is most likely the original

      // Rename mhypbase.dll to mhypbase.dll.bak
      file_helpers::rename(
        game_mhyp.to_str().unwrap().to_string(),
        game_mhyp_bak
          .file_name()
          .unwrap()
          .to_str()
          .unwrap()
          .to_string(),
      );
      // Copy version.dll as mhypbase.dll
      file_helpers::copy_file_with_new_name(
        patch_path.clone().to_str().unwrap().to_string(),
        get_game_rsa_path().await.unwrap(),
        String::from("mhypbase.dll"),
      );
    }
    BakExist => {
      // Can't rename. mhypbase.dll.bak already exists.
      // Can't patch. mhypbase.dll exists.
      // This SHOULD NOT HAPPEN
      println!("The game directory contains a mhypbase.dll, but it's different from the patch.");
      println!("Make sure you have the original mhypbase.dll.");
      println!("Delete any other copy, and place the original copy in the game directory with the original name.");
    }
  }

  patch_state_mutex.replace(patch_state);
  patch_state.to_unpatch_bools().game_was_patched
}

#[cfg(windows)]
#[tauri::command]
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

#[cfg(target_os = "linux")]
#[tauri::command]
pub async fn unpatch_game() -> bool {
  // TODO: Prevent the launcher from unpatching the game two times
  // This might be related to redirecting calls from the ts version of
  // unpatchGame to the rust version
  let mut patch_state_mutex = PATCH_STATE.lock().await;
  let patch_state = patch_state_mutex.take();
  if patch_state.is_none() {
    println!("Game not patched!");
    // NOTE: true is returned since otherwhise the launcher thinks unpatching failed
    // NOTE: actually it should be false since delete_file always returns false
    return false;
  }
  let patch_state = patch_state.unwrap();
  let config = Config::get().unwrap();

  let game_mhyp = PathBuf::from(get_game_rsa_path().await.unwrap()).join("mhypbase.dll");
  let game_mhyp_bak = PathBuf::from(get_game_rsa_path().await.unwrap()).join("mhypbase.dll.bak");

  let (mhyp_renamed, game_was_patched) = patch_state.to_unpatch_bools().to_union();

  // If the current mhypbase.dll is the patch, then delete it.
  let deleted = if game_was_patched {
    file_helpers::delete_file(game_mhyp.to_str().unwrap().to_string());
    true
  } else {
    false
  };
  // If we renamed the original mhypbase.dll to mhypbase.dll.bak
  // AND the other launcher has the "Disable mhypbase" option enabled
  // rename mhypbase.dll.bak back to mhypbase.dll
  if mhyp_renamed && !config.patch.disable_mhypbase {
    file_helpers::rename(
      game_mhyp_bak.to_str().unwrap().to_string(),
      game_mhyp.to_str().unwrap().to_string(),
    )
  }

  // NOTE: As mentioned in a note above, false should be returned if the function succeded
  // and true if it failed
  !deleted
}

pub async fn get_game_rsa_path() -> Option<String> {
  let config = config::get_config();

  config.game_install_path.as_ref()?;

  let mut game_folder = PathBuf::from(config.game_install_path.unwrap());
  game_folder.pop();

  Some(format!("{}/", game_folder.to_str().unwrap()).replace('\\', "/"))
}
