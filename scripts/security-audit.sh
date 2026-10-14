#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-all}"

LOCAL_CARGO_AUDIT="$ROOT_DIR/.context/tools/cargo-audit/bin/cargo-audit"
# RUSTSEC-2023-0071 concerns a network-observable RSA private-key decryption
# oracle and has no fixed upstream release. Both Rust packages use rsa only for
# key generation, RS256 signing, and public-key verification; neither exposes
# RSA decryption.
CARGO_AUDIT_IGNORES=(--ignore RUSTSEC-2023-0071)

detect_semgrep_cmd() {
  if command -v semgrep >/dev/null 2>&1; then
    echo "semgrep"
  elif command -v uvx >/dev/null 2>&1; then
    echo "uvx semgrep"
  else
    echo "semgrep not found. Install with:" >&2
    echo "  uv tool install semgrep" >&2
    return 127
  fi
}

SEMGREP_CMD="${SEMGREP_CMD:-$(detect_semgrep_cmd)}"

run_cargo_audit_version() {
  if command -v cargo-audit >/dev/null 2>&1; then
    cargo-audit --version
  elif cargo audit --version >/dev/null 2>&1; then
    cargo audit --version
  elif [[ -x "$LOCAL_CARGO_AUDIT" ]]; then
    "$LOCAL_CARGO_AUDIT" --version
  else
    echo "cargo-audit not found. Install with:" >&2
    echo "  cargo install cargo-audit --locked --root .context/tools/cargo-audit" >&2
    return 127
  fi
}

run_cargo_audit() {
  local package_dir
  for package_dir in server server-wasm; do
    if command -v cargo-audit >/dev/null 2>&1; then
      (cd "$ROOT_DIR/$package_dir" && cargo-audit audit "${CARGO_AUDIT_IGNORES[@]}")
    elif cargo audit --version >/dev/null 2>&1; then
      (cd "$ROOT_DIR/$package_dir" && cargo audit "${CARGO_AUDIT_IGNORES[@]}")
    elif [[ -x "$LOCAL_CARGO_AUDIT" ]]; then
      (cd "$ROOT_DIR/$package_dir" && "$LOCAL_CARGO_AUDIT" audit "${CARGO_AUDIT_IGNORES[@]}")
    else
      echo "cargo-audit not found. Install with:" >&2
      echo "  cargo install cargo-audit --locked --root .context/tools/cargo-audit" >&2
      return 127
    fi
  done
}

run_semgrep_version() {
  # shellcheck disable=SC2086
  $SEMGREP_CMD --version
}

run_semgrep_scan() {
  # shellcheck disable=SC2086
  $SEMGREP_CMD scan \
    --config p/owasp-top-ten \
    --config p/rust \
    --config p/javascript \
    --config p/typescript \
    --disable-version-check \
    --metrics=off \
    --timeout=30 \
    --exclude node_modules \
    --exclude target \
    --exclude .next \
    --exclude package-lock.json \
    "$ROOT_DIR"
}

case "$MODE" in
  versions)
    run_cargo_audit_version
    run_semgrep_version
    ;;
  cargo)
    run_cargo_audit
    ;;
  semgrep)
    run_semgrep_scan
    ;;
  all)
    run_cargo_audit
    run_semgrep_scan
    ;;
  *)
    echo "Usage: $0 [versions|cargo|semgrep|all]" >&2
    exit 2
    ;;
esac
