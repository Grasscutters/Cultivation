use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CultivationError {
  #[cfg_attr(debug_assertions, error("IO error has occured: {:?}", .0))]
  // We hide sensitive io information in production
  #[cfg_attr(not(debug_assertions), error("IO error has occured."))]
  IO(#[from] tokio::io::Error),
  #[error("Tauri failed with an error: {}", .0)]
  Tauri(#[from] tauri::Error),
  #[error("Failed to create zip archive: {}", .0)]
  Zip(#[from] zip::result::ZipError),
  #[error("HTTP request failed: '{}'", .0)]
  Reqwest(#[from] reqwest::Error), /* TODO: generics?
                                    * Unrar(#[from] unrar::error::UnrarError<>) */
  #[error("Malformed language config: {}", .0)]
  MalformedLangObject(#[from] serde_json::Error),
  #[error("Custom error: {}", .0)]
  Custom(String),
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
