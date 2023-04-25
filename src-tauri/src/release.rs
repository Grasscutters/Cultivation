#[derive(serde::Serialize, serde::Deserialize)]
pub struct Release {
  pub tag_name: String,
  pub link: String,
}

#[tauri::command]
pub async fn get_latest_release() -> Release {
  // NotThorny edition requests to repo so as to avoid update spam from official repo -alpha version diff.
  let url = "https://api.github.com/repos/NotThorny/Cultivation/releases/latest";
  let client = reqwest::Client::new();
  let response = client
    .get(url)
    .header("User-Agent", "Cultivation")
    .send()
    .await
    .unwrap();
  let text = response.text().await.unwrap();

  //println!("Response: {}", text);

  // Parse "tag_name" from JSON
  let json: serde_json::Value = serde_json::from_str(&text).unwrap();
  let tag_name = json["tag_name"].as_str().unwrap();

  // Parse "html_url"
  let link = json["html_url"].as_str().unwrap();

  Release {
    tag_name: tag_name.to_string(),
    link: link.to_string(),
  }
}
