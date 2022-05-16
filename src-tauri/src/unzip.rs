use zip;
use std::fs::File;
use std::io::Read;

#[tauri::command]
pub fn unzip(zipfile: &str, zippath: &str, destpath: &str) {
  // Read file
  let f = match File::open(zipfile) {
    Ok(f) => f,
    Err(e) => {
      println!("Failed to open zip file: {}", e);
      return;
    }
  };

  let reader = std::io::Cursor::new(&f);

  // Init zip reader
  let mut zip = match zip::ZipArchive::new(&f) {
    Ok(zip) => zip,
    Err(e) => {
      println!("Could not open zip file: {}", e);
      return;
    }
  };

  let zipData = match zip.by_name(zippath) {
    Ok(zipData) => zipData,
    Err(e) => {
      println!("Could not find zip file: {}", e);
      return;
    }
  };
}