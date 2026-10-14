import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PasskeyLoginButton } from './PasskeyLoginButton';

const webAuthnMocks = vi.hoisted(() => ({
  continueWithPasskey: vi.fn(),
}));

vi.mock('../../hooks/useWebAuthn', () => ({
  useWebAuthn: () => ({
    continueWithPasskey: webAuthnMocks.continueWithPasskey,
    isLoading: false,
    isSupported: true,
  }),
}));

describe('PasskeyLoginButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('surfaces the real message when the hook rejects with an AuthError object', async () => {
    // useWebAuthn rejects with a plain AuthError object ({ code, message }), not
    // an Error instance — the case that used to render "[object Object]".
    webAuthnMocks.continueWithPasskey.mockRejectedValue({
      code: 'INVALID_CREDENTIALS',
      message: 'This passkey is not recognized.',
    });
    const onError = vi.fn();

    render(<PasskeyLoginButton onError={onError} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(onError).toHaveBeenCalled());
    const error = onError.mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('This passkey is not recognized.');
    expect(error.message).not.toBe('[object Object]');
  });

  it('calls onSuccess when the passkey flow resolves', async () => {
    webAuthnMocks.continueWithPasskey.mockResolvedValue({ user: {}, tokens: {} });
    const onSuccess = vi.fn();
    const onError = vi.fn();

    render(<PasskeyLoginButton onSuccess={onSuccess} onError={onError} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(onError).not.toHaveBeenCalled();
  });
});
