/*
 * Built on example code from:
 * https://github.com/omjadas/hudsucker/blob/main/examples/log.rs
 */

use hudsucker::{
    async_trait::async_trait,
    certificate_authority::RcgenAuthority,
    hyper::{Body, Request, Response},
    tungstenite::Message,
    tungstenite::protocol::WebSocketContext,
    http::HttpsConnector,
    *
};
use std::net::SocketAddr;
use hudsucker::hyper::client::HttpConnector;
use registry::{Hive, Data, Security};
use rustls_pemfile as pemfile;

#[derive(Clone)]
struct ProxyHandler;

#[async_trait]
impl HttpHandler for ProxyHandler {
    async fn handle_request(&mut self, 
                      context: &HttpContext, 
                      request: Request<Body>
    ) -> RequestOrResponse {
        println!("{:?}", request.uri().path());
        RequestOrResponse::Request(request)
    }
    
    async fn handle_response(&mut self, 
                             context: &HttpContext, 
                             response: Response<Body>
    ) -> Response<Body> { response }
}

/**
 * Starts an HTTP(S) proxy server.
 */
pub(crate) async fn create_proxy() -> Proxy<HttpsConnector, RcgenAuthority, ProxyHandler, NoopMessageHandler, NoopMessageHandler> {
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
    return ProxyBuilder::new()
        .with_addr(SocketAddr::from([127, 0, 0, 1], 8080))
        .with_rustls_client()
        .with_ca(authority)
        .with_http_handler(ProxyHandler)
        .build();
}

/**
 * Connects to the local HTTP(S) proxy server.
 */
pub(crate) fn connect_to_proxy() {
    if cfg!(target_os = "windows") {
        // Fetch the 'Internet Settings' registry key.
        let settings = Hive::CurrentUser.open(r"Software\Microsoft\Windows\CurrentVersion\Internet Settings", Security::Write);
        
        // Set registry values.
        settings.set_value("ProxyServer", &Data::String("http=127.0.0.1:8080;https=127.0.0.1:8080;ftp=127.0.0.1:8080".parse().unwrap()));
        settings.set_value("ProxyEnable", &Data::U32(1));
    }
}

/**
 * Disconnects from the local HTTP(S) proxy server.
 */
pub(crate) fn disconnect_from_proxy() {
    if cfg!(target_os = "windows") {
        // Fetch the 'Internet Settings' registry key.
        let settings = Hive::CurrentUser.open(r"Software\Microsoft\Windows\CurrentVersion\Internet Settings", Security::Write);

        // Set registry values.
        settings.set_value("ProxyEnable", &Data::U32(0));
    }
}