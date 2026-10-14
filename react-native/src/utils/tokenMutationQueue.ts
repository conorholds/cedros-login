import type { TokenStorageAdapter } from "../types";

export type TokenStorageOwner = symbol;

interface ScopeOwnership {
  owner: TokenStorageOwner | null;
  pending: Map<TokenStorageOwner, number>;
}

let mutationQueue: Promise<void> = Promise.resolve();
const scopeOwnership = new Map<string, ScopeOwnership>();
const legacyImporterCounts = new Map<string, number>();

function ownership(storageKey: string): ScopeOwnership {
  let state = scopeOwnership.get(storageKey);
  if (!state) {
    state = { owner: null, pending: new Map() };
    scopeOwnership.set(storageKey, state);
  }
  return state;
}

export function enqueueTokenMutation<T>(
  operation: () => Promise<T>,
): Promise<T> {
  const result = mutationQueue.then(operation);
  mutationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export function createTokenStorageOwner(): TokenStorageOwner {
  return Symbol("cedros-token-storage-owner");
}

function registerLegacyTokenImporter(storageKey: string): void {
  legacyImporterCounts.set(
    storageKey,
    (legacyImporterCounts.get(storageKey) ?? 0) + 1,
  );
}

function unregisterLegacyTokenImporter(storageKey: string): void {
  const next = (legacyImporterCounts.get(storageKey) ?? 1) - 1;
  if (next > 0) legacyImporterCounts.set(storageKey, next);
  else legacyImporterCounts.delete(storageKey);
}

function assertSoleLegacyTokenImporter(storageKey: string): void {
  const scopes = [...legacyImporterCounts.keys()];
  if (scopes.length === 1 && scopes[0] === storageKey) return;
  throw new Error(
    "Legacy token import is enabled for multiple provider scopes; import denied.",
  );
}

/** Process-local lease that rejects concurrent legacy import scopes. */
export class LegacyTokenImporterLease {
  private registered = false;

  constructor(
    private readonly storageKey: string,
    readonly enabled: boolean,
  ) {}

  async activate(storageActivation: () => Promise<void>): Promise<void> {
    if (this.enabled && !this.registered) {
      registerLegacyTokenImporter(this.storageKey);
      this.registered = true;
    }
    await storageActivation();
    if (this.enabled) assertSoleLegacyTokenImporter(this.storageKey);
  }

  destroy(): void {
    if (!this.registered) return;
    unregisterLegacyTokenImporter(this.storageKey);
    this.registered = false;
  }
}

export function isTokenStorageOwner(
  storageKey: string,
  owner: TokenStorageOwner,
): boolean {
  return ownership(storageKey).owner === owner;
}

/** Claim a scope and fence any mutation already pending from its prior owner. */
export function activateTokenStorageOwner(
  storage: TokenStorageAdapter,
  storageKey: string,
  owner: TokenStorageOwner,
  isCurrent: () => boolean,
): Promise<void> {
  const state = ownership(storageKey);
  const previous = state.owner;
  const needsFence =
    previous !== null &&
    previous !== owner &&
    (state.pending.get(previous) ?? 0) > 0;
  state.owner = owner;
  return enqueueTokenMutation(async () => {
    if (!needsFence || !isCurrent() || state.owner !== owner) return;
    await storage.removeItem(storageKey);
  });
}

export function enqueueOwnedTokenMutation(
  storageKey: string,
  owner: TokenStorageOwner | null,
  operation: () => Promise<void>,
): Promise<void> {
  if (!owner) return enqueueTokenMutation(operation);
  const state = ownership(storageKey);
  state.pending.set(owner, (state.pending.get(owner) ?? 0) + 1);
  const result = enqueueTokenMutation(async () => {
    if (state.owner === owner) await operation();
  });
  result.then(
    () => decrementPending(state, owner),
    () => decrementPending(state, owner),
  );
  return result;
}

function decrementPending(
  state: ScopeOwnership,
  owner: TokenStorageOwner,
): void {
  const next = (state.pending.get(owner) ?? 1) - 1;
  if (next > 0) state.pending.set(owner, next);
  else state.pending.delete(owner);
}
