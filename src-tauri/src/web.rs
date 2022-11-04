use crate::error::CultivationResult;
use reqwest::{
  header::{CONTENT_TYPE, USER_AGENT},
  Client,
};

#[inline]
pub(crate) async fn query(site: &str, client: Client) -> CultivationResult<String> {
  let response = client
    .get(site)
    .header(USER_AGENT, "cultivation")
    .header(CONTENT_TYPE, "application/json")
    .send()
    .await?;
  response.text().await.map_err(Into::into)
}

#[tauri::command]
pub(crate) async fn valid_url(
  url: String,
  client: tauri::State<'_, Client>,
) -> CultivationResult<bool> {
  let response = client
    .get(url)
    .header(USER_AGENT, "cultivation")
    .send()
    .await?;

  Ok(response.status().as_str() == "200")
}

#[tauri::command]
pub async fn web_get(url: String, client: tauri::State<'_, Client>) -> CultivationResult<String> {
  // Send a GET request to the specified URL and send the response body back to
  // the client.
  query(&url, client.inner().clone()).await
}
