import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminUser } from '../../types';

const users: AdminUser[] = [
  {
    id: 'user-1',
    email: 'ada@example.com',
    emailVerified: true,
    name: 'Ada Lovelace',
    authMethods: ['email'],
    isSystemAdmin: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'user-2',
    email: 'grace@example.com',
    emailVerified: true,
    name: 'Grace Hopper',
    authMethods: ['google'],
    isSystemAdmin: false,
    createdAt: '2026-01-03T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z',
  },
];

const mocked = vi.hoisted(() => ({
  adminUsersState: {
    users: [] as AdminUser[],
    total: 0,
    isLoading: false,
    error: null as Error | null,
    listUsers: vi.fn(async () => ({ users: [], total: 0, limit: 20, offset: 0 })),
    clearError: vi.fn(),
  },
}));

vi.mock('../../hooks/useAdminUsers', () => ({
  useAdminUsers: () => mocked.adminUsersState,
}));

import { AdminUserList } from './AdminUserList';

describe('AdminUserList accessibility', () => {
  beforeEach(() => {
    mocked.adminUsersState.users = users;
    mocked.adminUsersState.total = users.length;
    mocked.adminUsersState.isLoading = false;
    mocked.adminUsersState.error = null;
    mocked.adminUsersState.listUsers.mockClear();
    mocked.adminUsersState.clearError.mockClear();
  });

  it('exposes the visual user grid as a table with sortable column state', () => {
    render(<AdminUserList />);

    const table = screen.getByRole('table', { name: 'All users' });
    const headers = within(table).getAllByRole('columnheader');

    expect(headers).toHaveLength(3);
    expect(
      within(headers[1]).getByRole('button', { name: 'Sort by registered date' })
    ).toBeInTheDocument();
    expect(headers[1]).toHaveAttribute('aria-sort', 'descending');
    expect(within(table).getByRole('cell', { name: /ada lovelace/i })).toBeInTheDocument();
  });

  it('updates aria-sort when a sortable header is activated', async () => {
    const user = userEvent.setup();
    render(<AdminUserList />);

    await user.click(screen.getByRole('button', { name: 'Sort by user' }));

    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveAttribute('aria-sort', 'descending');
    expect(headers[1]).toHaveAttribute('aria-sort', 'none');
  });

  it('uses locale-aware collation for user sorting', async () => {
    const RealCollator = Intl.Collator;
    function CollatorMock(locales?: Intl.LocalesArgument, options?: Intl.CollatorOptions) {
      return new RealCollator(locales, options);
    }
    const collatorSpy = vi
      .spyOn(Intl, 'Collator')
      .mockImplementation(CollatorMock as typeof Intl.Collator);
    const user = userEvent.setup();
    render(<AdminUserList />);

    await user.click(screen.getByRole('button', { name: 'Sort by user' }));

    expect(collatorSpy).toHaveBeenCalledWith('en', {
      sensitivity: 'base',
      numeric: true,
    });
    collatorSpy.mockRestore();
  });

  it('keeps clickable user rows keyboard-operable', async () => {
    const user = userEvent.setup();
    const onUserClick = vi.fn();
    render(<AdminUserList onUserClick={onUserClick} />);

    const row = screen.getByRole('row', { name: 'Open user Ada Lovelace' });
    row.focus();
    await user.keyboard('{Enter}');

    expect(onUserClick).toHaveBeenCalledWith(users[0]);
  });
});
