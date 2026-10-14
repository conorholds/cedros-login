import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SystemSetting } from '../../../types';
import { SubscriptionSelectionSettings } from './SubscriptionSelectionSettings';

describe('SubscriptionSelectionSettings', () => {
  it('renders the subscription selection card collapsed until enabled', () => {
    const onChange = vi.fn();

    render(
      <SubscriptionSelectionSettings
        byKey={subscriptionSettings()}
        edits={{}}
        onChange={onChange}
      />
    );

    expect(screen.queryByText('Subscription selection')).not.toBeInTheDocument();
    expect(screen.getByText('Require subscription selection')).toBeInTheDocument();
    expect(screen.queryByText('Plan chooser page')).not.toBeInTheDocument();
    expect(screen.queryByText('Cedros Pay location')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch', { name: 'Require subscription selection' }));

    expect(onChange).toHaveBeenCalledWith('subscription_selection_required', 'true');
  });

  it('only exposes the chooser page when enabled, even with saved Pay and seat settings', () => {
    const onChange = vi.fn();
    render(
      <SubscriptionSelectionSettings
        byKey={subscriptionSettings()}
        edits={{ subscription_selection_required: 'true' }}
        onChange={onChange}
      />
    );

    const subscriptionCard = screen
      .getByText('Require subscription selection')
      .closest('.cedros-auth-method-card');
    if (!subscriptionCard) throw new Error('subscription selection card missing');

    expect(
      within(subscriptionCard as HTMLElement).getByText('Plan chooser page')
    ).toBeInTheDocument();
    expect(screen.queryByText('Cedros Pay location')).not.toBeInTheDocument();
    expect(screen.queryByText('Team seats per plan')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);

    fireEvent.change(screen.getByPlaceholderText('pricing'), { target: { value: 'plans' } });
    expect(onChange).toHaveBeenCalledExactlyOnceWith('subscription_selection_route', '/plans');
  });

  it('does not render the subsection when the server does not return subscription settings', () => {
    render(<SubscriptionSelectionSettings byKey={{}} edits={{}} onChange={vi.fn()} />);

    expect(screen.queryByText('Subscription selection')).not.toBeInTheDocument();
    expect(screen.queryByText('Require subscription selection')).not.toBeInTheDocument();
  });

  it('does not render a card when only legacy Pay and seat settings are returned', () => {
    const { subscription_selection_pay_base_url, team_plan_seat_limits } = subscriptionSettings();
    const { container } = render(
      <SubscriptionSelectionSettings
        byKey={{ subscription_selection_pay_base_url, team_plan_seat_limits }}
        edits={{}}
        onChange={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows a blocked state instead of controls when Cedros Pay is missing', () => {
    render(
      <SubscriptionSelectionSettings
        byKey={subscriptionSettings()}
        edits={{}}
        onChange={vi.fn()}
        cedrosPayInstalled={false}
      />
    );

    expect(screen.queryByText('Subscription selection')).not.toBeInTheDocument();
    expect(screen.getByText('Subscription selection is blocked')).toBeInTheDocument();
    expect(
      screen.getByText('Install Cedros Pay before requiring users to choose a subscription plan.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Require subscription selection')).not.toBeInTheDocument();
    expect(screen.queryByText('Plan chooser page')).not.toBeInTheDocument();
  });
});

function subscriptionSettings(): Record<string, SystemSetting> {
  return {
    subscription_selection_required: setting('subscription_selection_required', 'false'),
    subscription_selection_route: setting('subscription_selection_route', '/subscribe'),
    subscription_selection_pay_base_url: setting(
      'subscription_selection_pay_base_url',
      'https://saved-pay.example.test/extensions/cedros-pay'
    ),
    team_plan_seat_limits: setting(
      'team_plan_seat_limits',
      '{"individual":1,"business":"unlimited"}'
    ),
  };
}

function setting(key: string, value: string): SystemSetting {
  return {
    key,
    value,
    description: null,
    isSecret: false,
    updatedAt: '2026-01-01T00:00:00.000Z',
    updatedBy: null,
  };
}
