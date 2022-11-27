use serde::Serialize;
use thiserror::Error;

/*
This will not have mutex lock error
because we are going to get rid of locking data structures so
we can leave unwraps `as is` for now
 */

#[derive(Debug, Error)]
/// Error type to signal about different errors that could occur
/// while Cultivation is running.
pub enum CultivationError {
  // We hide sensitive information in production
  #[cfg_attr(debug_assertions, error("IO error has occured: {:?}", .0))]
  #[cfg_attr(not(debug_assertions), error("IO error has occured."))]
  IO(#[from] tokio::io::Error),
  #[cfg_attr(debug_assertions, error("Tauri failed with an error: {}", .0))]
  #[cfg_attr(not(debug_assertions), error("Tauri failed with an error"))]
  Tauri(#[from] tauri::Error),
  #[cfg_attr(debug_assertions, error("Failed to create zip archive: {}", .0))]
  #[cfg_attr(not(debug_assertions), error("Zip related function has failed"))]
  Zip(#[from] zip::result::ZipError),
  #[cfg_attr(debug_assertions, error("Failed to unzip archive: {}", .0))]
  #[cfg_attr(not(debug_assertions), error("Failed to unzip archive"))]
  Unzip(#[from] zip_extract::ZipExtractError),
  #[cfg_attr(debug_assertions, error("Failed to unrar: {}", .0))]
  #[cfg_attr(not(debug_assertions), error("Failed to unrar"))]
  Unrar(#[from] UnrarError),
  #[cfg_attr(debug_assertions, error("HTTP request failed: {}", .0))]
  #[cfg_attr(not(debug_assertions), error("HTTP request failed"))]
  Reqwest(#[from] reqwest::Error),
  #[cfg_attr(debug_assertions, error("Malformed language config: {}", .0))]
  #[cfg_attr(not(debug_assertions), error("Malformed language config"))]
  MalformedLangObject(#[from] serde_json::Error),
  #[cfg_attr(debug_assertions, error("Ctrlc handler failed: {}", .0))]
  #[cfg_attr(
    not(debug_assertions),
    error("Could not set graceful shutdown handler")
  )]
  CtrlCError(#[from] ctrlc::Error),
  #[cfg_attr(debug_assertions, error("Certificate generation failed: {}", .0))]
  #[cfg_attr(not(debug_assertions), error("Certificate generation has failed."))]
  Certificate(#[from] rcgen::RcgenError),
  #[cfg(windows)]
  #[cfg_attr(debug_assertions, error("Registry error: {}", .0))]
  #[cfg_attr(not(debug_assertions), error("Registry error has occured"))]
  Registry(#[from] registry::Error),
  #[cfg_attr(debug_assertions, error("Custom error: {}", .0))]
  #[cfg_attr(not(debug_assertions), error("Something went wrong"))]
  #[allow(unused)]
  Custom(String),
}

#[derive(Debug, Error)]
#[cfg_attr(debug_assertions, error("Failed to unrar: {}", .0))]
#[cfg_attr(not(debug_assertions), error("Failed to unrar"))]
pub struct UnrarError(String);

impl<T> From<unrar::error::UnrarError<T>> for UnrarError {
  fn from(value: unrar::error::UnrarError<T>) -> Self {
    Self(value.to_string())
  }
}

impl Serialize for CultivationError {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: serde::Serializer,
  {
    serializer.serialize_str(self.to_string().as_ref())
  }
}

pub type CultivationResult<T> = Result<T, CultivationError>;
