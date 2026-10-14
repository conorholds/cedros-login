/**
 * Unit tests for CSRF token utilities
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getCsrfToken } from './csrf';

describe('getCsrfToken', () => {
  beforeEach(() => {
    // Clear cookies and meta tags before each test
    document.cookie = 'XSRF-TOKEN=; Max-Age=0';
    document.cookie = 'xsrf-token=; Max-Age=0';
    document.querySelector('meta[name="csrf-token"]')?.remove();
  });

  afterEach(() => {
    // Cleanup after each test
    document.cookie = 'XSRF-TOKEN=; Max-Age=0';
    document.cookie = 'xsrf-token=; Max-Age=0';
    document.querySelector('meta[name="csrf-token"]')?.remove();
  });

  describe('valid tokens', () => {
    it('should return token from meta tag when valid length', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'csrf-token');
      meta.setAttribute('content', 'valid_csrf_token_1234567890abcdef');
      document.head.appendChild(meta);

      expect(getCsrfToken()).toBe('valid_csrf_token_1234567890abcdef');
    });

    it('should return token from XSRF-TOKEN cookie when valid length', () => {
      document.cookie = 'XSRF-TOKEN=valid_csrf_token_6789012345abcdef';

      expect(getCsrfToken()).toBe('valid_csrf_token_6789012345abcdef');
    });

    it('should return token from lowercase xsrf-token cookie', () => {
      document.cookie = 'xsrf-token=valid_csrf_token_lower_abcdef012';

      expect(getCsrfToken()).toBe('valid_csrf_token_lower_abcdef012');
    });

    it('should preserve tokens containing equals signs', () => {
      // Base64 tokens often end with '='
      document.cookie = 'XSRF-TOKEN=valid_csrf_token_abcdef0123456==';

      expect(getCsrfToken()).toBe('valid_csrf_token_abcdef0123456==');
    });

    it('should prefer meta tag over cookie', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'csrf-token');
      meta.setAttribute('content', 'meta_csrf_token_1234567890abcdef');
      document.head.appendChild(meta);
      document.cookie = 'XSRF-TOKEN=cookie_csrf_token_67890_abcdef01';

      expect(getCsrfToken()).toBe('meta_csrf_token_1234567890abcdef');
    });
  });

  describe('weak token rejection (UI-CSRF)', () => {
    it('should reject tokens shorter than 32 characters from meta tag', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'csrf-token');
      meta.setAttribute('content', 'short_token');
      document.head.appendChild(meta);

      expect(getCsrfToken()).toBeNull();
    });

    it('should reject tokens shorter than 32 characters from cookie', () => {
      document.cookie = 'XSRF-TOKEN=weak123';

      expect(getCsrfToken()).toBeNull();
    });

    it('should accept tokens with exactly 32 characters', () => {
      document.cookie = 'XSRF-TOKEN=12345678901234567890123456789012';

      expect(getCsrfToken()).toBe('12345678901234567890123456789012');
    });

    it('should reject 31 character tokens', () => {
      document.cookie = 'XSRF-TOKEN=1234567890123456789012345678901';

      expect(getCsrfToken()).toBeNull();
    });

    it('should fall back to cookie if meta tag has weak token', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'csrf-token');
      meta.setAttribute('content', 'short');
      document.head.appendChild(meta);
      document.cookie = 'XSRF-TOKEN=valid_csrf_token_from_cookie_abcdef';

      expect(getCsrfToken()).toBe('valid_csrf_token_from_cookie_abcdef');
    });
  });

  describe('missing tokens', () => {
    it('should return null when no token is available', () => {
      expect(getCsrfToken()).toBeNull();
    });

    it('should return null for empty meta tag content', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'csrf-token');
      meta.setAttribute('content', '');
      document.head.appendChild(meta);

      expect(getCsrfToken()).toBeNull();
    });

    it('should return null for empty cookie value', () => {
      document.cookie = 'XSRF-TOKEN=';

      expect(getCsrfToken()).toBeNull();
    });
  });

  describe('URL encoding', () => {
    it('should decode URL-encoded tokens', () => {
      // URL encode a valid-length token (decoded: valid_csrf_token_01234567890==== = 32 chars)
      document.cookie = 'XSRF-TOKEN=valid_csrf_token_01234567890%3D%3D%3D%3D';

      expect(getCsrfToken()).toBe('valid_csrf_token_01234567890====');
    });

    it('should skip malformed URL-encoded cookies', () => {
      // Set a malformed cookie and a valid one
      document.cookie = 'XSRF-TOKEN=%invalid%';
      // The implementation should skip malformed cookies, so this should return null
      // since we only have the malformed one

      expect(getCsrfToken()).toBeNull();
    });
  });
});
