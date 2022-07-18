fn main() {
  cc::Build::new()
    .include("mhycrypto")
    .cpp(true)
    .file("mhycrypto/memecrypto.cpp")
    .file("mhycrypto/metadata.cpp")
    .file("mhycrypto/metadatastringdec.cpp")
    .compile("mhycrypto");

  cc::Build::new()
    .include("mhycrypto")
    .file("mhycrypto/aes.c")
    .compile("mhycrypto-aes");

  tauri_build::build()
}
