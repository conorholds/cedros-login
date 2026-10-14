import { describe, expect, it } from 'vitest';

import {
  CEDROS_LOGIN_EXTENSION_ROUTE_PREFIX,
  cedrosLoginExtensionBaseUrl,
} from './extensionBaseUrl';

describe('cedrosLoginExtensionBaseUrl', () => {
  it('appends the extension mount prefix to the host origin', () => {
    expect(cedrosLoginExtensionBaseUrl('https://app.example.com')).toBe(
      'https://app.example.com/extensions/cedros-login'
    );
  });

  it('trims trailing slashes before appending', () => {
    expect(cedrosLoginExtensionBaseUrl('http://127.0.0.1:42070/')).toBe(
      'http://127.0.0.1:42070/extensions/cedros-login'
    );
  });

  it('is idempotent when the URL is already mounted (no double prefix)', () => {
    const mounted = `https://app.example.com${CEDROS_LOGIN_EXTENSION_ROUTE_PREFIX}`;
    expect(cedrosLoginExtensionBaseUrl(mounted)).toBe(mounted);
  });

  it('falls back to the bare prefix for empty/undefined input', () => {
    expect(cedrosLoginExtensionBaseUrl('')).toBe(CEDROS_LOGIN_EXTENSION_ROUTE_PREFIX);
    expect(cedrosLoginExtensionBaseUrl(undefined)).toBe(CEDROS_LOGIN_EXTENSION_ROUTE_PREFIX);
  });
});
