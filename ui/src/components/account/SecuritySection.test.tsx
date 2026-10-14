import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
const fetchSessions = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock('../../context/useCedrosLogin', () => ({
  useAuthState: () => ({ user: { id: 'user' }, config: { serverUrl: 'http://sessions.test' } }),
}));
vi.mock('../../hooks/useSessions', () => ({
  useSessions: () => ({
    sessions: [],
    isLoading: false,
    error: null,
    fetchSessions,
    revokeAllSessions: vi.fn(),
  }),
}));
vi.mock('./PasswordCard', () => ({
  PasswordCard: ({ onPasswordChange }: { onPasswordChange: () => void }) => (
    <button onClick={onPasswordChange}>Complete password change</button>
  ),
}));
vi.mock('../totp', () => ({ TotpSettings: () => null }));
import { SecuritySection } from './SecuritySection';

it('refreshes sessions after a password change and preserves the consumer callback', async () => {
  const onPasswordChange = vi.fn();
  render(<SecuritySection onPasswordChange={onPasswordChange} />);
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Complete password change' }));
  });
  expect(fetchSessions).toHaveBeenCalledTimes(1);
  expect(onPasswordChange).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Refresh sessions' })).toBeInTheDocument();
});
