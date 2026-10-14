import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CedrosAutosaveProvider } from './CedrosAutosaveProvider';
import { AutosaveStatusIndicator } from './AutosaveStatusIndicator';
import { useCedrosAutosave } from './useCedrosAutosave';
import { createAutosaveProblem } from './testUtils';
import type {
  CedrosAutosaveConflict,
  CedrosAutosaveMetadata,
  CedrosAutosavePersistence,
  CedrosAutosavePersistenceSnapshot,
} from './types';

interface Draft {
  value: string;
}

interface Patch {
  value: string;
}

type SaveFn = (patch: Patch, metadata: CedrosAutosaveMetadata) => Promise<void>;

describe('useCedrosAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces a dirty draft and saves the minimal patch', async () => {
    const save = vi.fn<SaveFn>(async () => undefined);

    render(
      <AutosaveHarness confirmed={{ value: 'saved' }} draft={{ value: 'changed' }} save={save} />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Unsaved changes');
    await act(async () => {
      vi.advanceTimersByTime(799);
      await Promise.resolve();
    });
    expect(save).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0]).toEqual({ value: 'changed' });
    expect(save.mock.calls[0][1].idempotencyKey).toBeTruthy();
  });

  it('keeps one in-flight write and supersedes older unsent drafts', async () => {
    const firstSave = deferred<void>();
    let saveCallCount = 0;
    const save = vi.fn<SaveFn>(() => {
      saveCallCount += 1;
      return saveCallCount === 1 ? firstSave.promise : Promise.resolve();
    });

    const { rerender } = render(
      <AutosaveHarness confirmed={{ value: 'saved' }} draft={{ value: 'one' }} save={save} />
    );

    await act(async () => {
      vi.advanceTimersByTime(800);
      await Promise.resolve();
    });
    expect(save).toHaveBeenCalledTimes(1);

    rerender(
      <AutosaveHarness confirmed={{ value: 'saved' }} draft={{ value: 'two' }} save={save} />
    );
    rerender(
      <AutosaveHarness confirmed={{ value: 'saved' }} draft={{ value: 'three' }} save={save} />
    );
    await act(async () => {
      vi.advanceTimersByTime(800);
      await Promise.resolve();
    });
    expect(save).toHaveBeenCalledTimes(1);

    await act(async () => {
      firstSave.resolve();
      await firstSave.promise;
      await Promise.resolve();
    });

    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1][0]).toEqual({ value: 'three' });
  });

  it('moves stale writes into conflict state without dropping the draft', async () => {
    const onConflict = vi.fn();
    const save = vi.fn<SaveFn>(async () => {
      throw createAutosaveProblem(412, 'Review server changes');
    });

    render(
      <AutosaveHarness
        confirmed={{ value: 'saved' }}
        draft={{ value: 'changed' }}
        save={save}
        onConflict={onConflict}
      />
    );

    await act(async () => {
      vi.advanceTimersByTime(800);
      await Promise.resolve();
    });

    expect(screen.getByRole('status')).toHaveTextContent('Conflict - review changes');
    expect(onConflict).toHaveBeenCalledWith(
      expect.objectContaining({ status: 412, message: 'Review server changes' })
    );
  });

  it('flushes a dirty draft on blur before the debounce delay finishes', async () => {
    const save = vi.fn<SaveFn>(async () => undefined);

    render(
      <AutosaveHarness confirmed={{ value: 'saved' }} draft={{ value: 'changed' }} save={save} />
    );

    await act(async () => {
      window.dispatchEvent(new FocusEvent('focusout'));
      await Promise.resolve();
    });

    expect(save).toHaveBeenCalledTimes(1);
  });

  it('restores a persisted pending draft from provider storage', async () => {
    const snapshot = {
      resourceType: 'test.resource',
      resourceId: 'resource-1',
      savedAt: '2026-07-01T00:00:00.000Z',
      draft: { value: 'pending from disk' },
    };
    const storage: CedrosAutosavePersistence = {
      load: async <TResource,>() =>
        snapshot as unknown as CedrosAutosavePersistenceSnapshot<TResource>,
      save: vi.fn(),
      clear: vi.fn(),
    };

    render(
      <AutosaveHarness
        confirmed={{ value: 'saved' }}
        draft={{ value: 'saved' }}
        save={vi.fn<SaveFn>(async () => undefined)}
        storage={storage}
      />
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByTestId('restored-draft')).toHaveTextContent('pending from disk');
  });

  it('serializes writes for the same resource across hook instances', async () => {
    const firstSave = deferred<void>();
    let saveCallCount = 0;
    const save = vi.fn<SaveFn>(() => {
      saveCallCount += 1;
      return saveCallCount === 1 ? firstSave.promise : Promise.resolve();
    });

    render(
      <CedrosAutosaveProvider>
        <AutosaveProbe confirmed={{ value: 'saved' }} draft={{ value: 'one' }} save={save} />
        <AutosaveProbe confirmed={{ value: 'saved' }} draft={{ value: 'two' }} save={save} />
      </CedrosAutosaveProvider>
    );

    await act(async () => {
      vi.advanceTimersByTime(800);
      await Promise.resolve();
    });
    expect(save).toHaveBeenCalledTimes(1);

    await act(async () => {
      firstSave.resolve();
      await firstSave.promise;
      await Promise.resolve();
    });

    expect(save).toHaveBeenCalledTimes(2);
  });
});

function AutosaveHarness({
  confirmed,
  draft,
  save,
  onConflict,
  storage,
}: {
  confirmed: Draft;
  draft: Draft;
  save: (patch: Patch, metadata: CedrosAutosaveMetadata) => Promise<void>;
  onConflict?: (conflict: CedrosAutosaveConflict) => void;
  storage?: CedrosAutosavePersistence;
}) {
  return (
    <CedrosAutosaveProvider storage={storage}>
      <AutosaveProbe confirmed={confirmed} draft={draft} save={save} onConflict={onConflict} />
    </CedrosAutosaveProvider>
  );
}

function AutosaveProbe({
  confirmed,
  draft,
  save,
  onConflict,
}: {
  confirmed: Draft;
  draft: Draft;
  save: (patch: Patch, metadata: CedrosAutosaveMetadata) => Promise<void>;
  onConflict?: (conflict: CedrosAutosaveConflict) => void;
}) {
  const autosave = useCedrosAutosave<Patch, Draft>({
    resourceType: 'test.resource',
    resourceId: 'resource-1',
    confirmedDraft: confirmed,
    draft,
    makePatch: (previous, current) =>
      previous.value === current.value ? null : { value: current.value },
    save,
    onConflict,
    persistenceKey: 'test.resource:resource-1',
  });

  return (
    <>
      <AutosaveStatusIndicator status={autosave.status} error={autosave.error} />
      <span data-testid="restored-draft">{autosave.restoredDraft?.value ?? ''}</span>
    </>
  );
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
}
