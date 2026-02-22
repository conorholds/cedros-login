//! Agent integration guide
//!
//! - /agent.md - Detailed integration guide for AI agents

use axum::extract::State;
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::services::EmailService;
use crate::AppState;

/// GET /agent.md - Agent integration guide
pub async fn agent_md<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let base = get_base_path(&state);

    let content = format!(
        r#"---
title: Agent Integration Guide
version: "1.0.0"
audience: AI agents, automated systems
recommendedAuth: solana
---

# Cedros Login - Agent Integration Guide

This guide helps AI agents integrate with Cedros Login for authentication and authorization.

## Why Solana Wallet Auth?

For AI agents, Solana wallet authentication is recommended because:

1. **No Email Required** - Create accounts programmatically without email verification
2. **Cryptographic Identity** - Your keypair is your identity, no passwords to manage
3. **Immediate API Key** - Get an API key on first authentication
4. **Standard Tooling** - Use any Ed25519 library (Solana-compatible)

## Complete Integration Example

### Python

```python
import requests
import base58
from solders.keypair import Keypair

# Generate or load your keypair
keypair = Keypair()
public_key = str(keypair.pubkey())

# Step 1: Get challenge
challenge_resp = requests.post(
    "{base}/solana/challenge",
    json={{"publicKey": public_key}}
)
nonce = challenge_resp.json()["nonce"]

# Step 2: Sign the nonce
message_bytes = nonce.encode('utf-8')
signature = keypair.sign_message(message_bytes)
signature_b58 = base58.b58encode(bytes(signature)).decode()

# Step 3: Authenticate
auth_resp = requests.post(
    "{base}/solana",
    json={{
        "publicKey": public_key,
        "signature": signature_b58
    }}
)

result = auth_resp.json()
api_key = result.get("apiKey")  # ck_live_xxx...

# Step 4: Use the API key
headers = {{"Authorization": f"Bearer {{api_key}}"}}
user_resp = requests.get("{base}/user", headers=headers)
print(user_resp.json())
```

### JavaScript/Node.js

```javascript
import {{ Keypair }} from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

// Generate or load keypair
const keypair = Keypair.generate();
const publicKey = keypair.publicKey.toBase58();

// Step 1: Get challenge
const challengeResp = await fetch('{base}/solana/challenge', {{
  method: 'POST',
  headers: {{ 'Content-Type': 'application/json' }},
  body: JSON.stringify({{ publicKey }})
}});
const {{ nonce }} = await challengeResp.json();

// Step 2: Sign the nonce
const messageBytes = new TextEncoder().encode(nonce);
const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
const signatureB58 = bs58.encode(signature);

// Step 3: Authenticate
const authResp = await fetch('{base}/solana', {{
  method: 'POST',
  headers: {{ 'Content-Type': 'application/json' }},
  body: JSON.stringify({{ publicKey, signature: signatureB58 }})
}});

const {{ apiKey }} = await authResp.json();

// Step 4: Use the API key
const userResp = await fetch('{base}/user', {{
  headers: {{ 'Authorization': `Bearer ${{apiKey}}` }}
}});
console.log(await userResp.json());
```

### Rust

```rust
use solana_sdk::{{signature::{{Keypair, Signer}}, signer::keypair::read_keypair_file}};
use reqwest::Client;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {{
    let client = Client::new();
    let keypair = Keypair::new();
    let public_key = keypair.pubkey().to_string();

    // Step 1: Get challenge
    let challenge: serde_json::Value = client
        .post("{base}/solana/challenge")
        .json(&json!({{"publicKey": public_key}}))
        .send()
        .await?
        .json()
        .await?;

    let nonce = challenge["nonce"]
        .as_str()
        .ok_or("Missing nonce in challenge response")?;

    // Step 2: Sign the nonce
    let signature = keypair.sign_message(nonce.as_bytes());
    let signature_b58 = bs58::encode(signature.as_ref()).into_string();

    // Step 3: Authenticate
    let auth: serde_json::Value = client
        .post("{base}/solana")
        .json(&json!({{
            "publicKey": public_key,
            "signature": signature_b58
        }}))
        .send()
        .await?
        .json()
        .await?;

    let api_key = auth["apiKey"]
        .as_str()
        .ok_or("Missing apiKey in auth response")?;
    println!("API Key: {{}}", api_key);

    Ok(())
}}
```

## Best Practices

### 1. Store Your Keypair Securely
- Never commit private keys to version control
- Use environment variables or secure vaults
- Consider using HSMs for production

### 2. Handle Rate Limits
```python
import time

def api_call_with_retry(url, headers, max_retries=3):
    for attempt in range(max_retries):
        resp = requests.get(url, headers=headers)
        if resp.status_code == 429:
            retry_after = int(resp.headers.get('Retry-After', 60))
            time.sleep(retry_after)
            continue
        return resp
    raise Exception("Rate limit exceeded")
```

### 3. Refresh API Keys Periodically
```python
def refresh_api_key(headers):
    resp = requests.post(
        "{base}/user/api-key/regenerate",
        headers=headers
    )
    return resp.json()["apiKey"]
```

### 4. Handle Errors Gracefully
```python
def handle_api_error(response):
    if not response.ok:
        error = response.json()
        code = error.get("code", "UNKNOWN")
        message = error.get("message", "Unknown error")

        if code == "UNAUTHORIZED":
            # Re-authenticate
            pass
        elif code == "RATE_LIMITED":
            # Back off and retry
            pass
        else:
            raise Exception(f"{{code}}: {{message}}")
```

## Common Operations

### Get User Info
```
GET {base}/user
Authorization: Bearer ck_xxx
```

### Update Profile
```
PATCH {base}/me
Authorization: Bearer ck_xxx
Content-Type: application/json

{{"name": "Agent Name"}}
```

### List Organizations
```
GET {base}/orgs
Authorization: Bearer ck_xxx
```

### Create Organization
```
POST {base}/orgs
Authorization: Bearer ck_xxx
Content-Type: application/json

{{"name": "My Org", "slug": "my-org"}}
```

## Rate Limits

| Endpoint Category | Limit |
|------------------|-------|
| Authentication | 10 req/min per IP |
| API Operations | 100 req/min per key |
| Admin Operations | 30 req/min per key |

## Discovery Endpoints

| Endpoint | Description |
|----------|-------------|
| {base}/llms.txt | Brief API summary |
| {base}/llms-full.txt | Complete documentation |
| {base}/skill.md | Skill index |
| {base}/skill.json | Machine-readable metadata |
| {base}/discovery | Auth configuration |
| {base}/openapi.json | Full OpenAPI spec |
| {base}/heartbeat.md | Health status |

## Support

- OpenAPI Spec: {base}/openapi.json
- Full Docs: {base}/llms-full.txt
- Admin Docs: {base}/llms-admin.txt
"#,
        base = base
    );

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/markdown; charset=utf-8")],
        content,
    )
        .into_response()
}

fn get_base_path<C: AuthCallback, E: EmailService>(state: &AppState<C, E>) -> String {
    let base_path = state.config.server.auth_base_path.trim_end_matches('/');
    if base_path.is_empty() {
        String::new()
    } else {
        base_path.to_string()
    }
}
