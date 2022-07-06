fn main() {
  cc::Build::new()
    .include("mhycrypto")
    .cpp(true)

    .file("mhycrypto/aes.cpp")
    .file("mhycrypto/memecrypto.cpp")
    .file("mhycrypto/metadata.cpp")
    .file("mhycrypto/metadatastringdec.cpp")

    .compile("mhycrypto");

  tauri_build::build()
}
