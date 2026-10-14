import type { CedrosAutosavePersistence, CedrosAutosavePersistenceSnapshot } from './types';

const DATABASE_NAME = 'cedros-autosave';
const DATABASE_VERSION = 1;
const STORE_NAME = 'snapshots';

interface StoredAutosaveSnapshot<TResource> extends CedrosAutosavePersistenceSnapshot<TResource> {
  key: string;
}

export function createMemoryAutosavePersistence(): CedrosAutosavePersistence {
  const snapshots = new Map<string, CedrosAutosavePersistenceSnapshot<unknown>>();
  return {
    load<TResource>(key: string): CedrosAutosavePersistenceSnapshot<TResource> | null {
      return (snapshots.get(key) as CedrosAutosavePersistenceSnapshot<TResource>) ?? null;
    },
    save<TResource>(key: string, snapshot: CedrosAutosavePersistenceSnapshot<TResource>): void {
      snapshots.set(key, snapshot as CedrosAutosavePersistenceSnapshot<unknown>);
    },
    clear(key: string): void {
      snapshots.delete(key);
    },
  };
}

export function createIndexedDbAutosavePersistence(): CedrosAutosavePersistence {
  const fallback = createMemoryAutosavePersistence();
  return {
    async load<TResource>(
      key: string
    ): Promise<CedrosAutosavePersistenceSnapshot<TResource> | null> {
      if (!canUseIndexedDb()) return fallback.load<TResource>(key);
      try {
        const stored = await withStore('readonly', (store) => getSnapshot<TResource>(store, key));
        return stored ? stripKey(stored) : null;
      } catch {
        return fallback.load<TResource>(key);
      }
    },
    async save<TResource>(
      key: string,
      snapshot: CedrosAutosavePersistenceSnapshot<TResource>
    ): Promise<void> {
      if (!canUseIndexedDb()) return fallback.save(key, snapshot);
      try {
        await withStore('readwrite', (store) => putSnapshot(store, { ...snapshot, key }));
        await fallback.save(key, snapshot);
      } catch {
        await fallback.save(key, snapshot);
      }
    },
    async clear(key: string): Promise<void> {
      if (!canUseIndexedDb()) return fallback.clear(key);
      try {
        await withStore('readwrite', (store) => deleteSnapshot(store, key));
        await fallback.clear(key);
      } catch {
        await fallback.clear(key);
      }
    },
  };
}

function stripKey<TResource>(
  stored: StoredAutosaveSnapshot<TResource>
): CedrosAutosavePersistenceSnapshot<TResource> {
  return {
    resourceType: stored.resourceType,
    resourceId: stored.resourceId,
    savedAt: stored.savedAt,
    draft: stored.draft,
  };
}

function canUseIndexedDb(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error('Failed to open autosave IndexedDB'));
    };
    request.onblocked = () => {
      databasePromise = null;
      reject(new Error('Autosave IndexedDB open was blocked'));
    };
  });
  return databasePromise;
}

async function withStore<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));
    let result: T | undefined;
    request.onsuccess = () => {
      result = request.result;
    };
    transaction.oncomplete = () => resolve(result as T);
    request.onerror = () => reject(request.error ?? new Error('Autosave IndexedDB request failed'));
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('Autosave IndexedDB transaction failed'));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('Autosave IndexedDB transaction aborted'));
  });
}

function getSnapshot<TResource>(
  store: IDBObjectStore,
  key: string
): IDBRequest<StoredAutosaveSnapshot<TResource> | undefined> {
  return store.get(key) as IDBRequest<StoredAutosaveSnapshot<TResource> | undefined>;
}

function putSnapshot<TResource>(
  store: IDBObjectStore,
  snapshot: StoredAutosaveSnapshot<TResource>
): IDBRequest<IDBValidKey> {
  return store.put(snapshot);
}

function deleteSnapshot(store: IDBObjectStore, key: string): IDBRequest<undefined> {
  return store.delete(key) as IDBRequest<undefined>;
}
