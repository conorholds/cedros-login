import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminUserDetail } from './index';

const api = vi.hoisted(() => ({
  getUser: vi.fn(),
  deleteUser: vi.fn(),
  forcePasswordReset: vi.fn(),
  clearError: vi.fn(),
  isLoading: false,
}));
vi.mock('../../../hooks/useAdminUsers', () => ({ useAdminUsers: () => api }));
const user = (id: string) => ({
  id,
  email: `${id}@example.test`,
  name: id,
  authMethods: ['email'],
  createdAt: '2026-01-01',
  isSystemAdmin: false,
  emailVerified: true,
});
beforeEach(() => {
  vi.clearAllMocks();
  api.getUser.mockImplementation(async (id: string) => user(id));
});

describe('admin identity actions', () => {
  it('shows a failed deletion and permits retry without navigating away', async () => {
    const browser = userEvent.setup();
    const onBack = vi.fn();
    api.deleteUser
      .mockRejectedValueOnce(new Error('Server unavailable'))
      .mockResolvedValueOnce(undefined);
    render(<AdminUserDetail userId="Alice" onBack={onBack} />);
    await screen.findByText('Alice@example.test');
    for (let attempt = 0; attempt < 2; attempt++) {
      await browser.click(screen.getByRole('button', { name: 'Delete' }));
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveAccessibleName(/Alice/);
      expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus();
      await browser.click(within(dialog).getByRole('button', { name: 'Delete' }));
      if (attempt === 0) {
        expect(await screen.findByRole('alert')).toHaveTextContent('Server unavailable');
        expect(onBack).not.toHaveBeenCalled();
      }
    }
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('announces password-reset success inline', async () => {
    api.forcePasswordReset.mockResolvedValue(undefined);
    const browser = userEvent.setup();
    render(<AdminUserDetail userId="Alice" onBack={() => {}} />);
    await browser.click(await screen.findByRole('button', { name: /reset password/i }));
    await browser.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Confirm' })
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Password reset email sent');
  });

  it('never shows an old user response after navigating to a different user', async () => {
    let finishAlice!: (value: ReturnType<typeof user>) => void;
    api.getUser.mockImplementation((id: string) =>
      id === 'Alice'
        ? new Promise((resolve) => {
            finishAlice = resolve;
          })
        : Promise.resolve(user(id))
    );
    const { rerender } = render(<AdminUserDetail userId="Alice" onBack={() => {}} />);
    rerender(<AdminUserDetail userId="Bob" onBack={() => {}} />);
    await screen.findByText('Bob@example.test');
    await act(async () => finishAlice(user('Alice')));
    expect(screen.queryByText('Alice@example.test')).not.toBeInTheDocument();
    expect(screen.getByText('Bob@example.test')).toBeInTheDocument();
  });
});
