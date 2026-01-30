# @cedros/login-sidecar

Node.js sidecar service for `cedros-login-server`.

This service wraps the JavaScript-only Privacy Cash SDK and provides related Solana utilities
(verification, batching, swaps) used by the Rust backend.

## Requirements

- Node.js >= 24

By default the sidecar binds to `127.0.0.1`. Set `HOST=0.0.0.0` if you need it reachable outside the machine/container.

## Local dev

```bash
cd login-sidecar
nvm use
npm install
npm run dev
```

Configure the Rust server to point at the sidecar:

- `PRIVACY_CASH_SIDECAR_URL` (e.g. `http://localhost:3100`)
- `SIDECAR_API_KEY`
