import type { TokenPair, TokenStorageAdapter } from "../types";
import { enqueueTokenMutation } from "./tokenMutationQueue";
import { LEGACY_TOKEN_CLAIM_KEY, LEGACY_TOKEN_STORAGE_KEY } from "./tokenScope";

export const TOKEN_STORAGE_KEY = LEGACY_TOKEN_STORAGE_KEY;

export interface StoredTokenData {
  tokens: TokenPair;
  expiresAt: number;
}

export function serializeStoredTokens(
  tokens: TokenPair,
  expiresAt: number,
): string {
  return JSON.stringify({ tokens, expiresAt } satisfies StoredTokenData);
}

function parseStoredTokens(data: string): StoredTokenData {
  const parsed = JSON.parse(data) as Partial<StoredTokenData>;
  const tokens = parsed.tokens;
  if (
    !tokens ||
    typeof tokens.accessToken !== "string" ||
    typeof tokens.refreshToken !== "string" ||
    typeof tokens.expiresIn !== "number" ||
    typeof parsed.expiresAt !== "number" ||
    !Number.isFinite(parsed.expiresAt)
  ) {
    throw new Error("Stored token data has an invalid shape");
  }
  return { tokens, expiresAt: parsed.expiresAt };
}

function parseLegacyClaim(raw: string): string | null {
  try {
    const claim = JSON.parse(raw) as { version?: unknown; scope?: unknown };
    return claim.version === 1 && typeof claim.scope === "string"
      ? claim.scope
      : null;
  } catch {
    return null;
  }
}

async function migrationStage<T>(
  stage: "claim read" | "claim write" | "scoped copy" | "legacy cleanup",
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (cause) {
    const error = new Error(
      `Legacy token import failed during ${stage}.`,
    ) as Error & {
      cause?: unknown;
    };
    error.cause = cause;
    throw error;
  }
}

function requireMatchingClaim(raw: string, storageKey: string): void {
  const claimedScope = parseLegacyClaim(raw);
  if (claimedScope === storageKey) return;
  throw new Error(
    claimedScope
      ? "Legacy token import is already claimed by another provider scope."
      : "Legacy token import claim is invalid; import denied.",
  );
}

async function cleanupCopiedLegacy(
  storage: TokenStorageAdapter,
  storageKey: string,
): Promise<void> {
  const claim = await migrationStage("claim read", () =>
    storage.getItem(LEGACY_TOKEN_CLAIM_KEY),
  );
  if (!claim) return;
  requireMatchingClaim(claim, storageKey);
  const legacy = await migrationStage("claim read", () =>
    storage.getItem(LEGACY_TOKEN_STORAGE_KEY),
  );
  if (legacy) {
    await migrationStage("legacy cleanup", () =>
      storage.removeItem(LEGACY_TOKEN_STORAGE_KEY),
    );
  }
}

async function migrateLegacyTokens(
  storage: TokenStorageAdapter,
  storageKey: string,
  isCurrent: () => boolean,
): Promise<StoredTokenData | null> {
  const legacy = await migrationStage("claim read", () =>
    storage.getItem(LEGACY_TOKEN_STORAGE_KEY),
  );
  if (!legacy || !isCurrent()) return null;
  let parsed: StoredTokenData;
  try {
    parsed = parseStoredTokens(legacy);
  } catch {
    if (isCurrent()) {
      await migrationStage("legacy cleanup", () =>
        storage.removeItem(LEGACY_TOKEN_STORAGE_KEY),
      );
    }
    return null;
  }
  const rawClaim = await migrationStage("claim read", () =>
    storage.getItem(LEGACY_TOKEN_CLAIM_KEY),
  );
  if (rawClaim) requireMatchingClaim(rawClaim, storageKey);
  if (!isCurrent()) return null;
  if (!rawClaim) {
    await migrationStage("claim write", () =>
      storage.setItem(
        LEGACY_TOKEN_CLAIM_KEY,
        JSON.stringify({ version: 1, scope: storageKey }),
      ),
    );
  }
  if (!isCurrent()) return null;
  await migrationStage("scoped copy", () =>
    storage.setItem(storageKey, legacy),
  );
  await migrationStage("legacy cleanup", () =>
    storage.removeItem(LEGACY_TOKEN_STORAGE_KEY),
  );
  return isCurrent() ? parsed : null;
}

/** Read one immutable token scope, optionally claiming the legacy key once. */
export function readStoredTokens(
  storage: TokenStorageAdapter,
  storageKey: string,
  isCurrent: () => boolean,
  migrateLegacy: boolean,
): Promise<StoredTokenData | null> {
  return enqueueTokenMutation(async () => {
    if (!isCurrent()) return null;
    let data: string | null;
    try {
      data = await storage.getItem(storageKey);
    } catch (error) {
      console.warn(
        "[TokenManager] Failed to read stored tokens.",
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
    if (data && isCurrent()) {
      let parsed: StoredTokenData;
      try {
        parsed = parseStoredTokens(data);
      } catch {
        await storage.removeItem(storageKey);
        return null;
      }
      if (migrateLegacy) await cleanupCopiedLegacy(storage, storageKey);
      return parsed;
    }
    if (!migrateLegacy || !isCurrent()) return null;
    return migrateLegacyTokens(storage, storageKey, isCurrent);
  });
}
