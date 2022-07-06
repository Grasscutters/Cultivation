use core::ffi::c_void;
use std::fs::File;
use std::io::Read;
use std::io::Write;
use libloading::os::windows::Library;
use libloading::os::windows::Symbol;
use regex::Regex;

fn dll_decrypt_global_metadata(data : *mut u8, size : u64) -> Result<*const c_void, Box<dyn std::error::Error>> {
  unsafe {
    // Load DLL
    let lib = Library::new("mhycrypto.dll")?;

    // Load function and call it
    let func : Symbol<unsafe extern fn(*mut u8, u64) -> *const c_void> = lib.get_ordinal(0x1)?;
    let decrypted_data = func(data, size);

    // Close DLL and return result
    lib.close()?;
    Ok(decrypted_data)
  }
}

fn dll_encrypt_global_metadata(data : *mut u8, size : u64) -> Result<*const c_void, Box<dyn std::error::Error>> {
  unsafe {
    // Load DLL
    let lib = Library::new("mhycrypto.dll")?;

    // Load function and call it
    let func : Symbol<unsafe extern fn(*mut u8, u64) -> *const c_void> = lib.get_ordinal(0x2)?;
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
  let decrypted : Vec<u8> = decrypt_metadata(metadata_file);

  //write decrypted to file
  let mut file = File::create(&(metadata_folder.to_owned() + "\\decrypted-metadata.dat")).unwrap();
  file.write_all(&decrypted).unwrap();

  replace_rsa_key(&decrypted);

  /*if decrypted != Vec::new() {
    
  } else {
    // error
  }*/
}

fn decrypt_metadata(file_path: &str) -> Vec<u8>{
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

fn replace_rsa_key(data: &Vec<u8>) {
  unsafe {
    let data_str = String::from_utf8_unchecked(data.to_vec());

    let re = Regex::new(r"<RSAKeyValue>((.|\n|\r)*?)</RSAKeyValue>").unwrap();
    let matches = re.find_iter(&data_str);

    // dispatch key is index 3
    // password key is index 2

    //println!("Found {} RSA Key(s)", matches.count());
    for (i, rmatch) in matches.enumerate() {
      let key = rmatch.as_str();

      println!("{} - RSA Key {}", i, key);
      println!("\n");
    }
  }

  

  /*if matches.count() < 1 {
    println!("No RSA keys found");
    return Vec::new();
  }*/
}

/*let mut file = match OpenOptions::new().write(true).create(true).open(&(file_location.to_owned() + "\\decrypted_metadata.dat")) {
        Ok(file) => file,
        Err(e) => {
          println!("Failed to open file: {}", e);
          return;
        }
      };
      match file.write_all(&data) {
        Ok(_) => {
          println!("Successfully decrypted metadata");
        }
        Err(e) => {
          println!("Failed to write to file: {}", e);
          return;
        }
      }*/