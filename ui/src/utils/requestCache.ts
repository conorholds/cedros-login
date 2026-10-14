interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// A count budget, not a byte budget: at 4 KiB/response this retains ~1 MiB.
// Pending reads are separate so eviction never breaks request coalescing.
export const MAX_SETTLED_READS = 256;
const entries = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();
let expiryTimer: ReturnType<typeof setTimeout> | undefined;

function maintainCache(): void {
  clearTimeout(expiryTimer);
  expiryTimer = undefined;
  const now = Date.now();
  let nextExpiry = Infinity;
  for (const [key, entry] of entries) {
    if (entry.expiresAt <= now) entries.delete(key);
    else nextExpiry = Math.min(nextExpiry, entry.expiresAt);
  }
  while (entries.size > MAX_SETTLED_READS) {
    const oldest = entries.keys().next();
    if (!oldest.done) entries.delete(oldest.value);
  }
  if (entries.size) {
    expiryTimer = setTimeout(maintainCache, Math.min(2_147_483_647, Math.max(1, nextExpiry - now)));
  }
}

export interface SharedReadOptions {
  /** Reuse a successful response for this long. Zero keeps only in-flight deduplication. */
  cacheTtlMs?: number;
  /** Ignore a reusable value while still joining an identical in-flight request. */
  forceRefresh?: boolean;
}

export function sharedRead<T>(
  _baseKey: string,
  key: string,
  load: () => Promise<T>,
  options: SharedReadOptions = {}
): Promise<T> {
  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) return pending;
  const current = entries.get(key) as CacheEntry<T> | undefined;
  if (!options.forceRefresh && current?.value !== undefined && current.expiresAt > Date.now()) {
    return Promise.resolve(current.value);
  }
  entries.delete(key);
  // Schedule load after ownership is installed, including synchronous throws.
  const promise = Promise.resolve()
    .then(load)
    .then(
      (value) => {
        if (inFlight.get(key) === promise) {
          inFlight.delete(key);
          const ttl = options.cacheTtlMs ?? 0;
          if (ttl > 0 && Number.isFinite(ttl)) {
            entries.set(key, { value, expiresAt: Date.now() + ttl });
          }
          maintainCache();
        }
        return value;
      },
      (error: unknown) => {
        if (inFlight.get(key) === promise) inFlight.delete(key);
        throw error;
      }
    );
  inFlight.set(key, promise);
  return promise;
}

/** Invalidate every identity-scoped read for one server after a mutation. */
export function invalidateSharedReads(baseKey: string): void {
  for (const map of [entries, inFlight]) {
    for (const key of map.keys()) {
      if (key.startsWith(`${baseKey}\0`)) map.delete(key);
    }
  }
  maintainCache();
}

export function normalizedHeaders(headers: Record<string, string> | undefined): string {
  return Object.entries(headers ?? {})
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key.toLowerCase()}:${value}`)
    .join('\n');
}

/** Test/lifecycle helper. Normal application code invalidates per server. */
export function clearSharedReads(): void {
  entries.clear();
  inFlight.clear();
  clearTimeout(expiryTimer);
  expiryTimer = undefined;
}
