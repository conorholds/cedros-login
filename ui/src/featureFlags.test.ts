import { describe, expect, it } from 'vitest';

import {
  FEATURE_FLAG_REGISTRY,
  getAutoDiscoverableFeatureDefaults,
  getFeatureFlagDefinition,
  isFeatureEnabled,
  parseFeatureFlagBoolean,
  readFeatureFlagEnv,
  resolveFeatureFlags,
} from './featureFlags';

describe('featureFlags', () => {
  it('uses registry defaults when no overrides are provided', () => {
    expect(resolveFeatureFlags()).toEqual({
      email: true,
      google: true,
      apple: true,
      solana: true,
      webauthn: true,
      instantLink: false,
      walletEnrollment: true,
    });
  });

  it('parses common truthy and falsy env values', () => {
    expect(parseFeatureFlagBoolean('1')).toBe(true);
    expect(parseFeatureFlagBoolean('true')).toBe(true);
    expect(parseFeatureFlagBoolean('YES')).toBe(true);
    expect(parseFeatureFlagBoolean('on')).toBe(true);
    expect(parseFeatureFlagBoolean('0')).toBe(false);
    expect(parseFeatureFlagBoolean('false')).toBe(false);
    expect(parseFeatureFlagBoolean('No')).toBe(false);
    expect(parseFeatureFlagBoolean('off')).toBe(false);
    expect(parseFeatureFlagBoolean('maybe')).toBeUndefined();
  });

  it('reads env overrides from the registry env vars', () => {
    expect(
      readFeatureFlagEnv({
        CEDROS_FEATURE_INSTANT_LINK: 'yes',
        CEDROS_FEATURE_WALLET_ENROLLMENT: '0',
      })
    ).toEqual({
      instantLink: true,
      walletEnrollment: false,
    });
  });

  it('applies config overrides ahead of env overrides', () => {
    expect(
      resolveFeatureFlags({
        config: { instantLink: false },
        env: { CEDROS_FEATURE_INSTANT_LINK: 'true' },
      }).instantLink
    ).toBe(false);
  });

  it('applies env overrides ahead of registry defaults and base values', () => {
    expect(
      resolveFeatureFlags({
        env: { CEDROS_FEATURE_INSTANT_LINK: 'true' },
        base: { instantLink: false, google: false },
      })
    ).toMatchObject({
      instantLink: true,
      google: false,
    });
  });

  it('supports helper checks against resolved flags', () => {
    const flags = resolveFeatureFlags({
      config: { instantLink: true },
    });

    expect(isFeatureEnabled('instantLink', { flags })).toBe(true);
    expect(isFeatureEnabled('walletEnrollment', { flags })).toBe(true);
  });

  it('exposes discoverable metadata in one registry', () => {
    expect(getFeatureFlagDefinition('instantLink')).toEqual(FEATURE_FLAG_REGISTRY.instantLink);
    expect(getAutoDiscoverableFeatureDefaults()).toEqual({
      email: true,
      google: true,
      apple: true,
      solana: true,
      webauthn: true,
      instantLink: false,
    });
  });
});
