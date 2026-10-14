/**
 * Integration tests for ApiClient against mock backend
 */
import { describe, it, expect } from 'vitest';
import { ApiClient, createValidator } from '../../utils/apiClient';
import type { AuthResponse, ChallengeResponse } from '../../types';

const TEST_SERVER_URL = 'http://localhost:8080';

describe('ApiClient Integration', () => {
  const apiClient = new ApiClient({
    baseUrl: TEST_SERVER_URL,
    timeoutMs: 5000,
    retryAttempts: 0,
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await apiClient.get<{ status: string }>('/health');
      expect(response.status).toBe('ok');
    });
  });

  describe('Empty Response', () => {
    it('should handle 204 without throwing', async () => {
      const response = await apiClient.get<Record<string, never>>('/no-content');
      expect(response).toEqual({});
    });
  });

  describe('Registration Flow', () => {
    it('should register a new user successfully', async () => {
      const response = await apiClient.post<AuthResponse>('/register', {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
      });

      expect(response.user).toBeDefined();
      expect(response.user.email).toBe('newuser@example.com');
      const tokens = response.tokens;
      expect(tokens).toBeDefined();
      if (!tokens) {
        throw new Error('Missing tokens in response');
      }
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(response.isNewUser).toBe(true);
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await apiClient.post<AuthResponse>('/register', {
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
      });

      // Attempt duplicate registration
      await expect(
        apiClient.post<AuthResponse>('/register', {
          email: 'duplicate@example.com',
          password: 'SecurePass123!',
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 409,
      });
    });

    it('should reject weak passwords', async () => {
      await expect(
        apiClient.post<AuthResponse>('/register', {
          email: 'weakpass@example.com',
          password: 'short',
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 400,
      });
    });
  });

  describe('Login Flow', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await apiClient.post<AuthResponse>('/login', {
        email: 'test@example.com',
        password: 'TestPassword1!',
      });

      expect(response.user).toBeDefined();
      expect(response.user.email).toBe('test@example.com');
      expect(response.tokens).toBeDefined();
      expect(response.isNewUser).toBe(false);
    });

    it('should reject invalid credentials', async () => {
      await expect(
        apiClient.post<AuthResponse>('/login', {
          email: 'test@example.com',
          password: 'WrongPassword!',
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 401,
      });
    });

    it('should reject non-existent user', async () => {
      await expect(
        apiClient.post<AuthResponse>('/login', {
          email: 'nonexistent@example.com',
          password: 'TestPassword1!',
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 401,
      });
    });
  });

  describe('Get User Flow', () => {
    it('should get user with valid token', async () => {
      // First login to get a token
      const loginResponse = await apiClient.post<AuthResponse>('/login', {
        email: 'test@example.com',
        password: 'TestPassword1!',
      });

      const tokens = loginResponse.tokens;
      if (!tokens) {
        throw new Error('Missing tokens in login response');
      }
      const authenticatedClient = new ApiClient({
        baseUrl: TEST_SERVER_URL,
        getAccessToken: () => tokens.accessToken,
      });
      const data = await authenticatedClient.get<{ user: AuthResponse['user'] }>('/user');
      expect(data.user.email).toBe('test@example.com');
    });

    it('should reject request without token', async () => {
      await expect(apiClient.get('/user')).rejects.toMatchObject({
        isApiError: true,
        status: 401,
      });
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh tokens successfully', async () => {
      // Login first
      const loginResponse = await apiClient.post<AuthResponse>('/login', {
        email: 'test@example.com',
        password: 'TestPassword1!',
      });

      const tokens = loginResponse.tokens;
      if (!tokens) {
        throw new Error('Missing tokens in login response');
      }
      // Refresh token
      const refreshResponse = await apiClient.post<{
        tokens: AuthResponse['tokens'];
        user: AuthResponse['user'];
      }>('/refresh', { refreshToken: tokens.refreshToken });

      const refreshTokens = refreshResponse.tokens;
      expect(refreshTokens).toBeDefined();
      if (!refreshTokens) {
        throw new Error('Missing tokens in refresh response');
      }
      expect(refreshTokens.accessToken).toBeDefined();
      expect(refreshTokens.accessToken).not.toBe(tokens.accessToken);
    });

    it('should reject invalid refresh token', async () => {
      await expect(
        apiClient.post('/refresh', { refreshToken: 'invalid-token' })
      ).rejects.toMatchObject({
        isApiError: true,
        status: 401,
      });
    });
  });

  describe('Logout Flow', () => {
    it('should logout successfully', async () => {
      // Login first
      const loginResponse = await apiClient.post<AuthResponse>('/login', {
        email: 'test@example.com',
        password: 'TestPassword1!',
      });

      const tokens = loginResponse.tokens;
      if (!tokens) {
        throw new Error('Missing tokens in login response');
      }
      const authenticatedClient = new ApiClient({
        baseUrl: TEST_SERVER_URL,
        getAccessToken: () => tokens.accessToken,
      });
      await expect(authenticatedClient.get('/user')).resolves.toMatchObject({
        user: { email: 'test@example.com' },
      });
      await authenticatedClient.post('/logout', {});
      await expect(authenticatedClient.get('/user')).rejects.toMatchObject({
        isApiError: true,
        status: 401,
      });
    });
  });

  describe('Password Reset Flow', () => {
    it('should request password reset', async () => {
      const response = await apiClient.post<{ message: string }>('/forgot-password', {
        email: 'test@example.com',
      });

      expect(response.message).toBe('Password reset email sent');
    });
  });

  describe('Solana Auth Flow', () => {
    const validPublicKey = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';

    it('should generate Solana challenge', async () => {
      const response = await apiClient.post<ChallengeResponse>(
        '/solana/challenge',
        { publicKey: validPublicKey },
        { credentials: 'omit' }
      );

      expect(response.message).toBeDefined();
      expect(response.message).toContain(validPublicKey);
      expect(response.nonce).toBeDefined();
      expect(response.expiresAt).toBeDefined();
    });

    it('should reject invalid public key', async () => {
      await expect(
        apiClient.post<ChallengeResponse>(
          '/solana/challenge',
          { publicKey: 'invalid' },
          { credentials: 'omit' }
        )
      ).rejects.toMatchObject({
        isApiError: true,
        status: 400,
      });
    });

    it('should authenticate with valid signature', async () => {
      // Get challenge first
      const challenge = await apiClient.post<ChallengeResponse>(
        '/solana/challenge',
        { publicKey: validPublicKey },
        { credentials: 'omit' }
      );

      // Authenticate with mock signature
      const response = await apiClient.post<AuthResponse>('/solana', {
        publicKey: validPublicKey,
        signature: 'mock-signature-base64',
        message: challenge.message,
      });

      expect(response.user).toBeDefined();
      expect(response.user.walletAddress).toBe(validPublicKey);
      expect(response.tokens).toBeDefined();
    });
  });

  // Response validation tests
  describe('Response Validation', () => {
    it('should pass validation with correct response shape', async () => {
      const validator = createValidator<{ status: string }>({
        status: 'string',
      });

      const response = await apiClient.get<{ status: string }>('/health', { validator });
      expect(response.status).toBe('ok');
    });

    it('should throw on missing required field', async () => {
      // Validator expects a 'nonexistent' field that the /health endpoint doesn't return
      const validator = createValidator<{ nonexistent: string }>({
        nonexistent: 'string',
      });

      await expect(apiClient.get('/health', { validator })).rejects.toThrow(
        'Response validation failed: Missing required field: nonexistent'
      );
    });

    it('should throw on type mismatch', async () => {
      // /health returns { status: 'ok' } (string), validator expects number
      const validator = createValidator<{ status: number }>({
        status: 'number',
      });

      await expect(apiClient.get('/health', { validator })).rejects.toThrow(
        'Response validation failed: Invalid type for status: expected number, got string'
      );
    });
  });
});
