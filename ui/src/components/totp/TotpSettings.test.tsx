import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AuthMethod } from '../../types';
import { TotpSettings } from './TotpSettings';

const useTotpMock = vi.hoisted(() => vi.fn());
const useCedrosLoginOptionalMock = vi.hoisted(() => vi.fn());

vi.mock('../../hooks/useTotp', () => {
  return {
    useTotp: () => useTotpMock(),
  };
});

vi.mock('../../context/useCedrosLogin', () => {
  return {
    useCedrosLoginOptional: () => useCedrosLoginOptionalMock(),
  };
});

function renderEnabledSettings(
  authMethods: AuthMethod[],
  disableMethods: Array<'password' | 'code' | 'recoveryCode'>
) {
  const disableTotp = vi.fn().mockResolvedValue(undefined);

  useCedrosLoginOptionalMock.mockReturnValue({
    user: {
      id: 'user-1',
      authMethods,
    },
  });
  useTotpMock.mockReturnValue({
    status: { enabled: true, recoveryCodesRemaining: 3, disableMethods },
    isLoading: false,
    error: null,
    getStatus: vi.fn().mockResolvedValue({ enabled: true, recoveryCodesRemaining: 3 }),
    disableTotp,
    regenerateBackupCodes: vi.fn(),
    clearError: vi.fn(),
  });

  render(<TotpSettings />);

  return { disableTotp };
}

function enterOtpCode(code: string) {
  for (const [index, digit] of Array.from(code).entries()) {
    fireEvent.change(screen.getByLabelText(`Digit ${index + 1}`), {
      target: { value: digit },
    });
  }
}

describe('TotpSettings', () => {
  beforeEach(() => {
    useTotpMock.mockReset();
    useCedrosLoginOptionalMock.mockReset();
  });

  it('requires an enrolled factor even for password-backed accounts', async () => {
    const user = userEvent.setup();
    const { disableTotp } = renderEnabledSettings(['email', 'google'], ['code', 'recoveryCode']);

    await user.click(screen.getByRole('button', { name: 'Disable 2FA' }));

    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'One-time password' })).toBeInTheDocument();
    enterOtpCode('123456');
    await user.click(screen.getByRole('button', { name: 'Disable 2FA' }));

    await waitFor(() => {
      expect(disableTotp).toHaveBeenCalledWith({ code: '123456' });
    });
  });

  it('starts passwordless accounts in authenticator code mode', async () => {
    const user = userEvent.setup();
    const { disableTotp } = renderEnabledSettings(['email'], ['code', 'recoveryCode']);

    await user.click(screen.getByRole('button', { name: 'Disable 2FA' }));

    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'One-time password' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use recovery code' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Use password' })).not.toBeInTheDocument();

    enterOtpCode('123456');
    await user.click(screen.getByRole('button', { name: 'Disable 2FA' }));

    await waitFor(() => {
      expect(disableTotp).toHaveBeenCalledWith({ code: '123456' });
    });
  });

  it('lets passwordless accounts disable with a recovery code', async () => {
    const user = userEvent.setup();
    const { disableTotp } = renderEnabledSettings(['webauthn'], ['code', 'recoveryCode']);

    await user.click(screen.getByRole('button', { name: 'Disable 2FA' }));
    await user.click(screen.getByRole('button', { name: 'Use recovery code' }));

    const recoveryCode = screen.getByLabelText('Recovery code');
    expect(recoveryCode).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Use authenticator code' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Use password' })).not.toBeInTheDocument();

    fireEvent.change(recoveryCode, { target: { value: 'abcd-1234' } });
    await user.click(screen.getByRole('button', { name: 'Disable 2FA' }));

    await waitFor(() => {
      expect(disableTotp).toHaveBeenCalledWith({ recoveryCode: 'abcd-1234' });
    });
  });
});

it('regenerates recovery codes with the completed autofill value', async () => {
  const user = userEvent.setup();
  renderEnabledSettings(['webauthn'], ['code']);
  const regenerate = useTotpMock.mock.results.at(-1)!.value.regenerateBackupCodes;
  regenerate.mockResolvedValue({ recoveryCodes: ['fixture-code'] });
  await user.click(screen.getByRole('button', { name: 'Regenerate recovery codes' }));
  fireEvent.change(screen.getByLabelText('Digit 1'), { target: { value: '123456' } });
  await waitFor(() => expect(regenerate).toHaveBeenCalledExactlyOnceWith('123456'));
});
