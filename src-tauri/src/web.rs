use crate::error::CultivationResult;
use reqwest::header::{CONTENT_TYPE, USER_AGENT};

#[inline]
pub(crate) async fn query(site: &str) -> CultivationResult<String> {
  let client = reqwest::Client::new();

  let response = client
    .get(site)
    .header(USER_AGENT, "cultivation")
    .header(CONTENT_TYPE, "application/json")
    .send()
    .await?;
  response.text().await.map_err(Into::into)
}

#[tauri::command]
pub(crate) async fn valid_url(url: String) -> CultivationResult<bool> {
  // Check if we get a 200 response
  let client = reqwest::Client::new();

  let response = client
    .get(url)
    .header(USER_AGENT, "cultivation")
    .send()
    .await?;

  Ok(response.status().as_str() == "200")
}

#[tauri::command]
#[inline(always)]
pub async fn web_get(url: String) -> CultivationResult<String> {
  // Send a GET request to the specified URL and send the response body back to
  // the client.
  query(&url).await
}
