import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TokenManager } from './tokenManager';
import type { TokenPair } from '../types';

describe('TokenManager', () => {
  let tokenManager: TokenManager;

  const mockTokens: TokenPair = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 900, // 15 minutes
  };

  beforeEach(() => {
    vi.useFakeTimers();
    // Clear localStorage
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('memory storage', () => {
    beforeEach(() => {
      tokenManager = new TokenManager('memory');
    });

    it('should store tokens', () => {
      tokenManager.setTokens(mockTokens);
      expect(tokenManager.hasTokens()).toBe(true);
      expect(tokenManager.getAccessToken()).toBe('mock-access-token');
      expect(tokenManager.getRefreshToken()).toBe('mock-refresh-token');
    });

    it('should clear tokens', () => {
      tokenManager.setTokens(mockTokens);
      tokenManager.clear();
      expect(tokenManager.hasTokens()).toBe(false);
      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBeNull();
    });

    it('should return null for access token when expired', () => {
      tokenManager.setTokens(mockTokens);

      // Advance time past expiry
      vi.advanceTimersByTime(901 * 1000);

      expect(tokenManager.getAccessToken()).toBeNull();
    });

    it('should return time until expiry', () => {
      tokenManager.setTokens(mockTokens);

      // Initially should be close to 900 seconds
      const timeUntilExpiry = tokenManager.getTimeUntilExpiry();
      expect(timeUntilExpiry).toBeLessThanOrEqual(900 * 1000);
      expect(timeUntilExpiry).toBeGreaterThan(899 * 1000);

      // Advance time by 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000);

      const newTimeUntilExpiry = tokenManager.getTimeUntilExpiry();
      expect(newTimeUntilExpiry).toBeLessThanOrEqual(600 * 1000);
    });

    it('retains refresh authority when the access token expires', () => {
      const onSessionExpired = vi.fn();
      tokenManager.setSessionExpiredCallback(onSessionExpired);
      tokenManager.setTokens(mockTokens);

      // Only the server can determine refresh expiry.
      vi.advanceTimersByTime(901 * 1000);
      tokenManager.getAccessToken();

      expect(onSessionExpired).not.toHaveBeenCalled();
      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBe(mockTokens.refreshToken);
    });
  });

  describe('localStorage storage', () => {
    let warnSpy: { mockRestore: () => void };

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      tokenManager = new TokenManager('localStorage', undefined, { allowWebStorage: true });
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('should persist tokens to localStorage', () => {
      tokenManager.setTokens(mockTokens);

      const stored = localStorage.getItem('cedros_tokens');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.tokens.accessToken).toBe('mock-access-token');
    });

    it('should load tokens from localStorage on init', () => {
      // Pre-populate localStorage
      const storedData = {
        tokens: mockTokens,
        expiresAt: Date.now() + 900 * 1000,
      };
      localStorage.setItem('cedros_tokens', JSON.stringify(storedData));

      // Create new manager - should load from storage
      const newManager = new TokenManager('localStorage', undefined, { allowWebStorage: true });
      expect(newManager.hasTokens()).toBe(true);
      expect(newManager.getAccessToken()).toBe('mock-access-token');
    });

    it('should not load expired tokens from localStorage', () => {
      // Pre-populate localStorage with expired tokens
      const storedData = {
        tokens: mockTokens,
        expiresAt: Date.now() - 1000, // Already expired
      };
      localStorage.setItem('cedros_tokens', JSON.stringify(storedData));

      // Create new manager - should not load expired tokens
      const newManager = new TokenManager('localStorage', undefined, { allowWebStorage: true });
      expect(newManager.hasTokens()).toBe(false);
      expect(newManager.getAccessToken()).toBeNull();
      expect(newManager.getRefreshToken()).toBe(mockTokens.refreshToken);
    });

    it('should clear tokens from localStorage', () => {
      tokenManager.setTokens(mockTokens);
      expect(localStorage.getItem('cedros_tokens')).not.toBeNull();

      tokenManager.clear();
      expect(localStorage.getItem('cedros_tokens')).toBeNull();
    });

    it('should honor a custom persist key', () => {
      const customKey = 'custom_tokens';
      const customManager = new TokenManager('localStorage', customKey, { allowWebStorage: true });
      customManager.setTokens(mockTokens);

      expect(localStorage.getItem(customKey)).not.toBeNull();
      expect(localStorage.getItem('cedros_tokens')).toBeNull();
    });
  });

  describe('sessionStorage storage', () => {
    let warnSpy: { mockRestore: () => void };

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      tokenManager = new TokenManager('sessionStorage', undefined, { allowWebStorage: true });
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('should persist tokens to sessionStorage', () => {
      tokenManager.setTokens(mockTokens);

      const stored = sessionStorage.getItem('cedros_tokens');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.tokens.accessToken).toBe('mock-access-token');
    });

    it('should load tokens from sessionStorage on init', () => {
      const storedData = {
        tokens: mockTokens,
        expiresAt: Date.now() + 900 * 1000,
      };
      sessionStorage.setItem('cedros_tokens', JSON.stringify(storedData));

      const newManager = new TokenManager('sessionStorage', undefined, { allowWebStorage: true });
      expect(newManager.hasTokens()).toBe(true);
      expect(newManager.getAccessToken()).toBe('mock-access-token');
    });

    it('should clear tokens from sessionStorage', () => {
      tokenManager.setTokens(mockTokens);
      expect(sessionStorage.getItem('cedros_tokens')).not.toBeNull();

      tokenManager.clear();
      expect(sessionStorage.getItem('cedros_tokens')).toBeNull();
    });
  });

  describe('web storage requires opt-in', () => {
    it('should not read or write localStorage when allowWebStorage is false', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const storedData = {
        tokens: mockTokens,
        expiresAt: Date.now() + 900 * 1000,
      };
      localStorage.setItem('cedros_tokens', JSON.stringify(storedData));

      const manager = new TokenManager('localStorage');
      expect(manager.hasTokens()).toBe(false);
      expect(manager.getAccessToken()).toBeNull();

      localStorage.removeItem('cedros_tokens');
      expect(localStorage.getItem('cedros_tokens')).toBeNull();

      manager.setTokens(mockTokens);
      expect(localStorage.getItem('cedros_tokens')).toBeNull();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('web storage disabled by default')
      );

      warnSpy.mockRestore();
    });

    it('should not read or write sessionStorage when allowWebStorage is false', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const storedData = {
        tokens: mockTokens,
        expiresAt: Date.now() + 900 * 1000,
      };
      sessionStorage.setItem('cedros_tokens', JSON.stringify(storedData));

      const manager = new TokenManager('sessionStorage');
      expect(manager.hasTokens()).toBe(false);
      expect(manager.getAccessToken()).toBeNull();

      sessionStorage.removeItem('cedros_tokens');
      expect(sessionStorage.getItem('cedros_tokens')).toBeNull();

      manager.setTokens(mockTokens);
      expect(sessionStorage.getItem('cedros_tokens')).toBeNull();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('web storage disabled by default')
      );

      warnSpy.mockRestore();
    });
  });

  describe('auto-refresh', () => {
    beforeEach(() => {
      tokenManager = new TokenManager('memory');
    });

    it('should schedule refresh before expiry', async () => {
      const onRefreshNeeded = vi.fn().mockResolvedValue(undefined);
      tokenManager.setRefreshCallback(onRefreshNeeded);
      tokenManager.setTokens(mockTokens);

      // Refresh buffer is 60 seconds, so should refresh at 14 minutes (840 seconds)
      // Advance to just before refresh time
      vi.advanceTimersByTime(839 * 1000);
      expect(onRefreshNeeded).not.toHaveBeenCalled();

      // Advance past refresh time
      vi.advanceTimersByTime(2 * 1000);
      expect(onRefreshNeeded).toHaveBeenCalledTimes(1);
    });

    it('should cancel refresh on clear', () => {
      const onRefreshNeeded = vi.fn().mockResolvedValue(undefined);
      tokenManager.setRefreshCallback(onRefreshNeeded);
      tokenManager.setTokens(mockTokens);

      // Clear before refresh time
      tokenManager.clear();

      // Advance past refresh time
      vi.advanceTimersByTime(900 * 1000);
      expect(onRefreshNeeded).not.toHaveBeenCalled();
    });

    it('should call session expired on refresh failure', async () => {
      const onRefreshNeeded = vi.fn().mockRejectedValue(new Error('Refresh failed'));
      const onSessionExpired = vi.fn();

      tokenManager.setRefreshCallback(onRefreshNeeded);
      tokenManager.setSessionExpiredCallback(onSessionExpired);
      tokenManager.setTokens(mockTokens);

      // Advance past refresh time
      vi.advanceTimersByTime(841 * 1000);

      // Wait for the async rejection to be handled
      await vi.runAllTimersAsync();

      expect(onSessionExpired).toHaveBeenCalled();
    });
  });

  describe('hasTokens', () => {
    beforeEach(() => {
      tokenManager = new TokenManager('memory');
    });

    it('should return false when no tokens', () => {
      expect(tokenManager.hasTokens()).toBe(false);
    });

    it('should return true when tokens exist and not expired', () => {
      tokenManager.setTokens(mockTokens);
      expect(tokenManager.hasTokens()).toBe(true);
    });

    it('should return false when tokens are expired', () => {
      tokenManager.setTokens(mockTokens);
      vi.advanceTimersByTime(901 * 1000);
      expect(tokenManager.hasTokens()).toBe(false);
    });
  });

  // Security warning tests
  describe('security warnings', () => {
    it('should warn when using localStorage', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      new TokenManager('localStorage', undefined, { allowWebStorage: true });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Using web storage for token storage')
      );
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('XSS attacks'));

      warnSpy.mockRestore();
    });

    it('should warn when using sessionStorage', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      new TokenManager('sessionStorage', undefined, { allowWebStorage: true });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Using web storage for token storage')
      );

      warnSpy.mockRestore();
    });

    it('should not warn when using memory storage', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      new TokenManager('memory');

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('should not warn when using cookie storage', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      new TokenManager('cookie');

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });
});

describe('session lifecycle boundaries', () => {
  const tokens = { accessToken: 'access', refreshToken: 'refresh', expiresIn: 900 };
  afterEach(() => vi.useRealTimers());

  it('cannot restore tokens after destruction', () => {
    const manager = new TokenManager('memory');
    manager.destroy();
    manager.setTokens(tokens);
    expect(manager.getAccessToken()).toBeNull();
    expect(manager.getRefreshToken()).toBeNull();
  });

  it('a failed old refresh cannot clear a subsequent login', async () => {
    vi.useFakeTimers();
    const manager = new TokenManager('memory');
    let rejectRefresh!: (error: Error) => void;
    manager.setRefreshCallback(
      () =>
        new Promise((_, reject) => {
          rejectRefresh = reject;
        })
    );
    manager.setTokens(tokens);
    await vi.advanceTimersByTimeAsync(840_000);
    manager.setTokens({ ...tokens, accessToken: 'new-login' });
    rejectRefresh(new Error('old refresh failed'));
    await Promise.resolve();
    expect(manager.getAccessToken()).toBe('new-login');
    manager.destroy();
  });

  it('preserves persisted authority and the exact access deadline on remount', () => {
    vi.useFakeTimers();
    const manager = new TokenManager('localStorage', 'remount-test', { allowWebStorage: true });
    manager.setTokens(tokens);
    vi.advanceTimersByTime(800_000);
    manager.destroy();
    const next = new TokenManager('localStorage', 'remount-test', { allowWebStorage: true });
    expect(next.getTimeUntilExpiry()).toBe(100_000);
    vi.advanceTimersByTime(100_001);
    expect(next.getAccessToken()).toBeNull();
    expect(next.getRefreshToken()).toBe('refresh');
    next.clear();
    next.destroy();
  });

  it('rejects non-finite expiry and preserves a reconciled absolute deadline', () => {
    const manager = new TokenManager('memory');
    expect(() => manager.setTokens({ ...tokens, expiresIn: Infinity })).toThrow();
    const deadline = Date.now() + 1000;
    manager.setTokens(tokens, deadline);
    expect(manager.getTimeUntilExpiry()).toBeLessThanOrEqual(1000);
    manager.destroy();
  });
});
