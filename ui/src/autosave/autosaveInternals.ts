import {
  CEDROS_AUTOSAVE_DEBOUNCE_PROFILES,
  type CedrosAutosaveConflict,
  type CedrosAutosaveDebounceProfile,
  type CedrosAutosaveTelemetryEvent,
  type UseCedrosAutosaveOptions,
} from './types';

const DEFAULT_PROFILE = CEDROS_AUTOSAVE_DEBOUNCE_PROFILES.text;

export function resolveDebounceProfile(
  profile?: UseCedrosAutosaveOptions<unknown, unknown>['debounceProfile']
): CedrosAutosaveDebounceProfile {
  if (!profile) return DEFAULT_PROFILE;
  if (typeof profile === 'string') return CEDROS_AUTOSAVE_DEBOUNCE_PROFILES[profile];
  return profile;
}

export function validatePatch<TPatch, TResource>(
  patch: TPatch,
  options: UseCedrosAutosaveOptions<TPatch, TResource>
): string | null {
  const blocked = options.blockedFields ?? [];
  if (blocked.length > 0 && patch && typeof patch === 'object' && !Array.isArray(patch)) {
    const keys = new Set(Object.keys(patch as Record<string, unknown>));
    const blockedKey = blocked.find((key) => keys.has(key));
    if (blockedKey) return `Autosave is blocked for field "${blockedKey}"`;
  }
  const result = options.validatePatch?.(patch);
  if (!result) return null;
  if (typeof result === 'string') return result;
  return result.ok ? null : result.message;
}

export function emitTelemetryEvent<TPatch, TResource>(
  emitTelemetry: ((event: CedrosAutosaveTelemetryEvent) => void) | undefined,
  options: UseCedrosAutosaveOptions<TPatch, TResource>,
  event: Partial<CedrosAutosaveTelemetryEvent>
): void {
  emitTelemetry?.({
    event: event.event ?? 'autosave_dirty',
    resourceType: options.resourceType,
    resourceId: options.resourceId,
    extensionId: options.extensionId,
    status: event.status ?? 'dirty',
    networkState: event.networkState ?? (isOnline() ? 'online' : 'offline'),
    ...event,
  });
}

export function stableStringify(value: unknown): string {
  if (value === undefined) return 'undefined';
  return JSON.stringify(value);
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `autosave-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableError(cause: unknown): boolean {
  const status = statusFromError(cause);
  if (status === 429) return true;
  if (status && status >= 500) return true;
  return cause instanceof TypeError;
}

export function isConflictError(cause: unknown): boolean {
  const status = statusFromError(cause);
  return status === 409 || status === 412;
}

export function conflictFromError(cause: unknown): CedrosAutosaveConflict {
  const data =
    typeof cause === 'object' && cause !== null && 'data' in cause
      ? (cause as { data?: Record<string, unknown> }).data
      : undefined;
  const message =
    typeof data?.message === 'string'
      ? data.message
      : typeof data?.detail === 'string'
        ? data.detail
        : statusFromError(cause) === 412
          ? 'Conflict - review changes'
          : 'Autosave conflict';
  return {
    status: statusFromError(cause),
    message,
    serverResource: data?.serverResource ?? data?.conflict,
    clientPatch: data?.clientPatch,
    traceId: typeof data?.traceId === 'string' ? data.traceId : undefined,
  };
}

export function toError(cause: unknown, fallback: string): Error {
  if (cause instanceof Error) return cause;
  if (
    typeof cause === 'object' &&
    cause !== null &&
    'data' in cause &&
    typeof (cause as { data?: { message?: unknown } }).data?.message === 'string'
  ) {
    return new Error((cause as { data: { message: string } }).data.message);
  }
  return new Error(fallback);
}

export function payloadSizeBucket(value: unknown): string {
  const bytes = stableStringify(value).length;
  if (bytes <= 1024) return '0-1kb';
  if (bytes <= 10 * 1024) return '1-10kb';
  if (bytes <= 100 * 1024) return '10-100kb';
  return '100kb+';
}

export function inferUpdateMask(value: unknown): string[] | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return Object.keys(value as Record<string, unknown>);
}

const resourceLocks = new Map<string, Promise<void>>();

export function resourceMutationKey(resourceType: string, resourceId: string): string {
  return `${resourceType}:${resourceId}`;
}

export async function runExclusiveAutosaveMutation<T>(
  key: string,
  mutation: () => Promise<T>
): Promise<T> {
  const previous = resourceLocks.get(key) ?? Promise.resolve();
  let release!: () => void;
  const current = previous.then(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      })
  );
  resourceLocks.set(key, current);
  await previous;
  try {
    return await mutation();
  } finally {
    release();
    if (resourceLocks.get(key) === current) resourceLocks.delete(key);
  }
}

export function warnPersistenceFailure(
  operation: string,
  resourceType: string,
  resourceId: string
): void {
  console.warn('[Cedros Autosave] Persistence operation failed', {
    operation,
    resourceType,
    resourceId,
  });
}

function statusFromError(cause: unknown): number | undefined {
  if (typeof cause === 'object' && cause !== null && 'status' in cause) {
    const status = (cause as { status?: unknown }).status;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
}
