use reqwest::header::USER_AGENT;

pub(crate) async fn query(site: &str) -> String {
  let client = reqwest::Client::new();

  let response = client.get(site).header(USER_AGENT, "cultivation").send().await.unwrap();
  return response.text().await.unwrap();
}