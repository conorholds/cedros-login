import type { AuthResponse } from '../types';
import { selectedPlanContinuation } from '../utils/signupPlans';
import { safeReturnToPath } from '../utils/returnTo';

const DEFAULT_SUCCESS_REDIRECT_URL = '/profile';
const REDIRECT_PROP_KEYS = ['redirectUrl', 'successHref', 'continueHref'] as const;

export interface AuthSuccessRedirectLocation {
  href: string;
  assign: (url: string) => void;
}

/**
 * Resolves the browser target for public extension auth success.
 *
 * Priority: server post-login redirect, a single same-origin `returnTo` path,
 * host block redirect props, then the default account route. Only relative
 * routes and http(s) URLs are accepted for trusted server and host fallbacks.
 */
export function resolveAuthSuccessRedirectUrl(
  props: Record<string, unknown>,
  response?: Pick<AuthResponse, 'postLogin'>,
  currentUrl?: string
): string {
  const postLoginRedirect = safeAuthRedirectUrl(response?.postLogin?.redirectUrl);
  if (postLoginRedirect) {
    if (response?.postLogin?.action === 'choose_subscription' && currentUrl) {
      const selected = selectedPlanContinuation(postLoginRedirect, currentUrl);
      if (selected) return selected;
    }
    return postLoginRedirect;
  }

  const returnTo = safeReturnToPath(currentUrl);
  if (returnTo) return returnTo;

  for (const key of REDIRECT_PROP_KEYS) {
    const propRedirect = safeAuthRedirectUrl(props[key]);
    if (propRedirect) return propRedirect;
  }

  return DEFAULT_SUCCESS_REDIRECT_URL;
}

export function redirectAfterAuthSuccess(
  props: Record<string, unknown>,
  response: Pick<AuthResponse, 'postLogin'> | undefined,
  location: AuthSuccessRedirectLocation
): void {
  location.assign(resolveAuthSuccessRedirectUrl(props, response, location.href));
}

function safeAuthRedirectUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const url = value.trim();
  if (!url) return null;

  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}
