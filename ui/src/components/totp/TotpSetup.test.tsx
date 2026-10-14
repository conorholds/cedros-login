import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';

import { TotpSetup } from './TotpSetup';

const useTotpMock = vi.hoisted(() => vi.fn());

vi.mock('../../hooks/useTotp', () => {
  return {
    useTotp: () => useTotpMock(),
  };
});

vi.mock('./QrCode', () => {
  return {
    QrCode: () => null,
  };
});

describe('TotpSetup', () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
  });

  it('clears copy timer on unmount', async () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    useTotpMock.mockReturnValue({
      setupState: 'setup',
      setupData: {
        secret: 'ABC123',
        otpauthUri: 'otpauth://totp/test',
        recoveryCodes: ['code1'],
      },
      isLoading: false,
      error: null,
      beginSetup: vi.fn(),
      enableTotp: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    const { getByLabelText, unmount } = render(<TotpSetup />);

    await act(async () => {
      fireEvent.click(getByLabelText('Copy secret'));
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('inherits the theme success color for the completion icon', () => {
    useTotpMock.mockReturnValue({
      setupState: 'success',
      setupData: null,
      isLoading: false,
      error: null,
      beginSetup: vi.fn(),
      enableTotp: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    const { container } = render(<TotpSetup />);
    const successIcon = container.querySelector('.cedros-totp-success-icon');

    expect(successIcon).toBeTruthy();
    for (const element of successIcon!.querySelectorAll('circle, path')) {
      expect(element).toHaveAttribute('stroke', 'currentColor');
    }
  });
});

it('submits the newly completed setup code instead of the previous render value', async () => {
  const enableTotp = vi.fn().mockResolvedValue(undefined);
  useTotpMock.mockReturnValue({
    setupState: 'setup',
    setupData: { secret: 'fixture', otpauthUri: 'otpauth://totp/test', recoveryCodes: ['fixture'] },
    isLoading: false,
    error: null,
    beginSetup: vi.fn(),
    enableTotp,
    clearError: vi.fn(),
    reset: vi.fn(),
  });
  const { getByRole, findByRole, findByLabelText } = render(<TotpSetup />);
  fireEvent.click(getByRole('button', { name: 'Continue' }));
  fireEvent.click(await findByRole('checkbox'));
  fireEvent.click(getByRole('button', { name: 'Continue' }));
  const input = await findByLabelText('Digit 1');
  await act(async () => fireEvent.change(input, { target: { value: '123456' } }));
  expect(enableTotp).toHaveBeenCalledExactlyOnceWith('123456');
});
