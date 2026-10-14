#!/bin/bash
set -euo pipefail

# Usage: ./scripts/release.sh [major|minor|patch]

VERSION_TYPE=${1:-patch}

echo "Starting release process ($VERSION_TYPE)..."

BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "Error: Must be on main branch to release"
    exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
    echo "Error: Working directory is not clean"
    exit 1
fi

echo "Running checks..."
make test
make lint
make build

# Note: fmt-check is intentionally not run here yet.
# The repo currently has formatting drift vs Prettier, and enforcing it in the
# release script would break releases until formatting is normalized.

echo "Bumping version..."
cd ui
npm version "$VERSION_TYPE" --no-git-tag-version
NEW_VERSION=$(node -p "require('./package.json').version")
cd ..

cd react-native
npm version "$NEW_VERSION" --no-git-tag-version
cd ..

echo "Updating server version to $NEW_VERSION..."
sed -i.bak "s/^version = \".*\"/version = \"$NEW_VERSION\"/" server/Cargo.toml
rm -f server/Cargo.toml.bak

ACTUAL_VERSION=$(sed -n 's/^version = "\(.*\)"/\1/p' server/Cargo.toml | head -1)
if [ "$ACTUAL_VERSION" != "$NEW_VERSION" ]; then
  echo "ERROR: Cargo.toml version update failed. Expected $NEW_VERSION, got $ACTUAL_VERSION"
  exit 1
fi

echo "Please update CHANGELOG.md with release notes for v$NEW_VERSION"
echo "Press Enter when ready to continue..."
IFS= read -r

git add -A
git commit -m "chore: release v$NEW_VERSION"

git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

echo "About to push to origin (main + tag v$NEW_VERSION)."
IFS= read -r -p "Proceed? [y/N] " CONFIRM
if [ "${CONFIRM:-N}" != "y" ] && [ "${CONFIRM:-N}" != "Y" ]; then
    echo "Aborted before push."
    exit 1
fi

echo "Pushing to origin..."
git push origin main
git push origin "v$NEW_VERSION"

echo ""
echo "Release v$NEW_VERSION created!"
echo ""
echo "Next steps:"
echo "1. Publish UI to npm: cd ui && npm publish --access public"
echo "2. Publish server to crates.io: cd server && cargo publish"
echo "3. Create GitHub release at https://github.com/conorholds/cedros-login/releases/new?tag=v$NEW_VERSION"
