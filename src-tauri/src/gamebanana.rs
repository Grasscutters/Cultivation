use crate::web;

static API_URL: &str = "https://api.gamebanana.com";
static SITE_URL: &str = "https://gamebanana.com";

#[tauri::command]
pub async fn list_submissions(mode: String) -> String {
  let res = web::query(
    format!(
      "{}/apiv9/Util/Game/Submissions?_idGameRow=8552&_nPage=1&_nPerpage=50&_sMode={}",
      SITE_URL, mode
    )
    .as_str(),
  )
  .await;

  res
}
