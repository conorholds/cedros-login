use std::sync::{
    atomic::{AtomicBool, AtomicUsize, Ordering},
    Arc,
};

pub(super) struct ProviderFixture {
    pub url: String,
    pub calls: Arc<AtomicUsize>,
    pub failing: Arc<AtomicBool>,
    task: tokio::task::JoinHandle<()>,
}
impl Drop for ProviderFixture {
    fn drop(&mut self) {
        self.task.abort();
    }
}
impl ProviderFixture {
    pub async fn start() -> Self {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let url = format!("http://{}", listener.local_addr().unwrap());
        let calls = Arc::new(AtomicUsize::new(0));
        let failing = Arc::new(AtomicBool::new(false));
        let app = axum::Router::new().route(
            "/",
            axum::routing::get({
                let calls = calls.clone();
                let failing = failing.clone();
                move || {
                    let calls = calls.clone();
                    let failing = failing.clone();
                    async move {
                        calls.fetch_add(1, Ordering::SeqCst);
                        tokio::time::sleep(std::time::Duration::from_millis(20)).await;
                        let status = if failing.load(Ordering::SeqCst) {
                            axum::http::StatusCode::SERVICE_UNAVAILABLE
                        } else {
                            axum::http::StatusCode::OK
                        };
                        (status, axum::Json(serde_json::json!({"keys": []})))
                    }
                }
            }),
        );
        let task = tokio::spawn(async move {
            axum::serve(listener, app).await.unwrap();
        });
        Self {
            url,
            calls,
            failing,
            task,
        }
    }
}
