/*
 * Built on example code from:
 * https://github.com/omjadas/hudsucker/blob/main/examples/log.rs
 */

use std::borrow::Borrow;
use hudsucker::{
    async_trait::async_trait,
    certificate_authority::RcgenAuthority,
    hyper::{Body, Request, Response},
    *
};

use std::net::SocketAddr;
use registry::{Hive, Data, Security};

use rustls_pemfile as pemfile;
use tauri::http::Uri;
use tokio::sync::oneshot::Sender;

async unsafe fn shutdown_signal() {
    tokio::signal::ctrl_c().await
        .expect("Failed to install CTRL+C signal handler");
}

#[derive(Clone)]
struct ProxyHandler;

#[async_trait]
impl HttpHandler for ProxyHandler {
    async fn handle_request(&mut self, 
                    _context: &HttpContext, 
                    request: Request<Body>
    ) -> RequestOrResponse {
        // Get request parts.
        let (parts, body) = request.into_parts();

        // Parse request URI.
        let mut uri = parts.uri.clone();
        let path = uri.to_string();

        // Check URI against constraints.
        if path.contains("hoyoverse.com") || path.contains("mihoyo.com") || path.contains("yuanshen.com") {
            let mut new_uri = String::new();
            new_uri.push_str("127.0.0.1");
            new_uri.push_str(uri.path());

            uri = Uri::from_static(new_uri.as_str());
        }

        let builder = Request::builder()
            .method(&parts.method)
            .uri(&uri)
            .version(parts.version);
        let modified = builder.body(body).unwrap();

        RequestOrResponse::Request(modified)
    }
    
    async fn handle_response(&mut self,
                    _context: &HttpContext, 
                    response: Response<Body>
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
    unsafe {
        tokio::spawn(proxy.start(shutdown_signal()));
    }
}

/**
 * Connects to the local HTTP(S) proxy server.
 */
pub(crate) fn connect_to_proxy(proxy_port: u16) {
    if cfg!(target_os = "windows") {
        // Create 'ProxyServer' string.
        let server_string: String = format!("http=127.0.0.1:{};https=127.0.0.1:{};ftp=127.0.0.1:{}", proxy_port, proxy_port, proxy_port);

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