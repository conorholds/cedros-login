import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./AuthenticationSettings', () => ({
  default: () => <div data-testid="auth-tab-content">Auth content</div>,
}));

import LoginAdminSection from './LoginAdminSection';
import type { AdminSectionProps } from '../types';

interface PermissionMap {
  [permission: string]: boolean;
}

function makeProps(
  permissions: PermissionMap,
  overrides: Partial<AdminSectionProps> = {}
): AdminSectionProps {
  return {
    pluginContext: {
      serverUrl: 'https://auth.example.com',
      getAccessToken: () => 'token-1',
      hasPermission: (permission: string) => permissions[permission] === true,
      userId: 'user-1',
    },
    pageSize: 20,
    refreshInterval: 30000,
    ...overrides,
  };
}

const SETTINGS_PERMISSION: PermissionMap = { 'login:settings:read': true };

describe('LoginAdminSection', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('renders the auth settings directly, with no outer tab chrome', async () => {
    render(<LoginAdminSection {...makeProps(SETTINGS_PERMISSION)} />);

    // Auth-only section: no outer tablist — the auth settings render directly.
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('auth-tab-content')).toBeInTheDocument());
    expect(screen.queryByText('Service integrations')).not.toBeInTheDocument();
  });

  it('shows an empty state when the operator lacks the auth settings permission', () => {
    render(<LoginAdminSection {...makeProps({})} />);

    expect(
      screen.getByText("You don't have access to Login settings. Ask an owner for access.")
    ).toBeInTheDocument();
    expect(screen.queryByTestId('auth-tab-content')).not.toBeInTheDocument();
  });

  it('hides the auth settings when the host denies its admin page access', () => {
    render(
      <LoginAdminSection
        {...makeProps(SETTINGS_PERMISSION, {
          adminPageAccess: {
            canAccess: (sectionId: string) => sectionId !== 'cedros-login:account-settings',
          },
        })}
      />
    );

    expect(
      screen.getByText("You don't have access to Login settings. Ask an owner for access.")
    ).toBeInTheDocument();
    expect(screen.queryByTestId('auth-tab-content')).not.toBeInTheDocument();
  });
});
