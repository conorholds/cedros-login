import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AccountEmail, AuthState } from '../types';

const authStateRef = vi.hoisted(() => ({ value: 'unauthenticated' as AuthState }));
const listEmailsMock = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const addEmailMock = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const resendEmailMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const removeEmailMock = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const setPrimaryEmailMock = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const verifyEmailMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const stableInternal = vi.hoisted(() => ({ getAccessToken: vi.fn() }));

vi.mock('../context/useCedrosLogin', () => ({
  useCedrosLogin: () => ({
    config: {
      serverUrl: 'http://localhost:3000',
      requestTimeout: 1000,
      retryAttempts: 2,
    },
    authState: authStateRef.value,
    _internal: stableInternal,
  }),
}));

vi.mock('../utils/accountEmailApi', () => ({
  AccountEmailApiClient: vi.fn().mockImplementation(function AccountEmailApiClientMock() {
    return {
      listEmails: listEmailsMock,
      addEmail: addEmailMock,
      resendEmail: resendEmailMock,
      removeEmail: removeEmailMock,
      setPrimaryEmail: setPrimaryEmailMock,
      verifyEmail: verifyEmailMock,
    };
  }),
}));

import { useAccountEmails } from './useAccountEmails';

const mockEmails: AccountEmail[] = [
  {
    id: 'email-1',
    email: 'primary@example.com',
    verified: true,
    primary: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'email-2',
    email: 'secondary@example.com',
    verified: true,
    primary: false,
    createdAt: '2026-01-02T00:00:00Z',
  },
];

describe('useAccountEmails', () => {
  beforeEach(() => {
    authStateRef.value = 'unauthenticated';
    listEmailsMock.mockReset().mockResolvedValue([]);
    addEmailMock.mockReset().mockResolvedValue([]);
    resendEmailMock.mockReset().mockResolvedValue(undefined);
    removeEmailMock.mockReset().mockResolvedValue([]);
    setPrimaryEmailMock.mockReset().mockResolvedValue([]);
    verifyEmailMock.mockReset().mockResolvedValue(undefined);
  });

  it('auto-fetches when authenticated', async () => {
    authStateRef.value = 'authenticated';
    listEmailsMock.mockResolvedValue(mockEmails);

    const { result } = renderHook(() => useAccountEmails());

    await waitFor(() => {
      expect(result.current.emails).toEqual(mockEmails);
    });
    expect(result.current.error).toBeNull();
  });

  it('does not fetch while unauthenticated', () => {
    renderHook(() => useAccountEmails());

    expect(listEmailsMock).not.toHaveBeenCalled();
  });

  it('updates emails from add response', async () => {
    authStateRef.value = 'authenticated';
    listEmailsMock.mockResolvedValue([mockEmails[0]]);
    addEmailMock.mockResolvedValue(mockEmails);

    const { result } = renderHook(() => useAccountEmails());

    await waitFor(() => {
      expect(result.current.emails).toEqual([mockEmails[0]]);
    });

    await act(async () => {
      await result.current.addEmail('secondary@example.com');
    });

    expect(addEmailMock).toHaveBeenCalledWith('secondary@example.com');
    expect(result.current.emails).toEqual(mockEmails);
  });

  it('refreshes after resend because the route has no list payload', async () => {
    authStateRef.value = 'authenticated';
    listEmailsMock.mockResolvedValueOnce([mockEmails[0]]).mockResolvedValueOnce(mockEmails);

    const { result } = renderHook(() => useAccountEmails());

    await waitFor(() => {
      expect(result.current.emails).toEqual([mockEmails[0]]);
    });

    await act(async () => {
      await result.current.resendEmail('email-2');
    });

    expect(resendEmailMock).toHaveBeenCalledWith('email-2');
    expect(listEmailsMock).toHaveBeenCalledTimes(2);
    expect(result.current.emails).toEqual(mockEmails);
  });

  it('sets error on mutation failure', async () => {
    authStateRef.value = 'authenticated';
    removeEmailMock.mockRejectedValue({ code: 'VALIDATION_ERROR', message: 'Cannot remove' });

    const { result } = renderHook(() => useAccountEmails());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(listEmailsMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await expect(result.current.removeEmail('email-1')).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    });

    expect(result.current.error).toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});
