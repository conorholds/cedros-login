/**
 * Integration tests for HTTP error scenarios
 * Tests HTTP status codes, response format errors, and concurrent requests
 */
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ApiClient, handleApiError } from '../../utils/apiClient';
import type { AuthResponse } from '../../types';

const TEST_SERVER_URL = 'http://localhost:8080';

describe('HTTP Error Scenarios', () => {
  const apiClient = new ApiClient({
    baseUrl: TEST_SERVER_URL,
    timeoutMs: 1000,
    retryAttempts: 0,
  });

  describe('HTTP Status Errors', () => {
    it('should handle 400 Bad Request', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/login`, () => {
          return HttpResponse.json(
            { code: 'VALIDATION_ERROR', message: 'Invalid request body' },
            { status: 400 }
          );
        })
      );

      await expect(
        apiClient.post<AuthResponse>('/login', {
          email: 'test@example.com',
          password: 'TestPassword1!',
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 400,
      });
    });

    it('should handle 401 Unauthorized', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/login`, () => {
          return HttpResponse.json(
            { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
            { status: 401 }
          );
        })
      );

      await expect(
        apiClient.post<AuthResponse>('/login', {
          email: 'test@example.com',
          password: 'WrongPassword',
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 401,
      });
    });

    it('should handle 403 Forbidden', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/login`, () => {
          return HttpResponse.json(
            { code: 'FORBIDDEN', message: 'Account suspended' },
            { status: 403 }
          );
        })
      );

      await expect(
        apiClient.post<AuthResponse>('/login', {
          email: 'suspended@example.com',
          password: 'TestPassword1!',
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 403,
      });
    });

    it('should handle 404 Not Found', async () => {
      server.use(
        http.get(`${TEST_SERVER_URL}/non-existent`, () => {
          return HttpResponse.json(
            { code: 'NOT_FOUND', message: 'Resource not found' },
            { status: 404 }
          );
        })
      );

      await expect(apiClient.get('/non-existent')).rejects.toMatchObject({
        isApiError: true,
        status: 404,
      });
    });

    it('should handle 409 Conflict (duplicate registration)', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/register`, () => {
          return HttpResponse.json(
            { code: 'EMAIL_EXISTS', message: 'Email already registered' },
            { status: 409 }
          );
        })
      );

      await expect(
        apiClient.post<AuthResponse>('/register', {
          email: 'existing@example.com',
          password: 'SecurePass123!',
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 409,
      });
    });

    it('should handle 429 Too Many Requests', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/login`, () => {
          return HttpResponse.json(
            { code: 'RATE_LIMITED', message: 'Too many requests' },
            { status: 429 }
          );
        })
      );

      await expect(
        apiClient.post<AuthResponse>('/login', {
          email: 'test@example.com',
          password: 'TestPassword1!',
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 429,
      });
    });

    // 5xx responses reject with a structured, retryable ApiErrorResponse (same
    // shape as 4xx but retryable), which handleApiError turns into a real
    // user-facing message — never the raw "[object Object]" coercion.
    it.each([
      [500, 'INTERNAL_ERROR', 'Something went wrong'],
      [502, 'BAD_GATEWAY', 'Upstream server error'],
      [503, 'SERVICE_UNAVAILABLE', 'Service temporarily unavailable'],
    ])(
      'preserves structured errors and a usable message for HTTP %i',
      async (status, code, message) => {
        server.use(
          http.post(`${TEST_SERVER_URL}/login`, () =>
            HttpResponse.json({ code, message }, { status })
          )
        );

        const error = await apiClient
          .post<AuthResponse>('/login', { email: 'test@example.com', password: 'TestPassword1!' })
          .catch((e: unknown) => e);

        expect(error).toMatchObject({
          isApiError: true,
          status,
          retryable: true,
          data: { code, message },
        });
        const friendlyMessage = handleApiError(error, 'Login failed').message;
        expect(friendlyMessage).toBeTruthy();
        expect(friendlyMessage).not.toBe('[object Object]');
      }
    );
  });

  describe('Response Format Errors', () => {
    it('preserves text responses instead of passing without assertions', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/login`, () => {
          return new HttpResponse('Not JSON', {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
      );

      const response = await apiClient.post<{ message: string }>('/login', {
        email: 'test@example.com',
        password: 'TestPassword1!',
      });

      expect(response).toEqual({ message: 'Not JSON' });
    });

    it('returns an empty object for 204 responses', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/login`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const response = await apiClient.post<Record<string, never>>('/login', {
        email: 'test@example.com',
        password: 'TestPassword1!',
      });

      expect(response).toEqual({});
    });

    it('should handle malformed JSON response', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/login`, () => {
          return new HttpResponse('{ invalid json }', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );

      await expect(
        apiClient.post<AuthResponse>('/login', {
          email: 'test@example.com',
          password: 'TestPassword1!',
        })
      ).rejects.toThrow();
    });
  });

  describe('Concurrent Request Handling', () => {
    it('resolves concurrent successful requests with the expected auth payloads', async () => {
      const results = await Promise.all([
        apiClient.post<AuthResponse>('/login', {
          email: 'test@example.com',
          password: 'TestPassword1!',
        }),
        apiClient.post<AuthResponse>('/login', {
          email: 'test@example.com',
          password: 'TestPassword1!',
        }),
        apiClient.post<AuthResponse>('/login', {
          email: 'test@example.com',
          password: 'TestPassword1!',
        }),
      ]);

      expect(results).toHaveLength(3);
      expect(results.map((result) => result.user.email)).toEqual([
        'test@example.com',
        'test@example.com',
        'test@example.com',
      ]);
      expect(results.every((result) => result.isNewUser === false)).toBe(true);
    });

    it('should handle mixed success and failure', async () => {
      let requestCount = 0;
      server.use(
        http.post(`${TEST_SERVER_URL}/login`, () => {
          requestCount++;
          if (requestCount % 2 === 0) {
            return HttpResponse.json(
              { code: 'INTERNAL_ERROR', message: 'Random failure' },
              { status: 500 }
            );
          }
          return HttpResponse.json({
            user: {
              id: '1',
              email: 'test@example.com',
              emailVerified: false,
              authMethods: ['email'],
            },
            tokens: { accessToken: 'token', refreshToken: 'refresh', expiresIn: 900 },
            isNewUser: false,
          });
        })
      );

      const results = await Promise.allSettled([
        apiClient.post<AuthResponse>('/login', {
          email: 'test@example.com',
          password: 'TestPassword1!',
        }),
        apiClient.post<AuthResponse>('/login', {
          email: 'test@example.com',
          password: 'TestPassword1!',
        }),
        apiClient.post<AuthResponse>('/login', {
          email: 'test@example.com',
          password: 'TestPassword1!',
        }),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled').length;
      const rejected = results.filter((r) => r.status === 'rejected').length;
      const rejectedResult = results.find((r) => r.status === 'rejected');

      expect(fulfilled).toBe(2);
      expect(rejected).toBe(1);
      expect(rejectedResult).toMatchObject({
        status: 'rejected',
        reason: { isApiError: true, status: 500 },
      });
    });
  });
});
