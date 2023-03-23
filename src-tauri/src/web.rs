use reqwest::header::{CONTENT_TYPE, USER_AGENT};

pub(crate) async fn query(site: &str) -> String {
  let client = reqwest::Client::new();

  let response = client
    .get(site)
    .header(USER_AGENT, "cultivation")
    .header(CONTENT_TYPE, "application/json")
    .send()
    .await
    .ok();

  if response.is_some() {
    return response.unwrap().text().await.unwrap();
  } else {
    false.to_string()
  }
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
