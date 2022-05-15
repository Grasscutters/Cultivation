use zip;
use std::fs::File;
use std::io::Read;

#[tauri::command]
pub fn unzip(zipfile: &str, zippath: &str, destpath: &str) {
  let mut f = match File::open(zipfile) {
    Ok(f) => f,
    Err(e) => {
      println!("Failed to open zip file: {}", e);
      return;
    }
  };

  let mut reader = std::io::Cursor::new(&f);

  let mut zip = match zip::ZipArchive::new(&f) {
    Ok(zip) => zip,
    Err(e) => {
      println!("Could not open zip file: {}", e);
      return;
    }
  };

  for i in 0..zip.len()
  {
      let mut file = match zip.by_index(i) {
        Ok(file) => file,
        Err(e) => {
          println!("Could not open zip file: {}", e);
          return;
        }
      };

      println!("Filename: {}", file.name());
      let first_byte = match file.bytes().next() {
        Some(b) => b.unwrap(),
        None => {
          println!("File is empty: {}", &zipfile);
          continue;
        }
      };
      println!("{:?}", first_byte);
  }
}