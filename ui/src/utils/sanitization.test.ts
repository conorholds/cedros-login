/**
 * Unit tests for sanitization utilities
 */
import { describe, it, expect } from 'vitest';
import { sanitizeExternalUrl, sanitizeImageUrl } from './sanitization';

describe('sanitizeImageUrl', () => {
  describe('valid HTTPS URLs', () => {
    it('should allow valid HTTPS URLs', () => {
      expect(sanitizeImageUrl('https://example.com/image.png')).toBe(
        'https://example.com/image.png'
      );
    });

    it('should preserve URL case', () => {
      expect(sanitizeImageUrl('https://Example.Com/Image.PNG')).toBe(
        'https://Example.Com/Image.PNG'
      );
    });

    it('should allow URLs with query parameters', () => {
      expect(sanitizeImageUrl('https://example.com/image.png?size=100')).toBe(
        'https://example.com/image.png?size=100'
      );
    });

    it('should allow URLs with fragments', () => {
      expect(sanitizeImageUrl('https://example.com/image.png#section')).toBe(
        'https://example.com/image.png#section'
      );
    });

    it('should allow URLs with ports', () => {
      expect(sanitizeImageUrl('https://example.com:8080/image.png')).toBe(
        'https://example.com:8080/image.png'
      );
    });

    it('should allow URLs with authentication', () => {
      const url = new URL('https://example.com/image.png');
      url.username = 'user';
      url.password = 'example';
      expect(sanitizeImageUrl(url.toString())).toBe(url.toString());
    });

    it('should allow CDN URLs', () => {
      expect(sanitizeImageUrl('https://cdn.cloudflare.com/assets/image.jpg')).toBe(
        'https://cdn.cloudflare.com/assets/image.jpg'
      );
    });
  });

  describe('dangerous protocols', () => {
    it('should block javascript: protocol', () => {
      expect(sanitizeImageUrl('javascript:alert(1)')).toBeUndefined();
    });

    it('should block javascript: with uppercase', () => {
      expect(sanitizeImageUrl('JAVASCRIPT:alert(1)')).toBeUndefined();
    });

    it('should block javascript: with mixed case', () => {
      expect(sanitizeImageUrl('JaVaScRiPt:alert(1)')).toBeUndefined();
    });

    it('should block data: protocol', () => {
      expect(sanitizeImageUrl('data:image/svg+xml,<svg></svg>')).toBeUndefined();
    });

    it('should block vbscript: protocol', () => {
      expect(sanitizeImageUrl('vbscript:msgbox("xss")')).toBeUndefined();
    });

    it('should block file: protocol', () => {
      expect(sanitizeImageUrl('file:///tmp/example.txt')).toBeUndefined();
    });
  });

  describe('non-HTTPS protocols', () => {
    it('should block HTTP URLs', () => {
      expect(sanitizeImageUrl('http://example.com/image.png')).toBeUndefined();
    });

    it('should block FTP URLs', () => {
      expect(sanitizeImageUrl('ftp://example.com/image.png')).toBeUndefined();
    });

    it('should block mailto: URLs', () => {
      expect(sanitizeImageUrl('mailto:test@example.com')).toBeUndefined();
    });

    it('should block tel: URLs', () => {
      expect(sanitizeImageUrl('tel:+1234567890')).toBeUndefined();
    });
  });

  describe('invalid inputs', () => {
    it('should return undefined for null', () => {
      expect(sanitizeImageUrl(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(sanitizeImageUrl(undefined)).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(sanitizeImageUrl('')).toBeUndefined();
    });

    it('should return undefined for whitespace only', () => {
      expect(sanitizeImageUrl('   ')).toBeUndefined();
    });

    it('should return undefined for invalid URL format', () => {
      expect(sanitizeImageUrl('not-a-url')).toBeUndefined();
    });

    it('should return undefined for relative paths', () => {
      expect(sanitizeImageUrl('/images/photo.png')).toBeUndefined();
    });

    it('should return undefined for protocol-relative URLs', () => {
      expect(sanitizeImageUrl('//example.com/image.png')).toBeUndefined();
    });
  });

  describe('whitespace handling', () => {
    it('should trim leading whitespace', () => {
      expect(sanitizeImageUrl('  https://example.com/image.png')).toBe(
        'https://example.com/image.png'
      );
    });

    it('should trim trailing whitespace', () => {
      expect(sanitizeImageUrl('https://example.com/image.png  ')).toBe(
        'https://example.com/image.png'
      );
    });

    it('should trim both leading and trailing whitespace', () => {
      expect(sanitizeImageUrl('  https://example.com/image.png  ')).toBe(
        'https://example.com/image.png'
      );
    });
  });

  describe('XSS attack vectors', () => {
    it('should block javascript with encoded characters', () => {
      expect(sanitizeImageUrl('java\u0000script:alert(1)')).toBeUndefined();
    });

    it('should block javascript with whitespace padding', () => {
      expect(sanitizeImageUrl('   javascript:alert(1)')).toBeUndefined();
    });

    it('should block SVG XSS payloads', () => {
      expect(sanitizeImageUrl('data:image/svg+xml,<svg onload="alert(1)">')).toBeUndefined();
    });
  });
});

describe('sanitizeExternalUrl', () => {
  it('should allow https URLs', () => {
    expect(sanitizeExternalUrl('https://example.com')).toBe('https://example.com');
  });

  it('should allow http URLs', () => {
    expect(sanitizeExternalUrl('http://example.com')).toBe('http://example.com');
  });

  it('should trim whitespace', () => {
    expect(sanitizeExternalUrl('  https://example.com/path  ')).toBe('https://example.com/path');
  });

  it('should block javascript: protocol', () => {
    expect(sanitizeExternalUrl('javascript:alert(1)')).toBeUndefined();
  });

  it('should block data: protocol', () => {
    expect(sanitizeExternalUrl('data:text/html,<b>x</b>')).toBeUndefined();
  });

  it('should block non-http(s) protocols', () => {
    expect(sanitizeExternalUrl('mailto:test@example.com')).toBeUndefined();
    expect(sanitizeExternalUrl('ftp://example.com')).toBeUndefined();
  });

  it('should return undefined for invalid URL strings', () => {
    expect(sanitizeExternalUrl('not-a-url')).toBeUndefined();
    expect(sanitizeExternalUrl('/relative')).toBeUndefined();
    expect(sanitizeExternalUrl('//example.com')).toBeUndefined();
  });
});
