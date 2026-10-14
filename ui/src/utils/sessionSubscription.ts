import type { PostLoginAction } from '../types';
import { ApiClient, type ApiClientConfig } from './apiClient';
import { signupChooserRoute } from './signupPlans';

/** Login checks Pay server-side so HttpOnly sessions never need to expose a token. */
export async function sessionSubscriptionAction(
  config: ApiClientConfig,
  currentUrl: string
): Promise<PostLoginAction | null> {
  const login = new ApiClient({ ...config, retryAttempts: 0 });
  const result = await login.get<{
    authenticated?: boolean;
    signupResume?: { postLogin?: { action?: string; redirectUrl?: string } | null };
  }>('/user?resumeSignup=true', { cacheTtlMs: 0 });
  if (result.authenticated !== true || !result.signupResume) {
    throw new Error('Unable to check account setup. Please try again.');
  }
  const action = result.signupResume.postLogin;
  if (action === null) return null;
  const route = signupChooserRoute(action?.redirectUrl, currentUrl);
  if (action?.action !== 'choose_subscription' || !route) {
    throw new Error('Plan selection is temporarily unavailable. Please try again.');
  }
  return { action: 'choose_subscription', redirectUrl: route };
}
