import runtimeStyles from '../styles/login.css?inline';
import authBlockStyles from './auth-blocks.css?inline';
import { AccountSettings } from '../components/account';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import {
  CedrosLoginProvider,
  type CedrosLoginProviderConfig,
} from '../context/CedrosLoginProvider';
import { useAuth } from '../hooks/useAuth';
import { useTranslations } from '../i18n';
import { resolveExtensionAccountProviderConfig } from './runtimeProviderConfig';
import { CEDROS_LOGIN_WEB_STYLE_ELEMENT_ID, ensureCedrosLoginRuntimeStyles } from './runtimeStyles';
import { CEDROS_LOGIN_ACCOUNT_WORKSPACE_BLOCK_TYPE } from './visualBuilderIds';
import {
  accountWorkspaceSectionClassName,
  normalizeAccountWorkspaceProps,
  sanitizeAuthPageLinkHref,
} from './visualBuilderRenderers';

const CEDROS_LOGIN_ACCOUNT_LOGOUT_EVENT = 'cedros-login:logout';

// This is the lazy chunk that renders the real account settings. Those rely on
// the `.cedros-account*` rules in login.css, which are only in the DOM if some
// entry injected them. The host may render this block without executing
// web/register's module side-effect on the client, so inject the runtime
// stylesheet here too. Guarded and under the shared web id, it is a no-op when
// web/register already ran (and a no-op during SSR — there is no document).
// Same order as web/register: auth-blocks parity rules first, login.css second
// so login.css wins equal-specificity ties once hydrated.
ensureCedrosLoginRuntimeStyles(
  `${authBlockStyles}\n${runtimeStyles}`,
  CEDROS_LOGIN_WEB_STYLE_ELEMENT_ID
);

export default function InteractiveAccountWorkspace({
  props,
  runtimeBaseUrl,
  colorMode,
}: {
  props: Record<string, unknown>;
  runtimeBaseUrl?: string;
  colorMode?: 'light' | 'dark';
}) {
  const config = withAccountLogoutNotification(
    resolveExtensionAccountProviderConfig(props, runtimeBaseUrl, colorMode)
  );
  return (
    <CedrosLoginProvider config={config}>
      <AccountWorkspaceContent props={props} colorMode={colorMode} />
    </CedrosLoginProvider>
  );
}

function withAccountLogoutNotification(
  config: CedrosLoginProviderConfig
): CedrosLoginProviderConfig {
  const previousOnLogout = config.callbacks?.onLogout;

  return {
    ...config,
    callbacks: {
      ...config.callbacks,
      onLogout: () => {
        try {
          previousOnLogout?.();
        } finally {
          notifyHostAccountLogout();
        }
      },
    },
  };
}

function notifyHostAccountLogout(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(CEDROS_LOGIN_ACCOUNT_LOGOUT_EVENT, {
      detail: { source: 'account-workspace' },
    })
  );
}

function AccountWorkspaceContent({
  props,
  colorMode,
}: {
  props: Record<string, unknown>;
  colorMode?: 'light' | 'dark';
}) {
  const t = useTranslations();
  const workspace = normalizeAccountWorkspaceProps(props, t);
  const { authState, isAuthenticated, user, logout } = useAuth();
  const isCheckingSession = authState === 'idle' || authState === 'loading';

  if (isCheckingSession) {
    return (
      <section
        className={accountWorkspaceSectionClassName('loading', colorMode)}
        data-cedros-block={CEDROS_LOGIN_ACCOUNT_WORKSPACE_BLOCK_TYPE}
      >
        <h2 className="cedros-account-workspace-block__title">{workspace.title}</h2>
        <div className="cedros-account-workspace-block__status" role="status">
          <LoadingSpinner size="sm" />
          <span>Loading account...</span>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section
        className={accountWorkspaceSectionClassName('signed-out', colorMode)}
        data-cedros-block={CEDROS_LOGIN_ACCOUNT_WORKSPACE_BLOCK_TYPE}
      >
        <h2 className="cedros-account-workspace-block__title">{workspace.title}</h2>
        <p className="cedros-account-workspace-block__body">{workspace.body}</p>
        <a
          className="cedros-account-workspace-block__link"
          href={sanitizeAuthPageLinkHref(workspace.signInHref)}
        >
          {workspace.signInLabel}
        </a>
      </section>
    );
  }

  return (
    <section
      className={accountWorkspaceSectionClassName('interactive', colorMode)}
      data-cedros-block={CEDROS_LOGIN_ACCOUNT_WORKSPACE_BLOCK_TYPE}
    >
      <div className="cedros-account-workspace-block__header">
        <div className="cedros-account-workspace-block__heading">
          <h2 className="cedros-account-workspace-block__title">{workspace.title}</h2>
          <p className="cedros-account-workspace-block__body">
            {user?.email ? user.email : workspace.body}
          </p>
        </div>
        <button
          type="button"
          className="cedros-button cedros-button-outline cedros-button-sm"
          onClick={() => void logout()}
        >
          {t.buttons.signOut}
        </button>
      </div>
      <AccountSettings className="cedros-account-workspace-block__settings" />
    </section>
  );
}
