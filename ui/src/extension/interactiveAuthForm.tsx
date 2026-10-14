import { CedrosLoginProvider } from '../context/CedrosLoginProvider';
import { authFormModeProp, authFormSectionClassName } from './authFormBlockRenderer';
import { redirectAfterAuthSuccess } from './authSuccessRedirect';
import { PublicAuthActions } from './publicAuthActions';
import { resolveExtensionPublicAuthProviderConfig } from './runtimeProviderConfig';
import { CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE } from './visualBuilderIds';
import type { AuthResponse } from '../types';

/**
 * Client-only auth workflow mounted into the hydrated auth-form block.
 *
 * Wraps the package's wired non-wallet login form in a
 * {@link CedrosLoginProvider} pointed at the host allowlisted public auth
 * runtime (`/extensions/cedros-login/public-auth`). The ZIP-hosted public chunk
 * intentionally excludes the Solana wallet-adapter UI because its portal stack
 * imports `react-dom`, which the Cedros public loader does not shim. Standalone
 * package consumers retain the full wallet-enabled `LoginForm`.
 *
 * Provider config: only `serverUrl` is supplied, so the provider auto-discovers
 * enabled methods, OAuth client IDs, and social-button order from
 * `GET {serverUrl}/features` at mount (the same discovery the standalone package
 * uses, via public-auth aliases). The host may override the base only via trusted
 * renderer context, not authored block props.
 */
export default function InteractiveAuthForm({
  props,
  runtimeBaseUrl,
  colorMode,
}: {
  props: Record<string, unknown>;
  runtimeBaseUrl?: string;
  colorMode?: 'light' | 'dark';
}) {
  const mode = authFormModeProp(props.mode);
  const layout = authFormLayoutProp(props.layout);
  const config = resolveExtensionPublicAuthProviderConfig(props, runtimeBaseUrl, colorMode);
  const handleSuccess = (response?: Pick<AuthResponse, 'postLogin'>) => {
    if (typeof window === 'undefined') return;
    redirectAfterAuthSuccess(props, response, window.location);
  };

  return (
    <CedrosLoginProvider config={config}>
      <section
        className={authFormSectionClassName(layout, colorMode)}
        data-auth-mode={mode}
        data-cedros-block={CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE}
      >
        <div className="cedros-auth-form__panel">
          <PublicAuthActions mode={mode} onAuthSuccess={handleSuccess} />
        </div>
      </section>
    </CedrosLoginProvider>
  );
}

function authFormLayoutProp(value: unknown): 'card' | 'inline' | 'compact' {
  return value === 'inline' || value === 'compact' ? value : 'card';
}
