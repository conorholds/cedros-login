/**
 * Integration tests for network error scenarios
 * Tests network failures, timeouts, and connection issues
 */
import { afterEach, describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ApiClient } from '../../utils/apiClient';
import type { AuthResponse } from '../../types';

const TEST_SERVER_URL = 'http://localhost:8080';

describe('Network Error Scenarios', () => {
  const apiClient = new ApiClient({
    baseUrl: TEST_SERVER_URL,
    timeoutMs: 1000, // Short timeout for testing
    retryAttempts: 0,
  });

  describe('Network Errors', () => {
    it('should handle network failure gracefully', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/login`, () => {
          return HttpResponse.error();
        })
      );

      await expect(
        apiClient.post<AuthResponse>('/login', {
          email: 'test@example.com',
          password: 'TestPassword1!',
        })
      ).rejects.toThrow();
    });

    it('rejects unhandled API routes before reaching the real network', async () => {
      const unhandledClient = new ApiClient({
        baseUrl: TEST_SERVER_URL,
        timeoutMs: 1000,
        retryAttempts: 0,
      });

      await expect(
        unhandledClient.post<AuthResponse>('/unhandled-login-route', {
          email: 'test@example.com',
          password: 'TestPassword1!',
        })
      ).rejects.toThrow();
    });
  });

  describe('Timeout Handling', () => {
    afterEach(() => vi.useRealTimers());

    it('rejects at the deadline while the MSW response is still pending', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const slowClient = new ApiClient({
        baseUrl: TEST_SERVER_URL,
        timeoutMs: 100,
        retryAttempts: 0,
      });
      let markStarted!: () => void;
      const started = new Promise<void>((resolve) => {
        markStarted = resolve;
      });
      let releaseResponse!: () => void;
      const responseGate = new Promise<void>((resolve) => {
        releaseResponse = resolve;
      });
      let markFinished!: () => void;
      const finished = new Promise<void>((resolve) => {
        markFinished = resolve;
      });
      server.use(
        http.post(`${TEST_SERVER_URL}/login`, async () => {
          markStarted();
          await responseGate;
          markFinished();
          return HttpResponse.json({ user: { id: '1' } });
        })
      );

      let settled = false;
      const request = slowClient.post('/login', { email: 'test@example.com' });
      const outcome = request.then(
        (value) => {
          settled = true;
          return { value };
        },
        (error: unknown) => {
          settled = true;
          return { error };
        }
      );
      try {
        await started;
        await vi.advanceTimersByTimeAsync(99);
        expect(settled).toBe(false);
        await vi.advanceTimersByTimeAsync(1);
        await expect(outcome).resolves.toMatchObject({ error: { name: 'AbortError' } });
      } finally {
        releaseResponse();
        await finished;
      }
    });
  });
});
