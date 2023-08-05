/*
 * Built on example code from:
 * https://github.com/omjadas/hudsucker/blob/main/examples/log.rs
 */

use crate::config::get_config;

use once_cell::sync::Lazy;
use std::{path::PathBuf, str::FromStr, sync::Mutex};

use hudsucker::{
  async_trait::async_trait,
  certificate_authority::RcgenAuthority,
  hyper::{Body, Request, Response, StatusCode},
  *,
};
use rcgen::*;

use std::fs;
use std::net::SocketAddr;
use std::path::Path;

use rustls_pemfile as pemfile;
use tauri::{api::path::data_dir, http::Uri};

#[cfg(windows)]
use registry::{Data, Hive, Security};

#[cfg(target_os = "linux")]
use anime_launcher_sdk::{config::ConfigExt, genshin::config::Config};

async fn shutdown_signal() {
  tokio::signal::ctrl_c()
    .await
    .expect("Failed to install CTRL+C signal handler");
}

// Global ver for getting server address.
static SERVER: Lazy<Mutex<String>> = Lazy::new(|| Mutex::new("http://localhost:443".to_string()));
static REDIRECT_MORE: Lazy<Mutex<bool>> = Lazy::new(|| Mutex::new(false));

#[derive(Clone)]
struct ProxyHandler;

#[tauri::command]
pub fn set_proxy_addr(addr: String) {
  if addr.contains(' ') {
    let addr2 = addr.replace(' ', "");
    *SERVER.lock().unwrap() = addr2;
  } else {
    *SERVER.lock().unwrap() = addr;
  }

  println!("Set server to {}", SERVER.lock().unwrap());
}

#[tauri::command]
pub fn set_redirect_more() {
  *REDIRECT_MORE.lock().unwrap() = true;
}

#[async_trait]
impl HttpHandler for ProxyHandler {
  async fn handle_request(
    &mut self,
    _ctx: &HttpContext,
    mut req: Request<Body>,
  ) -> RequestOrResponse {
    let uri = req.uri().to_string();

    let mut more = get_config().redirect_more;

    if *REDIRECT_MORE.lock().unwrap() {
      more = Some(true);
    }

    match more {
      Some(true) => {
        if uri.contains("hoyoverse.com")
          || uri.contains("mihoyo.com")
          || uri.contains("yuanshen.com")
          || uri.contains("starrails.com")
          || uri.contains("bhsr.com")
          || uri.contains("bh3.com")
          || uri.contains("honkaiimpact3.com")
          || uri.contains("zenlesszonezero.com")
        {
          // Handle CONNECTs
          if req.method().as_str() == "CONNECT" {
            let builder = Response::builder()
              .header("DecryptEndpoint", "Created")
              .status(StatusCode::OK);
            let res = builder.body(()).unwrap();

            // Respond to CONNECT
            *res.body()
          } else {
            let uri_path_and_query = req.uri().path_and_query().unwrap().as_str();
            // Create new URI.
            let new_uri =
              Uri::from_str(format!("{}{}", SERVER.lock().unwrap(), uri_path_and_query).as_str())
                .unwrap();
            // Set request URI to the new one.
            *req.uri_mut() = new_uri;
          }
        }
      }
      Some(false) => {
        if uri.contains("hoyoverse.com")
          || uri.contains("mihoyo.com")
          || uri.contains("yuanshen.com")
        {
          // Handle CONNECTs
          if req.method().as_str() == "CONNECT" {
            let builder = Response::builder()
              .header("DecryptEndpoint", "Created")
              .status(StatusCode::OK);
            let res = builder.body(()).unwrap();

            // Respond to CONNECT
            *res.body()
          } else {
            let uri_path_and_query = req.uri().path_and_query().unwrap().as_str();
            // Create new URI.
            let new_uri =
              Uri::from_str(format!("{}{}", SERVER.lock().unwrap(), uri_path_and_query).as_str())
                .unwrap();
            // Set request URI to the new one.
            *req.uri_mut() = new_uri;
          }
        }
      }
      // Use default as fallback
      None => {
        if uri.contains("hoyoverse.com")
          || uri.contains("mihoyo.com")
          || uri.contains("yuanshen.com")
        {
          // Handle CONNECTs
          if req.method().as_str() == "CONNECT" {
            let builder = Response::builder()
              .header("DecryptEndpoint", "Created")
              .status(StatusCode::OK);
            let res = builder.body(()).unwrap();

            // Respond to CONNECT
            *res.body()
          } else {
            let uri_path_and_query = req.uri().path_and_query().unwrap().as_str();
            // Create new URI.
            let new_uri =
              Uri::from_str(format!("{}{}", SERVER.lock().unwrap(), uri_path_and_query).as_str())
                .unwrap();
            // Set request URI to the new one.
            *req.uri_mut() = new_uri;
          }
        }
      }
    }

    req.into()
  }

  async fn handle_response(
    &mut self,
    _context: &HttpContext,
    response: Response<Body>,
  ) -> Response<Body> {
    response
  }

  async fn should_intercept(&mut self, _ctx: &HttpContext, _req: &Request<Body>) -> bool {
    let uri = _req.uri().to_string();

    let more = get_config().redirect_more;

    match more {
      Some(true) => {
        uri.contains("hoyoverse.com")
          || uri.contains("mihoyo.com")
          || uri.contains("yuanshen.com")
          || uri.contains("starrails.com")
          || uri.contains("bhsr.com")
          || uri.contains("bh3.com")
          || uri.contains("honkaiimpact3.com")
          || uri.contains("zenlesszonezero.com")
      }
      Some(false) => {
        uri.contains("hoyoverse.com") || uri.contains("mihoyo.com") || uri.contains("yuanshen.com")
      }
      None => {
        uri.contains("hoyoverse.com") || uri.contains("mihoyo.com") || uri.contains("yuanshen.com")
      }
    }
  }
}

/**
 * Starts an HTTP(S) proxy server.
 */
pub async fn create_proxy(proxy_port: u16, certificate_path: String) {
  let cert_path = PathBuf::from(certificate_path);
  let pk_path = cert_path.join("private.key");
  let ca_path = cert_path.join("cert.crt");

  // Get the certificate and private key.
  let mut private_key_bytes: &[u8] = &match fs::read(&pk_path) {
    // Try regenerating the CA stuff and read it again. If that doesn't work, quit.
    Ok(b) => b,
    Err(e) => {
      println!("Encountered {}. Regenerating CA cert and retrying...", e);
      generate_ca_files(&data_dir().unwrap().join("cultivation"));

      fs::read(&pk_path).expect("Could not read private key")
    }
  };

  let mut ca_cert_bytes: &[u8] = &match fs::read(&ca_path) {
    // Try regenerating the CA stuff and read it again. If that doesn't work, quit.
    Ok(b) => b,
    Err(e) => {
      println!("Encountered {}. Regenerating CA cert and retrying...", e);
      generate_ca_files(&data_dir().unwrap().join("cultivation"));

      fs::read(&ca_path).expect("Could not read certificate")
    }
  };

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
      // Only write should be needed but too many cases of Culti not being able to read/write proxy settings
      Security::AllAccess,
    )
    .unwrap();

  // Set registry values.
  settings
    .set_value("ProxyServer", &Data::String(server_string.parse().unwrap()))
    .unwrap();
  settings.set_value("ProxyEnable", &Data::U32(1)).unwrap();

  println!("Connected to the proxy.");
}

#[cfg(target_os = "linux")]
pub fn connect_to_proxy(proxy_port: u16) {
  let mut config = Config::get().unwrap();
  let proxy_addr = format!("127.0.0.1:{}", proxy_port);
  if !config.game.environment.contains_key("http_proxy") {
    config
      .game
      .environment
      .insert("http_proxy".to_string(), proxy_addr.clone());
  }
  if !config.game.environment.contains_key("https_proxy") {
    config
      .game
      .environment
      .insert("https_proxy".to_string(), proxy_addr);
  }
  Config::update(config);
}

#[cfg(target_od = "macos")]
pub fn connect_to_proxy(_proxy_port: u16) {
  println!("No Mac support yet. Someone mail me a Macbook and I will do it B)")
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
      Security::AllAccess,
    )
    .unwrap();

  // Set registry values.
  settings.set_value("ProxyEnable", &Data::U32(0)).unwrap();

  println!("Disconnected from proxy.");
}

#[cfg(target_os = "linux")]
pub fn disconnect_from_proxy() {
  let mut config = Config::get().unwrap();
  if config.game.environment.contains_key("http_proxy") {
    config.game.environment.remove("http_proxy");
  }
  if config.game.environment.contains_key("https_proxy") {
    config.game.environment.remove("https_proxy");
  }
  Config::update(config);
}

#[cfg(target_os = "macos")]
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
    None,
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
    None,
  );
  println!("Installed certificate.");
}

#[cfg(target_os = "linux")]
pub fn install_ca_files(_cert_path: &Path) {
  println!("install_ca_files is not implemented");
}

#[cfg(not(any(windows, target_os = "macos", target_os = "linux")))]
pub fn install_ca_files(_cert_path: &Path) {
  println!("Certificate installation is not supported on this platform.");
}
