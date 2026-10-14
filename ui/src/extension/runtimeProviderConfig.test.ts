import { describe, expect, it } from 'vitest';

import {
  resolveExtensionAccountProviderConfig,
  resolveExtensionPublicAuthProviderConfig,
} from './runtimeProviderConfig';

// Embedded providers must follow the HOST's resolved color mode (footer
// toggle / system), never prefers-color-scheme: a manual site override would
// not reach media queries. Light when the host doesn't supply a mode (SSR,
// older hosts), and never mutate the host page's root element.
describe('runtime provider config color mode', () => {
  it('pins the provider theme to the host-resolved colorMode', () => {
    const config = resolveExtensionPublicAuthProviderConfig({}, undefined, 'dark');
    expect(config.theme).toBe('dark');
    expect(config.applyThemeToDocument).toBe(false);
  });

  it('carries the host-discovered access-code policy into the public provider', () => {
    const config = resolveExtensionPublicAuthProviderConfig({
      features: { signupAccessCodeRequired: true },
    });

    expect(config.signupAccessCodeRequired).toBe(true);
  });

  it('defaults to light when the host does not provide a mode', () => {
    const config = resolveExtensionPublicAuthProviderConfig({}, undefined, undefined);
    expect(config.theme).toBe('light');
    expect(config.applyThemeToDocument).toBe(false);
  });

  it('threads colorMode through the account workspace config', () => {
    const config = resolveExtensionAccountProviderConfig({}, undefined, 'dark');
    expect(config.theme).toBe('dark');
    expect(config.serverUrl.endsWith('/public-auth') || config.serverUrl === '').toBe(true);
  });
});
