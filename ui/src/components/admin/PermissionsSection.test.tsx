import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionsSection } from './PermissionsSection';
import { useDashboardPermissions } from '../../hooks/useDashboardPermissions';
import {
  DEFAULT_DASHBOARD_PERMISSIONS,
  type DashboardPermissions,
} from '../../types/dashboardPermissions';

vi.mock('../../hooks/useDashboardPermissions', () => ({
  useDashboardPermissions: vi.fn(),
}));

const updatePermissions = vi.fn();

describe('PermissionsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updatePermissions.mockResolvedValue(undefined);
    vi.mocked(useDashboardPermissions).mockReturnValue({
      permissions: clonePermissions(DEFAULT_DASHBOARD_PERMISSIONS),
      canAccess: vi.fn(),
      updatePermissions,
      isLoading: false,
      isUpdating: false,
      error: null,
      fetchPermissions: vi.fn(),
    });
  });

  it('keeps permission edits local until save is clicked', async () => {
    const user = userEvent.setup();

    render(<PermissionsSection userRole="owner" />);

    await user.click(screen.getByRole('switch', { name: 'Member access to Users' }));

    expect(updatePermissions).not.toHaveBeenCalled();
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(updatePermissions).toHaveBeenCalledWith({
      ...DEFAULT_DASHBOARD_PERMISSIONS,
      member: {
        ...DEFAULT_DASHBOARD_PERMISSIONS.member,
        users: true,
      },
    });
    await waitFor(() => expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument());
  });

  it('resets permission drafts without saving', async () => {
    const user = userEvent.setup();

    render(<PermissionsSection userRole="owner" />);

    await user.click(screen.getByRole('switch', { name: 'Member access to Users' }));
    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(updatePermissions).not.toHaveBeenCalled();
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Member access to Users' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });
});

function clonePermissions(permissions: DashboardPermissions): DashboardPermissions {
  return {
    admin: { ...permissions.admin },
    member: { ...permissions.member },
  };
}
