import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { Invite } from '../../types';
import { InviteList } from './InviteList';

const invite: Invite = {
  id: 'invite-1',
  orgId: 'org-1',
  email: 'test@example.com',
  role: 'member',
  invitedBy: 'user-1',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
};

describe('InviteList', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows the next step in the empty state when invites can be managed', () => {
    render(<InviteList invites={[]} canManage />);

    expect(
      screen.getByText('No pending invites. Use the invite form to send one.')
    ).toBeInTheDocument();
  });

  it('keeps the read-only empty state concise when invites cannot be managed', () => {
    render(<InviteList invites={[]} />);

    expect(screen.getByText('No pending invites.')).toBeInTheDocument();
  });

  it('clears resend timer on unmount', async () => {
    vi.useFakeTimers();
    const onResend = vi.fn(async () => undefined);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = render(<InviteList invites={[invite]} canManage onResend={onResend} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /resend/i }));
    });

    unmount();
    vi.runAllTimers();

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('renders wallet invites when an email is not present', () => {
    render(
      <InviteList
        invites={[
          {
            ...invite,
            email: undefined,
            walletAddress: 'So11111111111111111111111111111111111111112',
          },
        ]}
      />
    );

    expect(screen.getByText('So11111111111111111111111111111111111111112')).toBeInTheDocument();
  });
});
