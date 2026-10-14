import { useCallback, useMemo, useRef, useState } from 'react';
import { useExternalEffect } from '../hooks/effects';
import { useCedrosAutosaveContext } from './CedrosAutosaveProvider';
import {
  conflictFromError,
  createId,
  delay,
  emitTelemetryEvent,
  inferUpdateMask,
  isConflictError,
  isOnline,
  isRetryableError,
  now,
  payloadSizeBucket,
  resourceMutationKey,
  resolveDebounceProfile,
  runExclusiveAutosaveMutation,
  stableStringify,
  toError,
  validatePatch,
  warnPersistenceFailure,
} from './autosaveInternals';
import type {
  CedrosAutosaveConflict,
  CedrosAutosaveStatus,
  CedrosAutosaveTelemetryEvent,
  UseCedrosAutosaveOptions,
  UseCedrosAutosaveReturn,
} from './types';

/** Canonical Cedros autosave hook and state machine. */
export function useCedrosAutosave<TPatch, TResource>(
  options: UseCedrosAutosaveOptions<TPatch, TResource>
): UseCedrosAutosaveReturn<TResource> {
  const { emitTelemetry, storage } = useCedrosAutosaveContext();
  const profile = useMemo(
    () => resolveDebounceProfile(options.debounceProfile),
    [options.debounceProfile]
  );
  const optionsRef = useRef(options);
  const profileRef = useRef(profile);
  const telemetryRef = useRef(emitTelemetry);
  const storageRef = useRef(storage);
  optionsRef.current = options;
  profileRef.current = profile;
  telemetryRef.current = emitTelemetry;
  storageRef.current = storage;
  const sessionIdRef = useRef(createId());
  const clientSeqRef = useRef(0);
  const latestDraftRef = useRef(options.draft);
  const lastConfirmedRef = useRef(options.confirmedDraft ?? options.draft);
  const pendingDraftRef = useRef<TResource | null>(null);
  const inFlightRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const drainingRef = useRef<Promise<void> | null>(null);
  const saveDraftRef = useRef<(draft: TResource) => Promise<void>>(async () => undefined);
  const flushRef = useRef<() => Promise<void>>(async () => undefined);
  const [status, setStatus] = useState<CedrosAutosaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<CedrosAutosaveConflict | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [queueDepth, setQueueDepth] = useState(0);
  const [restoredDraft, setRestoredDraft] = useState<TResource | null>(null);
  const confirmedSignature = useMemo(
    () => stableStringify(options.confirmedDraft),
    [options.confirmedDraft]
  );
  const draftSignature = useMemo(() => stableStringify(options.draft), [options.draft]);
  useExternalEffect(() => {
    const current = optionsRef.current;
    const key = current.persistenceKey;
    if (!key || !storageRef.current) return;

    let canceled = false;
    Promise.resolve(storageRef.current.load<TResource>(key))
      .then((snapshot) => {
        if (canceled || !snapshot) return;
        if (
          snapshot.resourceType !== current.resourceType ||
          snapshot.resourceId !== current.resourceId
        ) {
          return;
        }
        setRestoredDraft(snapshot.draft);
        setHasUnsavedChanges(true);
        setQueueDepth(1);
        emitTelemetryEvent(telemetryRef.current, current, {
          event: 'autosave_local_restore',
          status: 'dirty',
          queueDepth: 1,
        });
      })
      .catch(() => {
        warnPersistenceFailure('load', current.resourceType, current.resourceId);
      });
    return () => {
      canceled = true;
    };
  }, [options.persistenceKey, options.resourceId, options.resourceType]);

  useExternalEffect(() => {
    const current = optionsRef.current;
    if (current.confirmedDraft === undefined || hasUnsavedChanges || inFlightRef.current) return;
    lastConfirmedRef.current = current.confirmedDraft;
  }, [confirmedSignature, hasUnsavedChanges]);

  const clearDebounce = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);
  const clearSavedTimer = useCallback(() => {
    if (savedTimerRef.current) {
      clearTimeout(savedTimerRef.current);
      savedTimerRef.current = null;
    }
  }, []);

  const emit = useCallback((event: Partial<CedrosAutosaveTelemetryEvent>) => {
    emitTelemetryEvent(telemetryRef.current, optionsRef.current, event);
  }, []);
  const persistDraft = useCallback((draft: TResource) => {
    const current = optionsRef.current;
    const key = current.persistenceKey;
    if (!key || !storageRef.current) return;
    const snapshot = {
      resourceType: current.resourceType,
      resourceId: current.resourceId,
      savedAt: new Date().toISOString(),
      draft,
    };
    void Promise.resolve(storageRef.current.save(key, snapshot)).catch(() => {
      warnPersistenceFailure('save', current.resourceType, current.resourceId);
    });
  }, []);
  const clearPersistedDraft = useCallback(() => {
    const key = optionsRef.current.persistenceKey;
    const current = optionsRef.current;
    if (!key || !storageRef.current) return;
    void Promise.resolve(storageRef.current.clear(key)).catch(() => {
      warnPersistenceFailure('clear', current.resourceType, current.resourceId);
    });
  }, []);
  const setQueuedDraft = useCallback(
    (draft: TResource) => {
      pendingDraftRef.current = draft;
      setQueueDepth(1);
      persistDraft(draft);
      emit({ event: 'autosave_queued', status: 'queued', queueDepth: 1 });
    },
    [emit, persistDraft]
  );
  const drainQueue = useCallback(async () => {
    if (drainingRef.current) return drainingRef.current;

    drainingRef.current = (async () => {
      try {
        while (pendingDraftRef.current) {
          if (!isOnline()) {
            setStatus('offline');
            setHasUnsavedChanges(true);
            emit({
              event: 'autosave_offline_paused',
              status: 'offline',
              queueDepth: 1,
              networkState: 'offline',
            });
            return;
          }
          const draftToSave = pendingDraftRef.current;
          pendingDraftRef.current = null;
          setQueueDepth(0);
          await saveDraftRef.current(draftToSave);
        }
      } finally {
        drainingRef.current = null;
      }
    })();
    return drainingRef.current;
  }, [emit]);
  const queueLatest = useCallback(async () => {
    clearDebounce();
    const current = optionsRef.current;
    if (current.enabled === false) return;
    if (!pendingDraftRef.current) {
      const patch = current.makePatch(lastConfirmedRef.current, latestDraftRef.current);
      if (!patch) {
        setQueueDepth(0);
        setHasUnsavedChanges(false);
        clearPersistedDraft();
        setStatus((currentStatus) => (currentStatus === 'saved' ? currentStatus : 'idle'));
        return;
      }
    }

    setQueuedDraft(latestDraftRef.current);
    setStatus(isOnline() ? 'queued' : 'offline');
    await drainQueue();
  }, [clearDebounce, clearPersistedDraft, drainQueue, setQueuedDraft]);
  const flush = useCallback(async () => {
    emit({ event: 'autosave_manual_flush', status, queueDepth });
    await queueLatest();
  }, [emit, queueDepth, queueLatest, status]);
  flushRef.current = flush;
  const discard = useCallback(() => {
    clearDebounce();
    clearSavedTimer();
    pendingDraftRef.current = null;
    abortRef.current?.abort();
    abortRef.current = null;
    setQueueDepth(0);
    setRetryCount(0);
    setError(null);
    setConflict(null);
    setHasUnsavedChanges(false);
    setStatus('idle');
    clearPersistedDraft();
    emit({ event: 'autosave_discarded', status: 'idle', queueDepth: 0 });
  }, [clearDebounce, clearPersistedDraft, clearSavedTimer, emit]);

  useExternalEffect(() => {
    const current = optionsRef.current;
    latestDraftRef.current = current.draft;
    if (current.enabled === false) return;

    const patch = current.makePatch(lastConfirmedRef.current, current.draft);
    if (!patch) {
      if (!pendingDraftRef.current && !inFlightRef.current) {
        setHasUnsavedChanges(false);
        setQueueDepth(0);
        clearPersistedDraft();
        setStatus((currentStatus) => (currentStatus === 'saved' ? currentStatus : 'idle'));
      }
      return;
    }

    const validationError = validatePatch(patch, current);
    if (validationError) {
      clearDebounce();
      setError(validationError);
      setHasUnsavedChanges(true);
      setStatus('failed');
      current.onPermanentFailure?.({
        error: new Error(validationError),
        retryable: false,
      });
      return;
    }
    clearSavedTimer();
    setError(null);
    setConflict(null);
    setHasUnsavedChanges(true);
    setStatus('debouncing');
    persistDraft(current.draft);
    emit({
      event: 'autosave_dirty',
      status: 'dirty',
      payloadSizeBucket: payloadSizeBucket(patch),
      queueDepth: pendingDraftRef.current ? 1 : 0,
    });

    clearDebounce();
    debounceTimerRef.current = setTimeout(() => {
      void queueLatest();
    }, profileRef.current.delayMs);
  }, [
    clearDebounce,
    clearPersistedDraft,
    clearSavedTimer,
    draftSignature,
    emit,
    persistDraft,
    queueLatest,
  ]);

  useExternalEffect(() => {
    const handleOnline = () => {
      if (!hasUnsavedChanges) return;
      emit({ event: 'autosave_resumed', status: 'queued', networkState: 'online', queueDepth });
      void queueLatest();
    };
    const handleOffline = () => {
      if (!hasUnsavedChanges) return;
      setStatus('offline');
      emit({
        event: 'autosave_offline_paused',
        status: 'offline',
        networkState: 'offline',
        queueDepth,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [emit, hasUnsavedChanges, queueDepth, queueLatest]);

  useExternalEffect(() => {
    if (!profileRef.current.flushOnLifecycle) return;

    const flushIfNeeded = () => {
      if (!hasUnsavedChanges && !pendingDraftRef.current && !inFlightRef.current) return;
      void flushRef.current();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flushIfNeeded();
    };

    window.addEventListener('focusout', flushIfNeeded, true);
    window.addEventListener('pagehide', flushIfNeeded);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focusout', flushIfNeeded, true);
      window.removeEventListener('pagehide', flushIfNeeded);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasUnsavedChanges, profile.flushOnLifecycle]);

  useExternalEffect(() => {
    const warnBeforeExit = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges && !inFlightRef.current && !pendingDraftRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeExit);
    return () => window.removeEventListener('beforeunload', warnBeforeExit);
  }, [hasUnsavedChanges]);

  useExternalEffect(() => {
    return () => {
      clearDebounce();
      clearSavedTimer();
      abortRef.current?.abort();
    };
  }, [clearDebounce, clearSavedTimer]);
  saveDraftRef.current = async function saveDraft(draftToSave: TResource): Promise<void> {
    if (inFlightRef.current) {
      setQueuedDraft(draftToSave);
      return;
    }

    const current = optionsRef.current;
    const patch = current.makePatch(lastConfirmedRef.current, draftToSave);
    if (!patch) return;

    const validationError = validatePatch(patch, current);
    if (validationError) {
      setError(validationError);
      setStatus('failed');
      setHasUnsavedChanges(true);
      current.onPermanentFailure?.({
        error: new Error(validationError),
        retryable: false,
      });
      return;
    }

    inFlightRef.current = true;
    const mutationId = createId();
    const idempotencyKey = createId();
    const clientSeq = ++clientSeqRef.current;
    const updateMask = inferUpdateMask(patch);
    const retryDelays = profileRef.current.retryDelaysMs;
    const startedAt = now();

    for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
      const controller = new AbortController();
      abortRef.current = controller;
      setRetryCount(attempt);
      setStatus(attempt === 0 ? 'saving' : 'retrying');
      emit({
        event: attempt === 0 ? 'autosave_started' : 'autosave_retrying',
        status: attempt === 0 ? 'saving' : 'retrying',
        retryCount: attempt,
        payloadSizeBucket: payloadSizeBucket(patch),
        queueDepth: pendingDraftRef.current ? 1 : 0,
      });

      try {
        const result = await runExclusiveAutosaveMutation(
          resourceMutationKey(current.resourceType, current.resourceId),
          () =>
            current.save(patch, {
              resourceType: current.resourceType,
              resourceId: current.resourceId,
              baseRevision: current.baseRevision,
              etag: current.etag,
              clientMutationId: mutationId,
              editingSessionId: sessionIdRef.current,
              clientSeq,
              idempotencyKey,
              retryCount: attempt,
              updateMask,
              signal: controller.signal,
            })
        );

        lastConfirmedRef.current = draftToSave;
        current.onSaved?.(result);
        emit({
          event: 'autosave_succeeded',
          status: 'saved',
          durationMs: now() - startedAt,
          retryCount: attempt,
          queueDepth: pendingDraftRef.current ? 1 : 0,
          traceId: result?.traceId,
        });

        inFlightRef.current = false;
        abortRef.current = null;
        setError(null);
        setConflict(null);

        const latestPatch = current.makePatch(lastConfirmedRef.current, latestDraftRef.current);
        if (pendingDraftRef.current || latestPatch) {
          if (!pendingDraftRef.current && latestPatch) setQueuedDraft(latestDraftRef.current);
          return;
        }

        setHasUnsavedChanges(false);
        clearPersistedDraft();
        setStatus('saved');
        clearSavedTimer();
        savedTimerRef.current = setTimeout(() => {
          setStatus('idle');
        }, profileRef.current.savedVisibleMs);
        return;
      } catch (cause) {
        if (isConflictError(cause)) {
          const nextConflict = conflictFromError(cause);
          setConflict(nextConflict);
          setError(nextConflict.message);
          setStatus('conflict');
          setHasUnsavedChanges(true);
          persistDraft(latestDraftRef.current);
          setQueueDepth(1);
          current.onConflict?.(nextConflict);
          emit({
            event: 'autosave_conflict',
            status: 'conflict',
            durationMs: now() - startedAt,
            retryCount: attempt,
            conflictType: String(nextConflict.status ?? 'unknown'),
            queueDepth: 1,
            traceId: nextConflict.traceId,
          });
          break;
        }

        if (attempt < retryDelays.length && isRetryableError(cause)) {
          await delay(retryDelays[attempt]);
          continue;
        }

        const nextError = toError(cause, 'Autosave failed');
        setError(nextError.message);
        setStatus('failed');
        setHasUnsavedChanges(true);
        persistDraft(latestDraftRef.current);
        setQueueDepth(1);
        current.onPermanentFailure?.({
          error: nextError,
          retryable: false,
        });
        emit({
          event: 'autosave_failed',
          status: 'failed',
          durationMs: now() - startedAt,
          retryCount: attempt,
          queueDepth: 1,
        });
        break;
      }
    }

    inFlightRef.current = false;
    abortRef.current = null;
  };

  return {
    status,
    error,
    conflict,
    hasUnsavedChanges,
    retryCount,
    queueDepth,
    restoredDraft,
    flush,
    discard,
  };
}
