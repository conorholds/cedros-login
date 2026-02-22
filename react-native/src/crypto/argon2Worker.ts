/// <reference lib="webworker" />
import { argon2Derive } from './argon2';
import { toArgon2Salt } from './types';
import type { WorkerRequest, WorkerResponse } from './argon2WorkerTypes';

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
