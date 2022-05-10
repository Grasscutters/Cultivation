/*
 * Built on example code from:
 * https://github.com/omjadas/hudsucker/blob/main/examples/log.rs
 */

use hudsucker::{
    async_trait::async_trait,
    certificate_authority::RcgenAuthority,
    hyper::{Body, Request, Response},
    *
};

use std::net::SocketAddr;
use registry::{Hive, Data, Security};

use rustls_pemfile as pemfile;

/**
 * Application shutdown handler.
 */
async fn shutdown_signal() {
    disconnect_from_proxy();
}

#[derive(Clone)]
struct ProxyHandler;

#[async_trait]
impl HttpHandler for ProxyHandler {
    async fn handle_request(&mut self, 
                    _context: &HttpContext, 
                    request: Request<Body>
    ) -> RequestOrResponse {
        println!("{:?}", request.uri().path());
        RequestOrResponse::Request(request)
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
    
    // Create the proxy & listen for errors.
    proxy.start(shutdown_signal()).await
        .expect("Failed to start proxy");
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
}