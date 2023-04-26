use http::header;
use once_cell::sync::Lazy;
use reqwest::header::{CONTENT_TYPE, USER_AGENT};
static CLIENT: Lazy<reqwest::Client> = Lazy::new(|| {
  let mut headers = header::HeaderMap::new();
  headers.insert(USER_AGENT, header::HeaderValue::from_static("cultivation"));
  headers.insert(
    CONTENT_TYPE,
    header::HeaderValue::from_static("application/json"),
  );

  let client = reqwest::Client::builder().default_headers(headers);
  client.build().unwrap()
});

pub(crate) async fn query(site: &str) -> String {
  CLIENT
    .get(site)
    .send()
    .await
    .expect("Failed to get web response")
    .text()
    .await
    .unwrap()
}

#[tauri::command]
pub(crate) async fn valid_url(url: String) -> bool {
  // Check if we get a 200 response
  let client = reqwest::Client::new();

  let response = client
    .get(url)
    .header(USER_AGENT, "cultivation")
    .send()
    .await
    .ok();

  if response.is_some() {
    return response.unwrap().status().as_str() == "200";
  } else {
    false
  }
}

#[tauri::command]
pub async fn web_get(url: String) -> String {
  // Send a GET request to the specified URL and send the response body back to the client.
  query(&url).await
}
