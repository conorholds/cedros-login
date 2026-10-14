#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUBLISH_REPO="${PUBLISH_REPO:-$HOME/Workspace/published/cedros-login/server-rust}"

mkdir -p "$PUBLISH_REPO"

cd "$REPO_ROOT/server"
cargo build --release --locked

# Clear src/ before copying to prevent stale publish artifacts.
rm -rf "$PUBLISH_REPO/src" "$PUBLISH_REPO/migrations"
cp -r src "$PUBLISH_REPO/"
cp Cargo.toml "$PUBLISH_REPO/"
cp Cargo.lock "$PUBLISH_REPO/" 2>/dev/null || true
cp LICENSE "$PUBLISH_REPO/" 2>/dev/null || true
cp README.md "$PUBLISH_REPO/" 2>/dev/null || true
cp CHANGELOG.md "$PUBLISH_REPO/" 2>/dev/null || true
cp -r migrations "$PUBLISH_REPO/" 2>/dev/null || true

if [ -n "${1:-}" ]; then
  cd "$PUBLISH_REPO"
  CURRENT=$(sed -n 's/^version = "\(.*\)"$/\1/p' Cargo.toml | head -1)
  if [ "$CURRENT" != "$1" ]; then
    # macOS sed requires an empty extension after -i; Linux sed does not.
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s/^version = .*/version = \"$1\"/" Cargo.toml
    else
      sed -i "s/^version = .*/version = \"$1\"/" Cargo.toml
    fi
  fi
fi

echo "Server ready to publish from $PUBLISH_REPO"
echo "  cd $PUBLISH_REPO && cargo publish"
