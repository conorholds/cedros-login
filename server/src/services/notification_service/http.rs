/// Default timeout for notification webhooks (seconds).
pub(super) const NOTIFICATION_TIMEOUT_SECS: u64 = 10;
const WEBHOOK_ERROR_BODY_MAX_BYTES: usize = 4096;

pub(super) struct BodySnippet {
    buffer: Vec<u8>,
    max_bytes: usize,
    truncated: bool,
}

impl BodySnippet {
    pub(super) fn new(max_bytes: usize) -> Self {
        Self {
            buffer: Vec::new(),
            max_bytes,
            truncated: false,
        }
    }

    pub(super) fn push_chunk(&mut self, chunk: &[u8]) {
        if self.truncated {
            return;
        }
        if self.buffer.len() >= self.max_bytes {
            self.truncated = true;
            return;
        }

        let remaining = self.max_bytes - self.buffer.len();
        if chunk.len() > remaining {
            self.buffer.extend_from_slice(&chunk[..remaining]);
            self.truncated = true;
        } else {
            self.buffer.extend_from_slice(chunk);
        }
    }

    pub(super) fn finish(self) -> String {
        let mut body = String::from_utf8_lossy(&self.buffer).to_string();
        if self.truncated {
            body.push_str("… [truncated]");
        }
        body
    }
}

pub(super) async fn read_webhook_error_body(mut response: reqwest::Response) -> String {
    let mut snippet = BodySnippet::new(WEBHOOK_ERROR_BODY_MAX_BYTES);
    while let Ok(Some(chunk)) = response.chunk().await {
        snippet.push_chunk(&chunk);
        if snippet.truncated {
            break;
        }
    }
    snippet.finish()
}
