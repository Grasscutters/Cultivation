pub(crate) async fn query(site: &str) -> String {
    let response = reqwest::get(site).await.unwrap();
    return response.text().await.unwrap();
}