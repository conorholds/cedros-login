import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../../i18n';
import { SignupPlanStep } from './SignupPlanStep';
import { loadSignupPlans } from '../../utils/signupPlans';

vi.mock('../../utils/signupPlans', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../utils/signupPlans')>()),
  loadSignupPlans: vi.fn(),
}));
const plan = {
  planId: 'agency',
  displayName: 'Agency',
  description: 'Five websites',
  priceCents: 15900,
  currency: 'USD',
  interval: 'monthly' as const,
};
const data = {
  route: '/pricing',
  monthly: [plan],
  annual: [{ ...plan, interval: 'yearly' as const, priceCents: 190800 }],
};
const load = vi.mocked(loadSignupPlans);
function form(enabled = true, locked = false) {
  return (
    <SignupPlanStep
      enabled={enabled}
      locked={locked}
      serverUrl="/extensions/cedros-login/public-auth"
      onSignIn={vi.fn()}
    >
      <form aria-label="Registration">
        <input aria-label="Name" />
      </form>
    </SignupPlanStep>
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, '', '/register');
});

describe('SignupPlanStep', () => {
  it('selects a live plan before mounting registration and preserves it in the URL', async () => {
    load.mockResolvedValue(data);
    render(form());
    expect(screen.queryByRole('form')).toBeNull();
    fireEvent.click(await screen.findByRole('button', { name: /Choose Agency/ }));
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(new URLSearchParams(window.location.search).get('returnTo')).toBe(
      '/pricing?view=signup&plan=agency&billing=monthly#agency'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Change plan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Annual' }));
    fireEvent.click(screen.getByRole('button', { name: /Choose Agency/ }));
    expect(screen.getByRole('status').textContent).toContain('$1,908.00 billed annually');
  });
  it('keeps ordinary login and sites without required subscriptions unchanged', async () => {
    const view = render(form(false));
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(load).not.toHaveBeenCalled();
    load.mockResolvedValue(null);
    view.rerender(form());
    await screen.findByRole('form');
    expect(screen.queryByText('Choose your plan')).toBeNull();
  });
  it('blocks registration on a catalog failure and supports retry', async () => {
    load.mockRejectedValueOnce(new Error('unavailable')).mockResolvedValue(data);
    render(form());
    await screen.findByRole('alert');
    expect(screen.queryByRole('form')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByRole('button', { name: /Choose Agency/ });
  });
  it('validates a preselected plan against the current catalog', async () => {
    window.history.replaceState(
      {},
      '',
      '/register?returnTo=' + encodeURIComponent('/pricing?plan=removed&billing=monthly')
    );
    load.mockResolvedValue(data);
    render(form());
    await screen.findByText('Choose your plan');
    expect(screen.queryByRole('form')).toBeNull();
  });
  it('preserves entered details and moves focus when changing the plan', async () => {
    load.mockResolvedValue(data);
    render(form());
    fireEvent.click(await screen.findByRole('button', { name: /Choose Agency/ }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Owner' } });
    expect(screen.getByRole('status')).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Change plan' }));
    expect(screen.getByRole('heading', { name: 'Choose your plan' })).toHaveFocus();
    expect(screen.queryByRole('form')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Annual' }));
    fireEvent.click(screen.getByRole('button', { name: /Choose Agency/ }));
    expect(screen.getByLabelText('Name')).toHaveValue('Owner');
  });
  it('locks plan changes while registration or verification is pending', async () => {
    load.mockResolvedValue(data);
    const view = render(form());
    fireEvent.click(await screen.findByRole('button', { name: /Choose Agency/ }));
    view.rerender(form(true, true));
    expect(screen.queryByRole('button', { name: 'Change plan' })).toBeNull();
    expect(screen.getByRole('form')).toBeVisible();
    view.rerender(form(true, false));
    expect(screen.getByRole('button', { name: 'Change plan' })).toBeVisible();
  });
  it('normalizes a valid pricing preselection into the signup confirmation view', async () => {
    window.history.replaceState(
      {},
      '',
      '/register?returnTo=' + encodeURIComponent('/pricing?plan=agency&billing=annual')
    );
    load.mockResolvedValue(data);
    render(form());
    await screen.findByRole('form');
    const returnTo = new URLSearchParams(window.location.search).get('returnTo');
    expect(returnTo).toBe('/pricing?view=signup&plan=agency&billing=annual#agency');
  });
  it('starts on an available billing period and honors locale and translation overrides', async () => {
    load.mockResolvedValue({ ...data, monthly: [] });
    render(
      <I18nProvider
        locale="de-DE"
        translations={{ signupPlans: { chooseTitle: 'Tarif wählen', annual: 'Jährlich' } }}
      >
        {form()}
      </I18nProvider>
    );
    await screen.findByRole('heading', { name: 'Tarif wählen' });
    expect(screen.getByRole('button', { name: 'Jährlich' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: /Choose Agency/ }).textContent).toContain('1.908,00');
  });
});
