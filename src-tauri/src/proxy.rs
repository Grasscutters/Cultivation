/*
 * Built on example code from:
 * https://github.com/omjadas/hudsucker/blob/main/examples/log.rs
 */

use hudsucker::{
    async_trait::async_trait,
    certificate_authority::RcgenAuthority,
    hyper::{Body, Request, Response},
    *,
};
use std::net::SocketAddr;
use tracing::*;
use tokio_tungstenite::tungstenite::Message;

/**
 * Starts an HTTP(S) proxy server.
 */
async fn start_proxy() {
    
}