# Publishing

GitHub source publication and registry package releases are separate workflows.
The source-available [license](LICENSE.md) applies to the current source snapshot;
historical MIT releases retain their original notices in Git history.

## Prepare the public GitHub source checkout

Export into a separate checkout of this public repository from clean,
committed source:

```bash
make publish-source PUBLISH_REPO=/path/to/public-checkout PUBLISH_ARGS=--dry-run
make publish-source PUBLISH_REPO=/path/to/public-checkout
# Equivalent: ./scripts/publish.sh [committed-version] [--dry-run]
```

Override the checkout root with `PUBLISH_REPO=/path/to/cedros-login`. It must
already be a Git checkout with the matching public origin and no tracked,
untracked, or ignored local changes. The source and destination must be separate,
non-nested directories. `make publish-all` is an alias for this source workflow.

Preparation replaces the old `react/`, `server-rust/`, and package-artifact layout
with the committed source tree, including Wasm, standalone server, React, native,
contracts, documentation, and current license. Git history and remotes remain
intact. Agent instructions at any depth, local agent configuration, environment
secrets, build outputs, and ZIPs are excluded; environment examples and
credential-free npm settings are retained.
Only committed files are exported. Review the source for publication before
running this workflow; file exclusions are not a full secret audit.

The script does not compile, change versions, commit, push, upload packages, or
deploy an extension. Review `git status` and `git diff` in the publish checkout,
then commit and push there when ready. Archive releases and installed-host
acceptance remain part of the separate extension release workflow.

Publishing is an operator-run workflow. It writes to a separate publish
checkout and can publish packages or push tags, so inspect the scripts and use
a clean `main` checkout.

## Prepare a release

`scripts/release.sh` runs the full test, lint, and build commands, bumps the
Cargo and npm package manifests in lockstep, pauses for operator updates,
creates a commit and tag, and asks before pushing either. Run it only when you
intend to perform that complete release operation:

```bash
./scripts/release.sh patch   # or minor / major
```

During the script's pause—or for a manually prepared release—update these files
together and regenerate the extension shell:

- `server/Cargo.toml` and `server/Cargo.lock`
- `ui/package.json` and `ui/package-lock.json`
- `react-native/package.json` and `react-native/package-lock.json`
- generated manifest copies via `node scripts/generate-cedros-extension-shell.mjs`

Record user-visible changes in `CHANGELOG.md` and, for React-specific changes,
`ui/CHANGELOG.md`. Run `make cedros-validate` after regeneration and before
allowing the release script to commit.

## Prepare registry package directories

Select a separate destination for each package with `PUBLISH_REPO`. Preparation
replaces package contents in that destination, so use a dedicated publish
checkout:

```bash
PUBLISH_REPO=/path/to/publish/server-rust ./scripts/publish-server.sh
PUBLISH_REPO=/path/to/publish/react ./scripts/publish-ui.sh
PUBLISH_REPO=/path/to/publish/react-native ./scripts/publish-react-native.sh
```

Use an explicit, separate destination for each package to avoid replacing
the source checkout. `make publish-packages` prepares all three
default package destinations; do not give that aggregate target a shared `PUBLISH_REPO`.
An individual script accepts an explicit version as its first argument.

Review and commit the prepared files in the separate publish repository before
publishing. The preparation scripts do not publish to crates.io or npm.

## Publish

From the reviewed publish checkout:

```bash
# From the prepared Rust package directory:
cargo publish

# From each prepared npm package directory:
npm publish --access public
```

Registry credentials, npm passkeys, repository pushes, and release-page
creation remain manual operator responsibilities.
