/*
 * Built on example code from:
 * https://github.com/omjadas/hudsucker/blob/main/examples/log.rs
 */

use lazy_static::lazy_static;
use std::sync::Mutex;

use rcgen::*;
use hudsucker::{
  async_trait::async_trait,
  certificate_authority::RcgenAuthority,
  hyper::{Body, Request, Response},
  *,
};

use std::fs;
use std::net::SocketAddr;
use registry::{Hive, Data, Security};

use rustls_pemfile as pemfile;
use tauri::http::Uri;
use crate::system_helpers::run_command;

async fn shutdown_signal() {
  tokio::signal::ctrl_c().await
    .expect("Failed to install CTRL+C signal handler");
}

// Global ver for getting server address.
lazy_static! {
    static ref SERVER: Mutex<String> = {
        let m = "localhost:443".to_string();
        Mutex::new(m)
    };
}

#[derive(Clone)]
struct ProxyHandler;

#[tauri::command]
pub fn set_proxy_addr(addr: String) {
  *SERVER.lock().unwrap() = addr;
}

#[async_trait]
impl HttpHandler for ProxyHandler {
  async fn handle_request(&mut self,
                          _context: &HttpContext,
                          mut request: Request<Body>,
  ) -> RequestOrResponse {
    // Get request URI.
    let uri = request.uri().to_string();
    let uri_path = request.uri().path();

    // Only switch up if request is to the game servers.
    if uri.contains("hoyoverse.com") || uri.contains("mihoyo.com") || uri.contains("yuanshen.com") {
      // Create new URI.
      let uri = format!("https://{}{}", SERVER.lock().unwrap(), uri_path).parse::<Uri>().unwrap();
      // Set request URI to the new one.
      *request.uri_mut() = uri;
    }

    RequestOrResponse::Request(request)
  }

  async fn handle_response(&mut self,
                           _context: &HttpContext,
                           response: Response<Body>,
  ) -> Response<Body> { response }
}

/**
 * Starts an HTTP(S) proxy server.
 */
pub(crate) async fn create_proxy(proxy_port: u16) {
  // Get the certificate and private key.
  let mut private_key_bytes: &[u8] = include_bytes!("../resources/private-key.pem");
  let mut ca_cert_bytes: &[u8] = include_bytes!("../resources/ca-certificate.pem");

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
pub(crate) fn connect_to_proxy(proxy_port: u16) {
  if cfg!(target_os = "windows") {
    // Create 'ProxyServer' string.
    let server_string: String = format!("http=127.0.0.1:{};https=127.0.0.1:{}", proxy_port, proxy_port);

    // Fetch the 'Internet Settings' registry key.
    let settings = Hive::CurrentUser.open(r"Software\Microsoft\Windows\CurrentVersion\Internet Settings", Security::Write).unwrap();

    // Set registry values.
    settings.set_value("ProxyServer", &Data::String(server_string.parse().unwrap())).unwrap();
    settings.set_value("ProxyEnable", &Data::U32(1)).unwrap();
  }

  println!("Connected to the proxy.");
}

/**
 * Disconnects from the local HTTP(S) proxy server.
 */
pub(crate) fn disconnect_from_proxy() {
  if cfg!(target_os = "windows") {
    // Fetch the 'Internet Settings' registry key.
    let settings = Hive::CurrentUser.open(r"Software\Microsoft\Windows\CurrentVersion\Internet Settings", Security::Write).unwrap();

    // Set registry values.
    settings.set_value("ProxyEnable", &Data::U32(0)).unwrap();
  }

  println!("Disconnected from proxy.");
}

/*
 * Generates a private key and certificate used by the certificate authority.
 * Additionally installs the certificate and private key in the Root CA store.
 * Source: https://github.com/zu1k/good-mitm/raw/master/src/ca/gen.rs
 */
pub(crate) fn generate_ca_files() {
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
  
  // TODO: Save certificates.
  
  // Install certificate into the system's Root CA store.
  install_ca_files();
}

/*
 * Attempts to install the certificate authority's certificate into the Root CA store.
 */
pub(crate) fn install_ca_files() {
  if cfg!(target_os = "windows") {
    run_command("certutil -addstore -f \"ROOT\" ca/certificate.crt".to_string());
  } else {
    run_command("sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ca/certificate.crt".to_string());
  }

  println!("Installed certificate.");
}