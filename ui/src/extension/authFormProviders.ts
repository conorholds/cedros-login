import type { RuntimeAuthProvider } from './authRuntimeFeatures';

export type AuthProviderButton = Exclude<RuntimeAuthProvider, 'email' | 'instant-link'>;

const PROVIDER_BUTTON_ORDER: AuthProviderButton[] = ['solana', 'passkey', 'google', 'apple'];
const CLIENT_CONDITIONAL_PROVIDER_BUTTONS = new Set<AuthProviderButton>(['apple', 'solana']);

export function authProviderButtons(
  providers: RuntimeAuthProvider[],
  socialButtonOrder?: string[],
  suppressClientConditionalProviderButtons = false
): AuthProviderButton[] {
  const visibleProviders = providers.filter(
    (provider) => provider !== 'email' && provider !== 'instant-link'
  ) as AuthProviderButton[];
  const clientStableProviders = suppressClientConditionalProviderButtons
    ? visibleProviders.filter((provider) => !CLIENT_CONDITIONAL_PROVIDER_BUTTONS.has(provider))
    : visibleProviders;
  const order = resolveButtonOrder(socialButtonOrder);
  return clientStableProviders.sort((left, right) => {
    const leftIndex = providerButtonIndex(left, order);
    const rightIndex = providerButtonIndex(right, order);
    return leftIndex === rightIndex
      ? clientStableProviders.indexOf(left) - clientStableProviders.indexOf(right)
      : leftIndex - rightIndex;
  });
}

/**
 * Resolves the social-button display order. The operator order (admin "Social
 * button order" -> `socialButtonOrder` prop) uses `webauthn` for the passkey
 * button, so map it to this block's `passkey` id. Falls back to the default
 * order when unset, empty, or fully unrecognized.
 */
function resolveButtonOrder(socialButtonOrder?: string[]): AuthProviderButton[] {
  if (!Array.isArray(socialButtonOrder)) return PROVIDER_BUTTON_ORDER;
  const mapped = socialButtonOrder
    .map((id) => (id === 'webauthn' ? 'passkey' : id))
    .filter((id): id is AuthProviderButton =>
      PROVIDER_BUTTON_ORDER.includes(id as AuthProviderButton)
    );
  return mapped.length ? mapped : PROVIDER_BUTTON_ORDER;
}

function providerButtonIndex(provider: AuthProviderButton, order: AuthProviderButton[]): number {
  const index = order.indexOf(provider);
  return index === -1 ? order.length : index;
}
