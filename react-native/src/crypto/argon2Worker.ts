/// <reference lib="webworker" />
import { argon2Derive } from './argon2';
import { toArgon2Salt, type KdfParams } from './types';

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

const ctx = self as DedicatedWorkerGlobalScope;

ctx.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, password, salt, params } = event.data;

  try {
    const key = await argon2Derive(password, toArgon2Salt(salt), params);
    const response: WorkerResponse = { id, key };
    ctx.postMessage(response);
  } catch (err) {
    const response: WorkerResponse = {
      id,
      error: err instanceof Error ? err.message : 'Argon2 worker failed',
    };
    ctx.postMessage(response);
  }
};
