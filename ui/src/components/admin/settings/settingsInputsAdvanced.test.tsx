import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReadonlySecretInput } from './settingsInputsAdvanced';

vi.mock('../../../hooks/useCedrosLoginAdminClientContext', () => ({
  useCedrosLoginAdminClientContext: () => ({
    config: {
      serverUrl: 'http://localhost:3000',
      requestTimeout: 25,
    },
    _internal: {
      getAccessToken: () => 'admin-token',
    },
  }),
}));

describe('ReadonlySecretInput regeneration', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('regenerates a secret with auth headers and reveals the returned value', async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options?: RequestInit) => {
        expect(_url).toBe('http://localhost:3000/auth/admin/settings/regenerate/sidecar_api_key');
        expect(options?.method).toBe('POST');
        expect((options?.headers as Record<string, string>).Authorization).toBe(
          'Bearer admin-token'
        );
        expect(options?.credentials).toBe('include');
        signal = options?.signal ?? undefined;
        return new Response(JSON.stringify({ key: 'sidecar_api_key', value: 'new-secret-value' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      })
    );

    render(<ReadonlySecretInput settingKey="sidecar_api_key" value="old-secret" />);

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(await screen.findByText('new-secret-value')).toBeInTheDocument();
    expect(signal).toBeInstanceOf(AbortSignal);
  });

  it('shows a timeout error when regeneration is aborted', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, options?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      })
    );

    render(<ReadonlySecretInput settingKey="sidecar_api_key" value="old-secret" />);

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(25);
    });
    vi.useRealTimers();

    await waitFor(() => {
      expect(
        screen.getByText('Regenerate timed out. Check your connection and try again.')
      ).toBeInTheDocument();
    });
  });
});
