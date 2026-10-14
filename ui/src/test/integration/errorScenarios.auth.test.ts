/**
 * Integration tests for authentication error scenarios
 * Tests token errors, validation errors, and Solana auth errors
 */
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ApiClient } from '../../utils/apiClient';
import type { AuthResponse } from '../../types';

const TEST_SERVER_URL = 'http://localhost:8080';

describe('Authentication Error Scenarios', () => {
  const apiClient = new ApiClient({
    baseUrl: TEST_SERVER_URL,
    timeoutMs: 1000,
    retryAttempts: 0,
  });

  describe('Token Errors', () => {
    it('should handle expired access token', async () => {
      server.use(
        http.get(`${TEST_SERVER_URL}/user`, () => {
          return HttpResponse.json(
            { code: 'TOKEN_EXPIRED', message: 'Access token has expired' },
            { status: 401 }
          );
        })
      );

      const authenticatedClient = new ApiClient({
        baseUrl: TEST_SERVER_URL,
        getAccessToken: () => 'expired-token',
        retryAttempts: 0,
      });
      await expect(authenticatedClient.get('/user')).rejects.toMatchObject({
        isApiError: true,
        status: 401,
        data: { code: 'TOKEN_EXPIRED' },
      });
    });

    it('should handle invalid refresh token', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/refresh`, () => {
          return HttpResponse.json(
            { code: 'INVALID_TOKEN', message: 'Invalid refresh token' },
            { status: 401 }
          );
        })
      );

      await expect(
        apiClient.post('/refresh', { refreshToken: 'invalid-token' })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 401,
      });
    });

    it('should handle revoked refresh token', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/refresh`, () => {
          return HttpResponse.json(
            { code: 'TOKEN_REVOKED', message: 'Refresh token has been revoked' },
            { status: 401 }
          );
        })
      );

      await expect(
        apiClient.post('/refresh', { refreshToken: 'revoked-token' })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 401,
      });
    });
  });

  describe('Validation Errors', () => {
    it('should handle invalid email format from server', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/register`, () => {
          return HttpResponse.json(
            { code: 'VALIDATION_ERROR', message: 'Invalid email format', field: 'email' },
            { status: 400 }
          );
        })
      );

      await expect(
        apiClient.post<AuthResponse>('/register', {
          email: 'bad-email',
          password: 'SecurePass123!',
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 400,
      });
    });

    it('should handle weak password error', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/register`, () => {
          return HttpResponse.json(
            { code: 'WEAK_PASSWORD', message: 'Password does not meet requirements' },
            { status: 400 }
          );
        })
      );

      await expect(
        apiClient.post<AuthResponse>('/register', {
          email: 'test@example.com',
          password: 'weak',
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 400,
      });
    });

    it('should handle missing required fields', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/login`, () => {
          return HttpResponse.json(
            { code: 'VALIDATION_ERROR', message: 'Email is required' },
            { status: 400 }
          );
        })
      );

      await expect(
        apiClient.post<AuthResponse>('/login', {
          password: 'TestPassword1!',
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 400,
      });
    });
  });

  describe('Solana Auth Errors', () => {
    it('should handle invalid signature', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/solana`, () => {
          return HttpResponse.json(
            { code: 'INVALID_SIGNATURE', message: 'Signature verification failed' },
            { status: 401 }
          );
        })
      );

      await expect(
        apiClient.post<AuthResponse>('/solana', {
          publicKey: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
          signature: 'bad-signature',
          message: 'Sign this message',
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 401,
      });
    });

    it('should handle expired challenge', async () => {
      server.use(
        http.post(`${TEST_SERVER_URL}/solana`, () => {
          return HttpResponse.json(
            { code: 'CHALLENGE_EXPIRED', message: 'Challenge has expired' },
            { status: 400 }
          );
        })
      );

      await expect(
        apiClient.post<AuthResponse>('/solana', {
          publicKey: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
          signature: 'valid-signature',
          message: 'Expired challenge message',
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 400,
      });
    });
  });
});
