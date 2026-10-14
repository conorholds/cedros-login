import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearSharedReads,
  invalidateSharedReads,
  MAX_SETTLED_READS,
  sharedRead,
} from './requestCache';

const read = (key: string, load: () => Promise<unknown>, ttl = 250) =>
  sharedRead('base', `base\0${key}`, load, { cacheTtlMs: ttl });

afterEach(() => {
  clearSharedReads();
  vi.useRealTimers();
});

describe('bounded shared reads', () => {
  it('evicts the oldest settled entry while keeping the recent working set', async () => {
    const load = vi.fn(async () => ({ value: 1 }));
    for (let i = 0; i <= MAX_SETTLED_READS; i++) await read(String(i), load, 60_000);
    await read(String(MAX_SETTLED_READS), load, 60_000);
    expect(load).toHaveBeenCalledTimes(MAX_SETTLED_READS + 1);
    await read('0', load, 60_000);
    expect(load).toHaveBeenCalledTimes(MAX_SETTLED_READS + 2);
  });

  it('expires idle entries and leaves no maintenance timer after the last expiry', async () => {
    vi.useFakeTimers();
    const load = vi.fn(async () => 1);
    await read('a', load);
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(251);
    expect(vi.getTimerCount()).toBe(0);
    await read('a', load);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('retains only in-flight ownership for TTL zero and handles synchronous failures', async () => {
    vi.useFakeTimers();
    const load = vi.fn(async () => 1);
    const first = read('a', load, 0);
    expect(read('a', load, 0)).toBe(first);
    await first;
    expect(vi.getTimerCount()).toBe(0);
    await read('a', load, 0);
    expect(load).toHaveBeenCalledTimes(2);
    await expect(
      read('bad', () => {
        throw new Error('failed');
      })
    ).rejects.toThrow('failed');
    await expect(read('bad', async () => 2)).resolves.toBe(2);
  });

  it('keeps pending reads under capacity pressure and cannot resurrect an invalidated fill', async () => {
    let resolve!: (value: number) => void;
    const first = read(
      'pending',
      () =>
        new Promise<number>((done) => {
          resolve = done;
        })
    );
    for (let i = 0; i <= MAX_SETTLED_READS; i++) await read(String(i), async () => i);
    expect(read('pending', async () => 99)).toBe(first);
    invalidateSharedReads('base');
    const newer = await read('pending', async () => 2);
    resolve(1);
    await expect(first).resolves.toBe(1);
    expect(await read('pending', async () => 3)).toBe(newer);
  });

  it('does not resurrect a late fill after lifecycle clearing', async () => {
    let resolve!: (value: number) => void;
    const first = read(
      'a',
      () =>
        new Promise<number>((done) => {
          resolve = done;
        })
    );
    await Promise.resolve();
    clearSharedReads();
    resolve(1);
    await first;
    expect(await read('a', async () => 2)).toBe(2);
  });
});
