#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUBLISH_REPO="${PUBLISH_REPO:-$HOME/Workspace/published/cedros-login/react-native}"

mkdir -p "$PUBLISH_REPO"

cd "$REPO_ROOT/react-native"

if [ -d "node_modules" ]; then
  echo "Running typecheck..."
  npm run typecheck
  echo "Running lint..."
  npm run lint
else
  echo "Warning: node_modules not found, skipping typecheck and lint"
  echo "Install dependencies with: npm install"
fi

echo "Copying React Native library to publish repo..."

rm -rf "$PUBLISH_REPO/src"
rm -rf "$PUBLISH_REPO/example"

cp -r src "$PUBLISH_REPO/"

cp package.json "$PUBLISH_REPO/"
cp tsconfig.json "$PUBLISH_REPO/"
cp README.md "$PUBLISH_REPO/"
cp LICENSE "$PUBLISH_REPO/" 2>/dev/null || true

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('$PUBLISH_REPO/package.json', 'utf8'));

// React Native libraries ship source, not dist
pkg.main = './src/index.ts';
pkg.module = './src/index.ts';
pkg.types = './src/index.ts';
pkg.exports = {
  '.': {
    import: {
      types: './src/index.ts',
      default: './src/index.ts'
    },
    require: {
      types: './src/index.ts',
      default: './src/index.ts'
    }
  },
};

// Ship src/ directory
pkg.files = ['src', 'README.md', 'LICENSE', 'tsconfig.json'];

// Keep only production scripts
delete pkg.scripts.dev;
delete pkg.scripts['lint:fix'];
delete pkg.scripts.format;
delete pkg.scripts['format:check'];
delete pkg.scripts['test:watch'];
delete pkg.scripts['test:coverage'];
delete pkg.scripts.typecheck;
delete pkg.scripts.build;
delete pkg.scripts['prepublishOnly'];
delete pkg.scripts.release;

// Remove all devDependencies for published package (Metro will handle building)
delete pkg.devDependencies;

fs.writeFileSync('$PUBLISH_REPO/package.json', JSON.stringify(pkg, null, 2) + '\n');
"

if [ -n "${1:-}" ]; then
  cd "$PUBLISH_REPO"
  CURRENT=$(node -p "require('./package.json').version")
  if [ "$CURRENT" != "$1" ]; then
    npm version "$1" --no-git-tag-version
  fi
fi

echo "React Native library ready to publish from $PUBLISH_REPO"
echo "  cd $PUBLISH_REPO && npm publish --access public"
