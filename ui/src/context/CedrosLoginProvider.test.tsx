import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

import type { FeatureFlags } from '../types';

// --- Mocks ---

const autoFeaturesResult = {
  features: null as FeatureFlags | null,
  googleClientId: undefined as string | undefined,
  appleClientId: undefined as string | undefined,
  isLoading: false,
};

vi.mock('../hooks/useAutoFeatures', () => ({
  useAutoFeatures: () => autoFeaturesResult,
}));

vi.mock('../hooks/useThemeManager', () => ({
  useThemeManager: vi.fn().mockReturnValue({ className: '', style: {} }),
}));

vi.mock('../hooks/useAuthSession', () => ({
  useAuthSession: () => ({
    user: null,
    authState: 'unauthenticated',
    handleLoginSuccess: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
    getAccessToken: vi.fn(),
  }),
}));

import { CedrosLoginProvider } from './CedrosLoginProvider';
import { AuthStateContext } from './CedrosLoginContext';

/** Renders a consumer that reads config from context and shows the client IDs. */
function ConfigReader() {
  const ctx = React.useContext(AuthStateContext);
  return (
    <div>
      <span data-testid="google">{ctx?.config.googleClientId ?? 'none'}</span>
      <span data-testid="apple">{ctx?.config.appleClientId ?? 'none'}</span>
      <span data-testid="google-enabled">{String(ctx?.isFeatureEnabled('google') ?? false)}</span>
      <span data-testid="instant-link">
        {String(ctx?.isFeatureEnabled('instantLink') ?? false)}
      </span>
    </div>
  );
}

describe('CedrosLoginProvider — client ID merging', () => {
  beforeEach(() => {
    autoFeaturesResult.features = {
      email: true,
      google: true,
      apple: true,
      solana: false,
      webauthn: false,
      instantLink: false,
    };
    autoFeaturesResult.googleClientId = undefined;
    autoFeaturesResult.appleClientId = undefined;
    autoFeaturesResult.isLoading = false;
  });

  it('uses server-provided client IDs when config has none', () => {
    autoFeaturesResult.googleClientId = 'server-goog';
    autoFeaturesResult.appleClientId = 'server-apple';

    render(
      <CedrosLoginProvider config={{ serverUrl: 'http://localhost', features: 'auto' }}>
        <ConfigReader />
      </CedrosLoginProvider>
    );

    expect(screen.getByTestId('google').textContent).toBe('server-goog');
    expect(screen.getByTestId('apple').textContent).toBe('server-apple');
  });

  it('auto-discovers server features when features is omitted', () => {
    autoFeaturesResult.googleClientId = 'server-goog';

    render(
      <CedrosLoginProvider config={{ serverUrl: 'http://localhost' }}>
        <ConfigReader />
      </CedrosLoginProvider>
    );

    expect(screen.getByTestId('google').textContent).toBe('server-goog');
    expect(screen.getByTestId('google-enabled').textContent).toBe('true');
  });

  it('renders immediately while default discovery is loading', () => {
    autoFeaturesResult.features = null;
    autoFeaturesResult.isLoading = true;

    render(
      <CedrosLoginProvider config={{ serverUrl: 'http://localhost' }}>
        <ConfigReader />
      </CedrosLoginProvider>
    );

    expect(screen.getByTestId('google').textContent).toBe('none');
  });

  it('explicit frontend config takes precedence over server values', () => {
    autoFeaturesResult.googleClientId = 'server-goog';
    autoFeaturesResult.appleClientId = 'server-apple';

    render(
      <CedrosLoginProvider
        config={{
          serverUrl: 'http://localhost',
          features: 'auto',
          googleClientId: 'explicit-goog',
          appleClientId: 'explicit-apple',
        }}
      >
        <ConfigReader />
      </CedrosLoginProvider>
    );

    expect(screen.getByTestId('google').textContent).toBe('explicit-goog');
    expect(screen.getByTestId('apple').textContent).toBe('explicit-apple');
  });

  it('does not merge server client IDs when features are pinned explicitly', () => {
    // Even if the mock returns values, explicit feature mode should pass config through as-is
    autoFeaturesResult.googleClientId = 'server-goog';
    autoFeaturesResult.appleClientId = 'server-apple';

    render(
      <CedrosLoginProvider
        config={{
          serverUrl: 'http://localhost',
          features: {
            email: true,
            google: true,
            apple: true,
            solana: false,
            webauthn: false,
            instantLink: false,
          },
        }}
      >
        <ConfigReader />
      </CedrosLoginProvider>
    );

    // Non-auto: config is used as-is, no merging
    expect(screen.getByTestId('google').textContent).toBe('none');
    expect(screen.getByTestId('apple').textContent).toBe('none');
  });

  it('reads feature flag env overrides when config does not set a value', () => {
    render(
      <CedrosLoginProvider
        config={{
          serverUrl: 'http://localhost',
          featureFlagEnv: { CEDROS_FEATURE_INSTANT_LINK: 'true' },
        }}
      >
        <ConfigReader />
      </CedrosLoginProvider>
    );

    expect(screen.getByTestId('instant-link').textContent).toBe('true');
  });

  it('lets explicit config override feature flag env values', () => {
    render(
      <CedrosLoginProvider
        config={{
          serverUrl: 'http://localhost',
          featureFlagEnv: { CEDROS_FEATURE_INSTANT_LINK: 'true' },
          features: { instantLink: false },
        }}
      >
        <ConfigReader />
      </CedrosLoginProvider>
    );

    expect(screen.getByTestId('instant-link').textContent).toBe('false');
  });
});
