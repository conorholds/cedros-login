#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUBLISH_REPO="${PUBLISH_REPO:-$HOME/Workspace/published/cedros-login/react}"

mkdir -p "$PUBLISH_REPO"

cd "$REPO_ROOT/ui"
npm run build
npm run verify:exports
npm run smoke:pack

rm -rf "$PUBLISH_REPO/dist"
cp -r dist "$PUBLISH_REPO/"

rm -f "$PUBLISH_REPO/dist/mockServiceWorker.js"
rm -rf "$PUBLISH_REPO/dist/test"
cp package.json "$PUBLISH_REPO/"

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('$PUBLISH_REPO/package.json', 'utf8'));
delete pkg.scripts;
delete pkg.devDependencies;
delete pkg.msw;
fs.writeFileSync('$PUBLISH_REPO/package.json', JSON.stringify(pkg, null, 2) + '\n');
"

cp README.md "$PUBLISH_REPO/" 2>/dev/null || true
cp LICENSE "$PUBLISH_REPO/" 2>/dev/null || true
cp CHANGELOG.md "$PUBLISH_REPO/" 2>/dev/null || true

if [ -n "${1:-}" ]; then
  cd "$PUBLISH_REPO"
  CURRENT=$(node -p "require('./package.json').version")
  if [ "$CURRENT" != "$1" ]; then
    npm version "$1" --no-git-tag-version
  fi
fi

echo "UI ready to publish from $PUBLISH_REPO"
echo "  cd $PUBLISH_REPO && npm publish --access public"
