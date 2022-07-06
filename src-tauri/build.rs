fn main() {
  cc::Build::new()
    .include("mhycrypto")
    .cpp(true)

    .file("mhycrypto/aes.c")
    .file("mhycrypto/memecrypto.cpp")
    .file("mhycrypto/metadata.cpp")
    .file("mhycrypto/metadatastringdec.cpp")

  .compile("mhycrypto");

  tauri_build::build()
}
