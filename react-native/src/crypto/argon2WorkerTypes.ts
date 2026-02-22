import type { KdfParams } from './types';

export type WorkerRequest = {
  id: number;
  password: string;
  salt: Uint8Array;
  params: KdfParams;
};

export type WorkerResponse = {
  id: number;
  key?: Uint8Array;
  error?: string;
};
