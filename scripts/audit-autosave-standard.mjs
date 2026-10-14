#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = new URL("..", import.meta.url).pathname;
const sourceRoots = [join(repoRoot, "ui/src")]
  .filter((root) => safeStat(root)?.isDirectory());

const allowedPaths = new Set([
  "ui/src/autosave/AutosaveConflictDialog.tsx",
  "ui/src/autosave/AutosaveRetryBanner.tsx",
  "ui/src/autosave/AutosaveStatusIndicator.tsx",
  "ui/src/autosave/CedrosAutosaveProvider.tsx",
  "ui/src/autosave/autosaveInternals.ts",
  "ui/src/autosave/index.ts",
  "ui/src/autosave/persistence.ts",
  "ui/src/autosave/testUtils.ts",
  "ui/src/autosave/types.ts",
  "ui/src/autosave/useCedrosAutosave.test.tsx",
  "ui/src/autosave/useCedrosAutosave.ts",
  "ui/src/components/admin/settings/AutosaveStatus.tsx",
  "ui/src/hooks/useSettingsAutosave.ts",
]);

const migrationAllowlist = new Map([]);

const manualSaveAllowlist = new Map([]);

const suspiciousPatterns = [
  /\bautosave\b/i,
  /\bauto-save\b/i,
  /\bauto save\b/i,
  /\bdebouncedSave\b/,
  /\bpending[A-Za-z]*Save\b/,
  /\bsetTimeout\s*\([^)]*\bsave/i,
];

const files = sourceRoots
  .flatMap((sourceRoot) => collectFiles(sourceRoot))
  .filter((file) => /\.(ts|tsx)$/.test(file));
const violations = [];

for (const file of files) {
  const relativePath = relative(repoRoot, file);
  if (allowedPaths.has(relativePath)) continue;
  if (manualSaveAllowlist.has(relativePath)) continue;

  const text = readFileSync(file, "utf8");
  const looksAutosaveRelated = suspiciousPatterns.some((pattern) =>
    pattern.test(text),
  );
  const hasRawTimerOrSaveLoop =
    /\bsetTimeout\b/.test(text) ||
    /\bdebouncedSave\b/.test(text) ||
    /\bpending[A-Za-z]*Save\b/.test(text);

  if (!looksAutosaveRelated || !hasRawTimerOrSaveLoop) continue;
  if (migrationAllowlist.has(relativePath)) continue;

  violations.push(relativePath);
}

if (violations.length > 0) {
  console.error("Ad-hoc autosave implementation detected.");
  console.error(
    "Use ui/src/autosave/useCedrosAutosave.ts and shared status UI instead.",
  );
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

for (const [path, reason] of migrationAllowlist) {
  if (files.some((file) => relative(repoRoot, file) === path)) {
    console.warn(`Autosave migration allowlist: ${path} - ${reason}`);
  }
}

function collectFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function safeStat(path) {
  try {
    return statSync(path);
  } catch {
    return null;
  }
}
