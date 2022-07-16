/*
 * Built on example code from:
 * https://github.com/omjadas/hudsucker/blob/main/examples/log.rs
 */

use once_cell::sync::Lazy;
use std::{str::FromStr, sync::Mutex};

use hudsucker::{
  async_trait::async_trait,
  certificate_authority::RcgenAuthority,
  hyper::{Body, Request, Response},
  *,
};
use rcgen::*;

use std::fs;
use std::net::SocketAddr;
use std::path::Path;

use rustls_pemfile as pemfile;
use tauri::http::Uri;

#[cfg(windows)]
use registry::{Data, Hive, Security};

async fn shutdown_signal() {
  tokio::signal::ctrl_c()
    .await
    .expect("Failed to install CTRL+C signal handler");
}

// Global ver for getting server address.
static SERVER: Lazy<Mutex<String>> = Lazy::new(|| Mutex::new("http://localhost:443".to_string()));

#[derive(Clone)]
struct ProxyHandler;

#[tauri::command]
pub fn set_proxy_addr(addr: String) {
  *SERVER.lock().unwrap() = addr;
}

#[async_trait]
impl HttpHandler for ProxyHandler {
  async fn handle_request(
    &mut self,
    _context: &HttpContext,
    mut request: Request<Body>,
  ) -> RequestOrResponse {
    let uri = request.uri().to_string();
    let uri_path = request.uri().path();

    if uri.contains("hoyoverse.com") || uri.contains("mihoyo.com") || uri.contains("yuanshen.com") {
      // Create new URI.
      let new_uri =
        Uri::from_str(format!("{}{}", SERVER.lock().unwrap(), uri_path).as_str()).unwrap();
      // Set request URI to the new one.
      *request.uri_mut() = new_uri;
    }

    RequestOrResponse::Request(request)
  }

  async fn handle_response(
    &mut self,
    _context: &HttpContext,
    response: Response<Body>,
  ) -> Response<Body> {
    response
  }
}

/**
 * Starts an HTTP(S) proxy server.
 */
pub async fn create_proxy(proxy_port: u16, certificate_path: String) {
  // Get the certificate and private key.
  let mut private_key_bytes: &[u8] =
    &fs::read(format!("{}\\private.key", certificate_path)).expect("Could not read private key");
  let mut ca_cert_bytes: &[u8] =
    &fs::read(format!("{}\\cert.crt", certificate_path)).expect("Could not read certificate");

  // Parse the private key and certificate.
  let private_key = rustls::PrivateKey(
    pemfile::pkcs8_private_keys(&mut private_key_bytes)
      .expect("Failed to parse private key")
      .remove(0),
  );

  let ca_cert = rustls::Certificate(
    pemfile::certs(&mut ca_cert_bytes)
      .expect("Failed to parse CA certificate")
      .remove(0),
  );

  // Create the certificate authority.
  let authority = RcgenAuthority::new(private_key, ca_cert, 1_000)
    .expect("Failed to create Certificate Authority");

  // Create an instance of the proxy.
  let proxy = ProxyBuilder::new()
    .with_addr(SocketAddr::from(([0, 0, 0, 0], proxy_port)))
    .with_rustls_client()
    .with_ca(authority)
    .with_http_handler(ProxyHandler)
    .build();

  // Start the proxy.
  tokio::spawn(proxy.start(shutdown_signal()));
}

/**
 * Connects to the local HTTP(S) proxy server.
 */
#[cfg(windows)]
pub fn connect_to_proxy(proxy_port: u16) {
  // Create 'ProxyServer' string.
  let server_string: String = format!(
    "http=127.0.0.1:{};https=127.0.0.1:{}",
    proxy_port, proxy_port
  );

  // Fetch the 'Internet Settings' registry key.
  let settings = Hive::CurrentUser
    .open(
      r"Software\Microsoft\Windows\CurrentVersion\Internet Settings",
      Security::Write,
    )
    .unwrap();

  // Set registry values.
  settings
    .set_value("ProxyServer", &Data::String(server_string.parse().unwrap()))
    .unwrap();
  settings.set_value("ProxyEnable", &Data::U32(1)).unwrap();

  println!("Connected to the proxy.");
}

#[cfg(not(windows))]
pub fn connect_to_proxy(_proxy_port: u16) {
  println!("Connecting to the proxy is not implemented on this platform.");
}

/**
 * Disconnects from the local HTTP(S) proxy server.
 */
#[cfg(windows)]
pub fn disconnect_from_proxy() {
  // Fetch the 'Internet Settings' registry key.
  let settings = Hive::CurrentUser
    .open(
      r"Software\Microsoft\Windows\CurrentVersion\Internet Settings",
      Security::Write,
    )
    .unwrap();

  // Set registry values.
  settings.set_value("ProxyEnable", &Data::U32(0)).unwrap();

  println!("Disconnected from proxy.");
}

#[cfg(not(windows))]
pub fn disconnect_from_proxy() {}

/*
 * Generates a private key and certificate used by the certificate authority.
 * Additionally installs the certificate and private key in the Root CA store.
 * Source: https://github.com/zu1k/good-mitm/raw/master/src/ca/gen.rs
 */
#[tauri::command]
pub fn generate_ca_files(path: &Path) {
  let mut params = CertificateParams::default();
  let mut details = DistinguishedName::new();

  // Set certificate details.
  details.push(DnType::CommonName, "Cultivation");
  details.push(DnType::OrganizationName, "Grasscutters");
  details.push(DnType::CountryName, "CN");
  details.push(DnType::LocalityName, "CN");

  // Set details in the parameter.
  params.distinguished_name = details;
  // Set other properties.
  params.is_ca = IsCa::Ca(BasicConstraints::Unconstrained);
  params.key_usages = vec![
    KeyUsagePurpose::DigitalSignature,
    KeyUsagePurpose::KeyCertSign,
    KeyUsagePurpose::CrlSign,
  ];

  // Create certificate.
  let cert = Certificate::from_params(params).unwrap();
  let cert_crt = cert.serialize_pem().unwrap();
  let private_key = cert.serialize_private_key_pem();

  // Make certificate directory.
  let cert_dir = path.join("ca");
  match fs::create_dir(&cert_dir) {
    Ok(_) => {}
    Err(e) => {
      println!("{}", e);
    }
  };

  // Write the certificate to a file.
  let cert_path = cert_dir.join("cert.crt");
  match fs::write(&cert_path, cert_crt) {
    Ok(_) => println!("Wrote certificate to {}", cert_path.to_str().unwrap()),
    Err(e) => println!(
      "Error writing certificate to {}: {}",
      cert_path.to_str().unwrap(),
      e
    ),
  }

  // Write the private key to a file.
  let private_key_path = cert_dir.join("private.key");
  match fs::write(&private_key_path, private_key) {
    Ok(_) => println!(
      "Wrote private key to {}",
      private_key_path.to_str().unwrap()
    ),
    Err(e) => println!(
      "Error writing private key to {}: {}",
      private_key_path.to_str().unwrap(),
      e
    ),
  }

  // Install certificate into the system's Root CA store.
  install_ca_files(&cert_path);
}

/*
 * Attempts to install the certificate authority's certificate into the Root CA store.
 */
#[cfg(windows)]
pub fn install_ca_files(cert_path: &Path) {
  crate::system_helpers::run_command(
    "certutil",
    vec!["-user", "-addstore", "Root", cert_path.to_str().unwrap()],
  );
  println!("Installed certificate.");
}

#[cfg(target_os = "macos")]
pub fn install_ca_files(cert_path: &Path) {
  crate::system_helpers::run_command(
    "security",
    vec![
      "add-trusted-cert",
      "-d",
      "-r",
      "trustRoot",
      "-k",
      "/Library/Keychains/System.keychain",
      cert_path.to_str().unwrap(),
    ],
  );
  println!("Installed certificate.");
}

#[cfg(not(any(windows, target_os = "macos")))]
pub fn install_ca_files(_cert_path: &Path) {
  println!("Certificate installation is not supported on this platform.");
}
