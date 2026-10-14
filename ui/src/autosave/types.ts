import type { ReactNode } from 'react';

export type CedrosAutosaveStatus =
  | 'idle'
  | 'dirty'
  | 'debouncing'
  | 'queued'
  | 'saving'
  | 'saved'
  | 'retrying'
  | 'offline'
  | 'conflict'
  | 'failed';

export type CedrosAutosaveState = CedrosAutosaveStatus;

export type CedrosAutosaveConflictStrategy =
  | 'reject'
  | 'fieldMerge'
  | 'lastWriterWinsApproved'
  | 'customReview';

export type CedrosAutosaveValidationResult =
  | { ok: true }
  | { ok: false; message: string }
  | string
  | null
  | undefined;

export interface CedrosAutosaveDebounceProfile {
  /** Delay before queueing text-like draft changes. */
  delayMs: number;
  /** Whether blur/visibility/pagehide events should force a pending flush. */
  flushOnLifecycle?: boolean;
  /** How long the saved status remains visible before returning to idle. */
  savedVisibleMs: number;
  /** Retry delays for transient save failures. Empty means no automatic retry. */
  retryDelaysMs: number[];
}

export const CEDROS_AUTOSAVE_DEBOUNCE_PROFILES = {
  text: { delayMs: 800, flushOnLifecycle: true, savedVisibleMs: 2000, retryDelaysMs: [500, 1500] },
  longDraft: {
    delayMs: 1200,
    flushOnLifecycle: true,
    savedVisibleMs: 2500,
    retryDelaysMs: [750, 2000, 5000],
  },
  selectToggle: {
    delayMs: 150,
    flushOnLifecycle: true,
    savedVisibleMs: 2000,
    retryDelaysMs: [500, 1500],
  },
  background: {
    delayMs: 2000,
    flushOnLifecycle: false,
    savedVisibleMs: 1500,
    retryDelaysMs: [1000, 3000],
  },
} satisfies Record<string, CedrosAutosaveDebounceProfile>;

export type CedrosAutosaveDebounceProfileName = keyof typeof CEDROS_AUTOSAVE_DEBOUNCE_PROFILES;

export interface CedrosAutosaveMetadata {
  resourceType: string;
  resourceId: string;
  baseRevision?: number | string;
  etag?: string;
  clientMutationId: string;
  editingSessionId: string;
  clientSeq: number;
  idempotencyKey: string;
  retryCount: number;
  updateMask?: string[];
  signal: AbortSignal;
}

export interface CedrosAutosaveSaveResult<TResource> {
  resourceId?: string;
  revision?: number | string;
  etag?: string;
  savedAt?: string;
  canonicalPatchOrResource?: TResource;
  warnings?: string[];
  traceId?: string;
}

export type CedrosAutosaveResult<TResource> = CedrosAutosaveSaveResult<TResource>;

export interface CedrosAutosaveConflict {
  status?: number;
  message: string;
  serverResource?: unknown;
  clientPatch?: unknown;
  traceId?: string;
}

export interface CedrosAutosaveFailure {
  error: Error;
  retryable: boolean;
  status?: number;
  traceId?: string;
}

export interface CedrosAutosaveTelemetryEvent {
  event:
    | 'autosave_dirty'
    | 'autosave_queued'
    | 'autosave_started'
    | 'autosave_succeeded'
    | 'autosave_failed'
    | 'autosave_retrying'
    | 'autosave_conflict'
    | 'autosave_offline_paused'
    | 'autosave_resumed'
    | 'autosave_discarded'
    | 'autosave_local_restore'
    | 'autosave_manual_flush';
  resourceType: string;
  resourceId: string;
  extensionId?: string;
  status: CedrosAutosaveStatus;
  durationMs?: number;
  retryCount?: number;
  conflictType?: string;
  payloadSizeBucket?: string;
  queueDepth?: number;
  networkState?: 'online' | 'offline';
  traceId?: string;
}

export interface CedrosAutosavePersistenceSnapshot<TResource> {
  resourceType: string;
  resourceId: string;
  savedAt: string;
  draft: TResource;
}

export type CedrosAutosaveMaybePromise<T> = T | Promise<T>;

export interface CedrosAutosavePersistence {
  load<TResource>(
    key: string
  ): CedrosAutosaveMaybePromise<CedrosAutosavePersistenceSnapshot<TResource> | null>;
  save<TResource>(
    key: string,
    snapshot: CedrosAutosavePersistenceSnapshot<TResource>
  ): CedrosAutosaveMaybePromise<void>;
  clear(key: string): CedrosAutosaveMaybePromise<void>;
}

/** @deprecated Use CedrosAutosavePersistence. */
export type CedrosAutosavePersistenceStorage = CedrosAutosavePersistence;

export interface AutosaveResourceDefinition<TPatch = unknown> {
  extensionId?: string;
  resourceType: string;
  deriveResourceId: (input: unknown) => string;
  patchSchemaVersion: string;
  allowedAutosaveFields: string[];
  blockedFields: string[];
  debounceProfile: CedrosAutosaveDebounceProfileName;
  optimisticUi: boolean;
  conflictStrategy: CedrosAutosaveConflictStrategy;
  dataSensitivity: 'public' | 'internal' | 'sensitive' | 'high-impact';
  maxPayloadBytes: number;
  telemetryLabels: Record<string, string>;
  validatePatch: (patch: TPatch) => CedrosAutosaveValidationResult;
}

export interface CedrosAutosaveProviderValue {
  emitTelemetry?: (event: CedrosAutosaveTelemetryEvent) => void;
  storage?: CedrosAutosavePersistence;
}

export interface CedrosAutosaveProviderProps extends CedrosAutosaveProviderValue {
  children: ReactNode;
}

export interface UseCedrosAutosaveOptions<TPatch, TResource> {
  resourceType: string;
  resourceId: string;
  extensionId?: string;
  baseRevision?: number | string;
  etag?: string;
  /** Last confirmed server state. Defaults to the initial draft. */
  confirmedDraft?: TResource;
  draft: TResource;
  makePatch: (previous: TResource, current: TResource) => TPatch | null;
  validatePatch?: (patch: TPatch) => CedrosAutosaveValidationResult;
  save: (
    patch: TPatch,
    metadata: CedrosAutosaveMetadata
  ) => Promise<CedrosAutosaveSaveResult<TResource> | void>;
  debounceProfile?: CedrosAutosaveDebounceProfileName | CedrosAutosaveDebounceProfile;
  conflictStrategy?: CedrosAutosaveConflictStrategy;
  persistenceKey?: string;
  enabled?: boolean;
  blockedFields?: string[];
  onSaved?: (result: CedrosAutosaveSaveResult<TResource> | void) => void;
  onConflict?: (conflict: CedrosAutosaveConflict) => void;
  onPermanentFailure?: (failure: CedrosAutosaveFailure | Error) => void;
}

export interface CedrosAutosaveController<TPatch, TResource> {
  /** Compile-time marker preserving the patch type in public controller aliases. */
  readonly patchType?: TPatch;
  status: CedrosAutosaveStatus;
  error: string | null;
  conflict: CedrosAutosaveConflict | null;
  hasUnsavedChanges: boolean;
  retryCount: number;
  queueDepth: number;
  restoredDraft: TResource | null;
  flush: () => Promise<void>;
  discard: () => void;
}

export type UseCedrosAutosaveReturn<TResource> = CedrosAutosaveController<unknown, TResource>;

export type CedrosAutosaveOptions<TPatch, TResource> = UseCedrosAutosaveOptions<TPatch, TResource>;

export type CedrosAutosaveSaveMetadata = CedrosAutosaveMetadata;
