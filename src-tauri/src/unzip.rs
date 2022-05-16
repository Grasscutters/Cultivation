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

  // Iterate zip files
  for i in 0..zip.len()
  {
    // Get file  
    let mut file = match zip.by_index(i) {
      Ok(file) => file,
      Err(e) => {
        println!("Could not open zip file: {}", e);
        return;
      }
    };

    println!("Filename: {}", file.name());

    // Read the first byte if it is a file
    let first_byte = match file.bytes().next() {
      Some(b) => b,
      None => {
        println!("Could not read first byte of file");
        return;
      }
    };

    // Output first byte
    println!("{:?}", first_byte);
  }
}