import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CedrosLoginAdminRuntimeContext } from '../../../admin/CedrosLoginAdminRuntimeContext';
import type { SystemSetting } from '../../../types';
import { PasskeySettingsCard } from './PasskeySettingsCard';

const DEFAULT_ENDPOINT = {
  serverUrl: 'https://admin.example.com',
  path: '/admin/runtime/cedros-login/passkey-defaults',
};

describe('PasskeySettingsCard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('auto-applies host defaults when all passkey settings are empty', async () => {
    const onChange = vi.fn();
    stubDefaultsResponse({
      relyingPartyId: 'example.com',
      relyingPartyName: 'Example Site',
      allowedOrigins: ['https://example.com', 'https://example.com'],
      warnings: [],
    });

    renderCard({
      onChange,
      byKey: passkeySettings({
        enabled: 'true',
        rpId: '',
        rpName: '',
        rpOrigin: '',
      }),
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('auth_webauthn_rp_id', 'example.com');
      expect(onChange).toHaveBeenCalledWith('auth_webauthn_rp_name', 'Example Site');
      expect(onChange).toHaveBeenCalledWith('auth_webauthn_rp_origin', 'https://example.com');
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://admin.example.com/admin/runtime/cedros-login/passkey-defaults',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer admin-token' }),
      })
    );
    // Host-managed fields are hidden: no inputs and no relying-party labels.
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByText('Relying Party ID')).toBeNull();
  });

  it('hides host-managed relying-party values', () => {
    const onChange = vi.fn();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    renderCard({
      onChange,
      byKey: passkeySettings({
        enabled: 'true',
        rpId: 'example.com',
        rpName: 'Example Site',
        rpOrigin: 'https://example.com',
      }),
    });

    // Settings are complete, so no host fetch and no inputs. The auto-configured
    // relying-party values are hidden — only the on/off toggle is shown.
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByText('example.com')).toBeNull();
    expect(screen.queryByText('Example Site')).toBeNull();
    expect(screen.queryByText('https://example.com')).toBeNull();
    expect(screen.queryByText('Relying Party ID')).toBeNull();
    expect(screen.getByRole('switch', { name: 'Enable WebAuthn/Passkeys' })).toBeInTheDocument();
  });

  it('does not overwrite an existing RP ID when host defaults differ', async () => {
    const onChange = vi.fn();
    stubDefaultsResponse({
      relyingPartyId: 'new.example.com',
      relyingPartyName: 'New Site',
      allowedOrigins: ['https://new.example.com'],
      warnings: [],
    });

    renderCard({
      onChange,
      byKey: passkeySettings({
        enabled: 'true',
        rpId: 'existing.example.com',
        rpName: '',
        rpOrigin: '',
      }),
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('auth_webauthn_rp_name', 'New Site');
      expect(onChange).toHaveBeenCalledWith('auth_webauthn_rp_origin', 'https://new.example.com');
    });

    // The host-managed values and the RP-ID conflict notice are hidden, and the
    // existing RP ID is never auto-overwritten.
    expect(screen.queryByText(/Site settings suggest/)).toBeNull();
    expect(screen.queryByText('existing.example.com')).toBeNull();
    expect(onChange).not.toHaveBeenCalledWith('auth_webauthn_rp_id', expect.any(String));
  });

  it('blocks manual RP ID changes when a relying party ID is already saved', () => {
    const onChange = vi.fn();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    renderCard({
      onChange,
      withPasskeyDefaultsEndpoint: false,
      byKey: passkeySettings({
        enabled: 'true',
        rpId: 'existing.example.com',
        rpName: 'Existing Site',
        rpOrigin: 'https://existing.example.com',
      }),
    });

    fireEvent.change(screen.getByDisplayValue('existing.example.com'), {
      target: { value: 'new.example.com' },
    });

    expect(onChange).not.toHaveBeenCalledWith('auth_webauthn_rp_id', expect.any(String));
    expect(screen.getByText(/Relying Party ID changes are blocked/)).toBeInTheDocument();
  });

  it('keeps manual setup fields visible and blocks enablement without complete settings', () => {
    const onChange = vi.fn();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    renderCard({
      onChange,
      withPasskeyDefaultsEndpoint: false,
      byKey: passkeySettings({
        enabled: 'false',
        rpId: '',
        rpName: '',
        rpOrigin: '',
      }),
    });

    expect(screen.getByPlaceholderText('Relying Party ID')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'Enable WebAuthn/Passkeys' }));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalledWith('auth_webauthn_enabled', 'true');
    expect(
      screen.getByText('Complete passkey relying party settings before enabling passkeys.')
    ).toBeInTheDocument();
  });

  it('blocks enablement when normalized host defaults do not complete required settings', async () => {
    const onChange = vi.fn();
    stubDefaultsResponse({
      relyingPartyId: 'example.com',
      relyingPartyName: 'Example Site',
      allowedOrigins: ['https://example.com/path'],
      warnings: [],
    });

    renderCard({
      onChange,
      byKey: passkeySettings({
        enabled: 'false',
        rpId: '',
        rpName: '',
        rpOrigin: '',
      }),
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('auth_webauthn_rp_id', 'example.com');
      expect(onChange).toHaveBeenCalledWith('auth_webauthn_rp_name', 'Example Site');
    });

    fireEvent.click(screen.getByRole('switch', { name: 'Enable WebAuthn/Passkeys' }));

    expect(onChange).not.toHaveBeenCalledWith('auth_webauthn_enabled', 'true');
    expect(
      screen.getByText('Complete passkey relying party settings before enabling passkeys.')
    ).toBeInTheDocument();
  });
});

function renderCard({
  byKey,
  edits = {},
  onChange,
  withPasskeyDefaultsEndpoint = true,
}: {
  byKey: Record<string, SystemSetting>;
  edits?: Record<string, string>;
  onChange: (key: string, value: string) => void;
  withPasskeyDefaultsEndpoint?: boolean;
}) {
  return render(
    <CedrosLoginAdminRuntimeContext.Provider
      value={{
        authState: 'authenticated',
        config: { serverUrl: 'https://extension.example.com' },
        getAccessToken: () => 'admin-token',
        passkeyDefaultsEndpoint: withPasskeyDefaultsEndpoint ? DEFAULT_ENDPOINT : undefined,
        user: null,
      }}
    >
      <PasskeySettingsCard byKey={byKey} edits={edits} onChange={onChange} />
    </CedrosLoginAdminRuntimeContext.Provider>
  );
}

function stubDefaultsResponse(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(body), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        })
      )
    )
  );
}

function passkeySettings(values: {
  enabled: string;
  rpId: string;
  rpName: string;
  rpOrigin: string;
}): Record<string, SystemSetting> {
  return {
    auth_webauthn_enabled: setting('auth_webauthn_enabled', values.enabled),
    auth_webauthn_rp_id: setting('auth_webauthn_rp_id', values.rpId),
    auth_webauthn_rp_name: setting('auth_webauthn_rp_name', values.rpName),
    auth_webauthn_rp_origin: setting('auth_webauthn_rp_origin', values.rpOrigin),
  };
}

function setting(key: string, value: string): SystemSetting {
  return {
    description: null,
    isSecret: false,
    key,
    updatedAt: '2026-01-01T00:00:00Z',
    updatedBy: null,
    value,
  };
}
