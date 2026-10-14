import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CEDROS_LOGIN_DASHBOARD_CARD_ID } from '../../extension/manifest';
import { LoginHealthDashboardCard } from './LoginHealthDashboardCard';
import type { CedrosDashboardCardContributionProps } from '../../extension/contracts';

function props(
  overrides: Partial<CedrosDashboardCardContributionProps> = {}
): CedrosDashboardCardContributionProps {
  return {
    hostContext: {},
    pluginContext: {
      serverUrl: 'https://auth.example.com',
      getAccessToken: () => null,
      hasPermission: (permission) => ['manage_users', 'manage_settings'].includes(permission),
    },
    extensionId: 'cedros-login',
    refreshInterval: 30000,
    isLoading: false,
    analyticsSnapshot: null,
    ...overrides,
  };
}

describe('LoginHealthDashboardCard', () => {
  it('renders a loading state', () => {
    render(<LoginHealthDashboardCard {...props({ isLoading: true })} />);

    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByText('Checking account growth…')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'User growth' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Cedros Login health' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
  });

  it('fails closed when admin permissions are missing', () => {
    render(
      <LoginHealthDashboardCard
        {...props({
          pluginContext: {
            serverUrl: 'https://auth.example.com',
            getAccessToken: () => null,
            hasPermission: () => false,
          },
        })}
      />
    );

    expect(screen.getByText('Permission needed')).toBeInTheDocument();
    expect(screen.getByText(/available to admins/)).toBeInTheDocument();
  });

  it('renders a redacted analytics error state', () => {
    render(<LoginHealthDashboardCard {...props({ analyticsError: 'raw backend details' })} />);

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/account analytics are unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText('raw backend details')).not.toBeInTheDocument();
  });

  it('renders an empty analytics state without disabling the card', () => {
    render(<LoginHealthDashboardCard {...props()} />);

    expect(screen.getByText('Awaiting data')).toBeInTheDocument();
    expect(screen.getByText(/No account analytics snapshot/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review accounts' })).toBeDisabled();
  });

  it('renders user growth metrics and routes through the host navigation helper', async () => {
    const navigateToAdminSection = vi.fn();
    render(
      <LoginHealthDashboardCard
        {...props({
          hostContext: { custom: { navigateToAdminSection } },
          analyticsSnapshot: {
            users: { total: 128, new7d: 14, new30d: 45, verified: 100 },
            logins: { active7d: 73 },
            invites: { accepted: 18, sent: 24 },
            providerMix: { email: 90, google: 30, passkey: 8 },
          },
        })}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Review accounts' }));

    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText(/User growth analytics are connected/i)).toBeInTheDocument();
    expect(screen.getByText('Total accounts')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('New 7d')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('Invite acceptance')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Email 90, Google 30')).toBeInTheDocument();
    expect(navigateToAdminSection).toHaveBeenCalledWith({
      moduleId: 'cedros-login:admin',
      sectionId: 'cedros-login:users',
    });
    expect(CEDROS_LOGIN_DASHBOARD_CARD_ID).toBe('cedros-login:identity-health-card');
  });

  it('does not render raw malformed analytics snapshots', () => {
    render(
      <LoginHealthDashboardCard
        {...props({
          analyticsSnapshot: { raw: '<script>alert(1)</script>', totals: { authenticated: -2 } },
        })}
      />
    );

    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText(/User growth analytics are connected/i)).toBeInTheDocument();
    expect(screen.queryByText(/script/)).not.toBeInTheDocument();
  });
});
