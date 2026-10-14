# Cedros Package Archive

`<version>` denotes the release version in `cedros-extension.manifest.json`.
Use that exact version in package metadata, archive names, and deployment checks.

`cedros-login` uses a repeatable local ZIP lane for package archive generation.
The `.cedros-extension.zip` artifact is the complete install artifact: it
carries canonical manifest/bootstrap JSON, the compiled React admin runtime, and
the compiled server Wasm backend.

## Commands

| Purpose | Command |
|---|---|
| Build archive and release packet | `node scripts/package-cedros-extension.mjs` |
| Validate archive bytes and release packet | `node scripts/validate-cedros-package-archive.mjs` |
| One-shot package lane | `make cedros-package` |

The package script regenerates manifest/bootstrap files, runs
`make cedros-validate`, builds the React package, verifies package exports,
builds the Wasm server component, writes ZIP artifacts to `dist/`, and prints
their SHA-256 checksums.

## Archive Entries

Required root entries:

- `cedros-extension.manifest.json`
- `cedros-extension.bootstrap.json`
- `cedros-extension.server.wasm`
- archive-local React and React Native package metadata whose Cedros runtime
  registration exports are package-relative ESM strings, as required by the
  intake validator; the source npm packages retain their published conditional
  exports
- `workspace/README.md`

Review workspace entries are listed in
`docs/cedros-package-archive-map.json`. The intake ZIP includes the compiled
React admin runtime under `workspace/react/dist/**`, the server/React/RN package
metadata and registration entrypoints, a small source slice for review, and the
package/host handoff maps.

Excluded from the archive: dependency directories, source maps (`*.map`), the
MSW test worker, `.git`, environment files, secrets, private keys, raw logs,
machine-local paths, build caches, and dependency caches.

## Output

| Artifact | Path |
|---|---|
| Local intake ZIP | `dist/cedros-login-<version>.cedros-extension.zip` |
| Source review ZIP | `dist/cedros-login-<version>.source-review.zip` |
| Release packet | `dist/cedros-login-<version>.release.json` |
| React runtime tarball | `dist/cedros-login-react-<version>.tgz` |

The release packet records checksums, package-family status, validation
commands, supply-chain verification status, readiness table, install and launch
gates, smoke checklist, rollback instructions, known risks, and remaining
native handoff rows. The enclosing ZIP checksum is not written into the manifest
because the manifest is part of the ZIP bytes.

## Supply Chain

`supplyChain` evidence is omitted from the current author manifest. The release
packet uses `supplyChainVerification.status: "not-provided"`. Add real
source/provenance/SBOM/signature evidence only when immutable URLs and SHA-256
digests exist for this release.

## Upload Notes

Upload only `dist/cedros-login-<version>.cedros-extension.zip` through Cedros local
package intake after `make cedros-package` passes. Do not upload the
`.source-review.zip` unless Cedros approves a separate source review lane.

Cedros Data hydrates `cedros-login:admin` from
`workspace/react/dist/admin/register.js` and executes server routes/jobs through
`cedros-extension.server.wasm`. Native screen/provider activation still requires
the mobile host handoff.

## Common Failures

| Failure | Fix |
|---|---|
| Missing manifest/bootstrap/root Wasm entry | Re-run `make cedros-package`. |
| Manifest/bootstrap mismatch | Regenerate from `cedros_login::register_extension_family`. |
| Unsafe archive path | Remove absolute, parent-directory, backslash, or hidden secret paths from the entry plan. |
| Archive includes unmapped entry | Update the package entry plan or generated archive map; do not weaken validation. |
| Package version mismatch | Align `packageFamily` with Cargo/npm metadata or document intentional root-version differences. |
| ZIP exceeds intake limits | Remove advisory source entries before removing canonical runtime entries. |
| `supplyChain` self-asserts verification | Remove author-supplied verification fields; Cedros computes verification outside the manifest. |
