use core::ffi::c_void;
use libloading::os::windows::Library;
use libloading::os::windows::Symbol;
use regex::Regex;
use std::fs::File;
use std::io::Read;
use std::io::Write;

fn dll_decrypt_global_metadata(data: *mut u8, size: u64) -> Result<*const c_void, Box<dyn std::error::Error>> {
  unsafe {
    // Load DLL
    let lib = Library::new("mhycrypto.dll")?;

    // Load function and call it
    let func: Symbol<unsafe extern "C" fn(*mut u8, u64) -> *const c_void> = lib.get_ordinal(0x1)?;
    let decrypted_data = func(data, size);

    // Close DLL and return result
    lib.close()?;
    Ok(decrypted_data)
  }
}

fn dll_encrypt_global_metadata(data: *mut u8, size: u64) -> Result<*const c_void, Box<dyn std::error::Error>> {
  unsafe {
    // Load DLL
    let lib = Library::new("mhycrypto.dll")?;

    // Load function and call it
    let func: Symbol<unsafe extern "C" fn(*mut u8, u64) -> *const c_void> = lib.get_ordinal(0x2)?;
    let encrypted_data = func(data, size);

    // Close DLL and return result
    lib.close()?;
    Ok(encrypted_data)
  }
}

#[tauri::command]
pub fn patch_metadata(metadata_folder: &str) {
  let metadata_file = &(metadata_folder.to_owned() + "\\global-metadata.dat");
  println!("Patching metadata file: {}", metadata_file);
  let decrypted = decrypt_metadata(metadata_file);
  let modified = replace_keys(&decrypted);
  let encrypted = encrypt_metadata(&modified);

  //write encrypted to file
  let mut file = File::create(&(metadata_folder.to_owned() + "\\encrypted-metadata.dat")).unwrap();
  file.write_all(&encrypted).unwrap();
}

fn decrypt_metadata(file_path: &str) -> Vec<u8> {
  let mut file = match File::open(file_path) {
    Ok(file) => file,
    Err(e) => {
      println!("Failed to open global-metadata: {}", e);
      return Vec::new();
    }
  };
  let mut data = Vec::new();
  match file.read_to_end(&mut data) {
    Ok(_) => {
      match dll_decrypt_global_metadata(data.as_mut_ptr(), data.len().try_into().unwrap()) {
        Ok(_) => {
          println!("Successfully decrypted global-metadata");
          return data;
        }
        Err(e) => {
          println!("Failed to decrypt global-metadata: {}", e);
          return Vec::new();
        }
      };
    }
    Err(e) => {
      println!("Failed to read global-metadata: {}", e);
      return Vec::new();
    }
  }
}

fn replace_keys(data: &Vec<u8>) -> Vec<u8> {
  let mut new_data = String::new();

  unsafe {
    let data_str = String::from_utf8_unchecked(data.to_vec());

    let re = Regex::new(r"<RSAKeyValue>((.|\n|\r)*?)</RSAKeyValue>").unwrap();
    let matches = re.find_iter(&data_str);

    // dispatch key is index 3
    // password key is index 2

    for (i, rmatch) in matches.enumerate() {
      let key = rmatch.as_str();

      if i == 2 {
        println!("Replacing password key");
        new_data = replace_rsa_key(&data_str, &key, "passwordKey.txt");
      } else if i == 3 {
        println!("Replacing dispatch key");
        new_data = replace_rsa_key(&new_data, &key, "dispatchKey.txt");
      }
    }
  }

  return new_data.as_bytes().to_vec();
}

fn replace_rsa_key(old_data: &str, to_replace: &str, file_name: &str) -> String {
  // Read dispatch key file
  unsafe {
    let mut new_key_file = match File::open(&("keys/".to_owned() + file_name)) {
      Ok(file) => file,
      Err(e) => {
        println!("Failed to open keys/{}: {}", file_name, e);
        return String::new();
      }
    };
    let mut key_data = Vec::new();
    new_key_file.read_to_end(&mut key_data).unwrap();
    let new_key = String::from_utf8_unchecked(key_data.to_vec());

    // Replace old key with new key
    return old_data.replace(to_replace, &new_key);
  }
}

fn encrypt_metadata(old_data: &Vec<u8>) -> Vec<u8> {
  let mut data = old_data.to_vec();
  match dll_encrypt_global_metadata(data.as_mut_ptr(), data.len().try_into().unwrap()) {
    Ok(_) => {
      println!("Successfully encrypted global-metadata");
      return data;
    }
    Err(e) => {
      println!("Failed to encrypt global-metadata: {}", e);
      return Vec::new();
    }
  };
}
