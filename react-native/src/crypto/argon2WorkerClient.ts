import { argon2Derive } from './argon2';
import type { Argon2Salt, EncryptionKey, KdfParams } from './types';
import { DEFAULT_KDF_PARAMS } from './types';

type PendingRequest = {
  resolve: (key: EncryptionKey) => void;
  reject: (error: Error) => void;
};

type WorkerRequest = {
  id: number;
  password: string;
  salt: Uint8Array;
  params: KdfParams;
};

type WorkerResponse = {
  id: number;
  key?: Uint8Array;
  error?: string;
};

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, PendingRequest>();

function getWorker(): Worker | null {
  if (typeof Worker === 'undefined') {
    return null;
  }

  if (!worker) {
    worker = new Worker(new URL('./argon2Worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, key, error } = event.data;
      const handlers = pending.get(id);
      if (!handlers) return;
      pending.delete(id);

      if (error) {
        handlers.reject(new Error(error));
        return;
      }

      if (!key) {
        handlers.reject(new Error('Argon2 worker returned no key'));
        return;
      }

      handlers.resolve(key as EncryptionKey);
    };

    worker.onerror = (event) => {
      const error = event instanceof ErrorEvent ? event.error : new Error('Argon2 worker error');
      for (const handlers of pending.values()) {
        handlers.reject(error instanceof Error ? error : new Error(String(error)));
      }
      pending.clear();
      worker?.terminate();
      worker = null;
    };
  }

  return worker;
}

/**
 * Derive an encryption key from password using Argon2id in a Web Worker.
 *
 * Offloads CPU-intensive Argon2id KDF to a background thread to avoid
 * blocking the main thread. Falls back to synchronous derivation if
 * Web Workers are not available.
 *
 * @param password - User's password
 * @param salt - 16-byte random salt
 * @param params - KDF parameters (memory, iterations, parallelism)
 * @returns 32-byte encryption key
 *
 * @security **CALLER MUST WIPE RETURNED KEY AFTER USE**
 * The returned key contains sensitive cryptographic material.
 * Callers are responsible for wiping it when no longer needed:
 * ```ts
 * const key = await argon2DeriveInWorker(password, salt);
 * try {
 *   // use key for encryption/decryption
 * } finally {
 *   wipeBytes(key);
 * }
 * ```
 * Failure to wipe may leave key material in memory, vulnerable to memory
 * dump attacks.
 */
export async function argon2DeriveInWorker(
  password: string,
  salt: Argon2Salt,
  params: KdfParams = DEFAULT_KDF_PARAMS
): Promise<EncryptionKey> {
  const argonWorker = getWorker();
  if (!argonWorker) {
    return argon2Derive(password, salt, params);
  }

  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });

    const payload: WorkerRequest = {
      id,
      password,
      salt,
      params,
    };

    argonWorker.postMessage(payload);
  });
}
