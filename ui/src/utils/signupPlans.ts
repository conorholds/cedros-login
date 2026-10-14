import { ApiClient } from './apiClient';
import { safeReturnToPath } from './returnTo';

export type SignupBillingPeriod = 'monthly' | 'annual';
export interface SignupPlan {
  planId: string;
  displayName: string;
  description: string;
  priceCents: number;
  currency: string;
  interval: 'monthly' | 'yearly';
}

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function signupChooserRoute(value: unknown, currentUrl: string): string | null {
  if (typeof value !== 'string') return null;
  return safeReturnToPath(`${new URL(currentUrl).origin}/?returnTo=${encodeURIComponent(value)}`);
}

export function readSignupPlans(value: unknown, period: SignupBillingPeriod): SignupPlan[] {
  if (
    !record(value) ||
    value.enabled !== true ||
    value.configuredEnabled !== true ||
    !Array.isArray(value.plans)
  ) {
    throw new Error('Plans are temporarily unavailable. Please try again.');
  }
  const counts = new Map<string, number>();
  for (const plan of value.plans) {
    if (record(plan) && typeof plan.planId === 'string')
      counts.set(plan.planId, (counts.get(plan.planId) ?? 0) + 1);
  }
  return value.plans.filter(
    (plan): plan is SignupPlan =>
      record(plan) &&
      typeof plan.planId === 'string' &&
      /^[a-zA-Z0-9_-]+$/.test(plan.planId) &&
      counts.get(plan.planId) === 1 &&
      typeof plan.displayName === 'string' &&
      !!plan.displayName.trim() &&
      typeof plan.description === 'string' &&
      typeof plan.priceCents === 'number' &&
      Number.isSafeInteger(plan.priceCents) &&
      plan.priceCents > 0 &&
      typeof plan.currency === 'string' &&
      /^[a-z]{3}$/i.test(plan.currency) &&
      plan.interval === (period === 'annual' ? 'yearly' : 'monthly') &&
      typeof plan.priceId === 'string' &&
      !!plan.priceId &&
      plan.active === true &&
      plan.public === true &&
      plan.purchasable === true &&
      (plan.publicOnMainPricingPage === true || plan.publicOnDeveloperPage === true) &&
      Array.isArray(plan.paymentMethods) &&
      plan.paymentMethods.includes('stripe')
  );
}

export async function loadSignupPlans(serverUrl: string, currentUrl: string) {
  const login = new ApiClient({ baseUrl: serverUrl, retryAttempts: 0 });
  const features = await login.get<Record<string, unknown>>('/features', {
    credentials: 'omit',
    cacheTtlMs: 0,
  });
  if (features.subscriptionSelectionRequired !== true) return null;
  const route = signupChooserRoute(features.subscriptionSelectionRoute, currentUrl);
  if (!route) throw new Error('Plan selection is temporarily unavailable. Please try again.');
  const pay = new ApiClient({
    baseUrl: new URL('/extensions/cedros-pay', currentUrl).href,
    retryAttempts: 0,
  });
  const [monthly, annual] = await Promise.all(
    ['monthly', 'annual'].map(async (period) => {
      const response = await pay.get<unknown>(`/paywall/v1/subscription/plans?interval=${period}`, {
        credentials: 'omit',
        cacheTtlMs: 0,
      });
      return readSignupPlans(response, period === 'annual' ? 'annual' : 'monthly');
    })
  );
  if (!monthly.length && !annual.length)
    throw new Error('Plans are temporarily unavailable. Please try again.');
  return { route, monthly, annual };
}

/** Only retain a choice on the exact server-selected chooser, never bypass another gate. */
export function selectedPlanContinuation(route: string, currentUrl: string): string | null {
  const safeRoute = signupChooserRoute(route, currentUrl);
  const returnTo = safeReturnToPath(currentUrl);
  if (!safeRoute || !returnTo) return null;
  const base = new URL(currentUrl);
  const selected = new URL(returnTo, base);
  const chooser = new URL(safeRoute, base);
  if (
    selected.pathname !== chooser.pathname ||
    !selected.searchParams.get('plan') ||
    !['monthly', 'annual'].includes(selected.searchParams.get('billing') ?? '')
  )
    return null;
  // Preserve any server-owned chooser query restrictions.
  for (const [key, value] of chooser.searchParams) {
    if (selected.searchParams.get(key) !== value) return null;
  }
  return returnTo;
}

export function signupPlanReturnTo(
  route: string,
  plan: SignupPlan,
  period: SignupBillingPeriod,
  currentUrl: string
): string {
  const safeRoute = signupChooserRoute(route, currentUrl);
  if (!safeRoute) throw new Error('Invalid plan selection route.');
  const selected = new URL(safeRoute, currentUrl);
  const previous = safeReturnToPath(currentUrl);
  if (previous) {
    const prior = new URL(previous, currentUrl);
    const continuation =
      prior.pathname === selected.pathname ? safeReturnToPath(prior.href) : previous;
    if (continuation) selected.searchParams.set('returnTo', continuation);
  }
  selected.searchParams.set('view', 'signup');
  selected.searchParams.set('plan', plan.planId);
  selected.searchParams.set('billing', period);
  selected.hash = plan.planId;
  return `${selected.pathname}${selected.search}${selected.hash}`;
}
