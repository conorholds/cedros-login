import { describe, expect, it } from 'vitest';
import {
  readSignupPlans,
  selectedPlanContinuation,
  signupPlanReturnTo,
  signupChooserRoute,
} from './signupPlans';

const plan = {
  planId: 'agency',
  displayName: 'Agency',
  description: 'Five websites',
  priceCents: 15900,
  currency: 'USD',
  interval: 'monthly' as const,
  priceId: 'price-agency',
  active: true,
  public: true,
  purchasable: true,
  publicOnMainPricingPage: true,
  paymentMethods: ['stripe'],
};
const catalog = (plans: unknown[]) => ({ enabled: true, configuredEnabled: true, plans });

describe('signup plan selection', () => {
  it('uses live public purchasable prices and rejects duplicates, inactive and malformed plans', () => {
    expect(readSignupPlans(catalog([plan]), 'monthly')).toEqual([plan]);
    for (const plans of [
      [plan, plan],
      [{ ...plan, active: false }],
      [{ ...plan, public: false }],
      [{ ...plan, priceCents: -1 }],
      [{ ...plan, paymentMethods: ['solana'] }],
      [{ ...plan, interval: 'yearly' }],
    ]) {
      expect(readSignupPlans(catalog(plans), 'monthly')).toEqual([]);
    }
    expect(() => readSignupPlans({ enabled: false }, 'monthly')).toThrow();
  });

  it('carries plan, billing and the original destination through verification links', () => {
    const current = 'https://site.example/register?returnTo=%2Fportal%2Fcreate-site';
    const selected = signupPlanReturnTo('/pricing', plan, 'monthly', current);
    expect(selected).toBe(
      '/pricing?returnTo=%2Fportal%2Fcreate-site&view=signup&plan=agency&billing=monthly#agency'
    );
    const verification = `https://site.example/verify-email?returnTo=${encodeURIComponent(selected)}`;
    expect(selectedPlanContinuation('/pricing', verification)).toBe(selected);
    expect(signupPlanReturnTo('/pricing', plan, 'annual', verification)).toBe(
      '/pricing?returnTo=%2Fportal%2Fcreate-site&view=signup&plan=agency&billing=annual#agency'
    );
  });

  it('rejects unsafe routes and never bypasses another server gate or query restriction', () => {
    for (const path of ['https://evil.test/', '//evil.test/', '/\\evil.test/', 'relative']) {
      expect(signupChooserRoute(path, 'https://site.example/register')).toBeNull();
    }
    const current =
      'https://site.example/verify-email?returnTo=' +
      encodeURIComponent('/pricing?plan=agency&billing=monthly');
    expect(selectedPlanContinuation('/mfa', current)).toBeNull();
    expect(selectedPlanContinuation('/pricing?required=true', current)).toBeNull();
    expect(selectedPlanContinuation('/pricing', current + '&returnTo=%2Fpricing')).toBeNull();
  });
});
