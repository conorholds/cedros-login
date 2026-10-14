//! Profile-image object storage over the site storage provider (host `providers`
//! seam, `cedros-login:image-storage` grant). Operations are `put`/`get`/`delete`
//! with base64 `content` under an extension-namespaced key — the canonical
//! contract (13a). There are NO presigned URLs: a stored object is served by
//! reading it back (subject to the host response-size cap).
use super::providers::{execute, STORAGE_ACCESS};
use super::{from_json, to_json, Result, SeamError};
use serde::Serialize;
use serde_json::Value;

const STORAGE_PROVIDER: &str = "storage";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PutRequest<'a> {
    key: &'a str,
    content: &'a str,
    content_type: &'a str,
}

#[derive(Serialize)]
struct KeyRequest<'a> {
    key: &'a str,
}

/// Store base64 `content` at `key` (overwrites). The host records `content_type`.
pub fn put(key: &str, content_b64: &str, content_type: &str) -> Result<()> {
    execute(
        STORAGE_ACCESS,
        STORAGE_PROVIDER,
        "put",
        &to_json(&PutRequest {
            key,
            content: content_b64,
            content_type,
        })?,
    )?;
    Ok(())
}

/// Read the base64 `content` at `key`. Errors if the object is absent.
pub fn get(key: &str) -> Result<String> {
    let raw = execute(
        STORAGE_ACCESS,
        STORAGE_PROVIDER,
        "get",
        &to_json(&KeyRequest { key })?,
    )?;
    from_json::<Value>(&raw)?
        .get("content")
        .and_then(Value::as_str)
        .map(str::to_string)
        .ok_or_else(|| SeamError::Provider("storage get returned no content".to_string()))
}

/// Delete the object at `key` (idempotent on the host side).
pub fn delete(key: &str) -> Result<()> {
    execute(
        STORAGE_ACCESS,
        STORAGE_PROVIDER,
        "delete",
        &to_json(&KeyRequest { key })?,
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn put_request_is_camelcase() {
        let j = serde_json::to_value(PutRequest {
            key: "avatars/u1",
            content: "AAAA",
            content_type: "image/png",
        })
        .unwrap();
        assert_eq!(j["key"], "avatars/u1");
        assert_eq!(j["contentType"], "image/png");
        assert_eq!(j["content"], "AAAA");
    }
}
