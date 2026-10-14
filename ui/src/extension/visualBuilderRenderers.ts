import { createElement } from 'react';

import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useTranslations } from '../i18n';
import { sanitizeExternalUrl, sanitizeImageUrl } from '../utils/sanitization';
import {
  CEDROS_LOGIN_ACCOUNT_WORKSPACE_BLOCK_TYPE,
  CEDROS_LOGIN_AUTH_PAGE_COPY_BLOCK_TYPE,
  CEDROS_LOGIN_LOGIN_BUTTON_BLOCK_TYPE,
} from './visualBuilderIds';
export { AuthFormBlock } from './authFormBlock';

type ButtonVariant = 'primary' | 'secondary' | 'link';

export function AuthPageCopyBlock({ props }: { props: Record<string, unknown> }) {
  const t = useTranslations();
  const copy = normalizeAuthPageCopyProps(props, t);
  return createElement(
    'section',
    {
      className: `cedros-auth-page-copy cedros-auth-page-copy--${copy.variant}`,
      'data-cedros-block': CEDROS_LOGIN_AUTH_PAGE_COPY_BLOCK_TYPE,
    },
    [
      createElement('div', { key: 'brand', className: 'cedros-auth-page-copy__brand' }, [
        copy.logo &&
          createElement('img', {
            key: 'logo',
            className: 'cedros-auth-page-copy__logo',
            src: copy.logo.src,
            alt: copy.logo.alt,
          }),
        createElement('div', { key: 'text', className: 'cedros-auth-page-copy__brand-text' }, [
          createElement(
            'h1',
            { key: 'title', className: 'cedros-auth-page-copy__title' },
            copy.title
          ),
          copy.eyebrow &&
            createElement(
              'p',
              { key: 'eyebrow', className: 'cedros-auth-page-copy__eyebrow' },
              copy.eyebrow
            ),
        ]),
      ]),
      copy.body &&
        createElement('p', { key: 'body', className: 'cedros-auth-page-copy__body' }, copy.body),
      copy.primaryLink &&
        createElement(
          'a',
          {
            key: 'primaryLink',
            className: 'cedros-auth-page-copy__link',
            href: copy.primaryLink.href,
          },
          copy.primaryLink.label
        ),
      copy.secondaryText &&
        createElement(
          'p',
          { key: 'secondaryText', className: 'cedros-auth-page-copy__secondary' },
          copy.secondaryText
        ),
    ].filter(Boolean)
  );
}

export function LoginButtonBlock({ props }: { props: Record<string, unknown> }) {
  const t = useTranslations();
  const button = normalizeLoginButtonProps(props, t);
  return createElement(
    'div',
    {
      className: `cedros-login-button-block cedros-login-button-block--${button.align}`,
      'data-cedros-block': CEDROS_LOGIN_LOGIN_BUTTON_BLOCK_TYPE,
    },
    createElement(
      'a',
      {
        className: `cedros-login-button cedros-login-button--${button.variant}`,
        href: button.href,
      },
      button.label
    )
  );
}

/**
 * First-paint placeholder for the account workspace block.
 *
 * Rendered during SSR and before the browser mounts the interactive provider,
 * and reused as the lazy-load Suspense fallback. It deliberately mirrors the
 * interactive "checking session" state (title + spinner) so the hand-off to the
 * real profile resolves in place instead of swapping a different-looking layout.
 */
export function AccountWorkspaceShell({
  props,
  colorMode,
}: {
  props: Record<string, unknown>;
  colorMode?: 'light' | 'dark';
}) {
  const t = useTranslations();
  const workspace = normalizeAccountWorkspaceProps(props, t);
  return createElement(
    'section',
    {
      className: accountWorkspaceSectionClassName('loading', colorMode),
      'data-cedros-block': CEDROS_LOGIN_ACCOUNT_WORKSPACE_BLOCK_TYPE,
    },
    [
      createElement(
        'h2',
        { key: 'title', className: 'cedros-account-workspace-block__title' },
        workspace.title
      ),
      createElement(
        'div',
        { key: 'status', className: 'cedros-account-workspace-block__status', role: 'status' },
        [
          createElement(LoadingSpinner, { key: 'spinner', size: 'sm' }),
          createElement('span', { key: 'label' }, 'Loading account...'),
        ]
      ),
    ]
  );
}

/**
 * Class list for the account-workspace block root. Mirrors the auth-form
 * block: `colorMode` is the host-resolved site color mode (footer toggle /
 * system); the root class covers surfaces where the host's <html>.cedros-dark
 * marker isn't an ancestor. Undefined (SSR, older hosts) renders light and
 * lets the ancestor CSS own first paint.
 */
export function accountWorkspaceSectionClassName(
  variant: 'loading' | 'signed-out' | 'interactive',
  colorMode?: 'light' | 'dark'
): string {
  const base = `cedros-account-workspace-block cedros-account-workspace-block--${variant}`;
  return colorMode === 'dark' ? `${base} cedros-dark` : base;
}

function normalizeAuthPageCopyProps(
  props: Record<string, unknown>,
  t: ReturnType<typeof useTranslations>
) {
  const primaryLink = isRecord(props.primaryLink) ? props.primaryLink : null;
  const primaryLinkLabel = stringProp(primaryLink?.label).trim();
  const logoSrc = sanitizeAuthPageAssetSrc(stringProp(props.logoUrl));
  return {
    eyebrow: stringProp(props.eyebrow),
    logo: logoSrc ? { src: logoSrc, alt: stringProp(props.logoAlt) } : null,
    title: stringProp(props.title) || t.admin.nav.cedrosLogin,
    body: stringProp(props.body) || t.extension.authForm.editBeforePublishing,
    secondaryText: stringProp(props.secondaryText),
    variant: props.variant === 'profile' ? 'profile' : 'auth',
    primaryLink:
      primaryLink?.kind === 'cedros-link' && primaryLinkLabel
        ? {
            href: sanitizeAuthPageLinkHref(stringProp(primaryLink.href)),
            label: primaryLinkLabel,
          }
        : null,
  };
}

function normalizeLoginButtonProps(
  props: Record<string, unknown>,
  t: ReturnType<typeof useTranslations>
) {
  return {
    label: stringProp(props.label) || t.buttons.signIn,
    href: sanitizeAuthPageLinkHref(stringProp(props.href) || '/login'),
    variant: buttonVariantProp(props.variant),
    align: props.align === 'center' || props.align === 'end' ? props.align : 'start',
  };
}

export function normalizeAccountWorkspaceProps(
  props: Record<string, unknown>,
  t: ReturnType<typeof useTranslations>
) {
  return {
    title: stringProp(props.title) || t.buttons.manageAccount,
    body: stringProp(props.body) || t.extension.authForm.accountWorkspaceBody,
    signInHref: sanitizeAuthPageLinkHref(stringProp(props.signInHref) || '/login'),
    signInLabel: stringProp(props.signInLabel) || t.extension.authForm.logInToManageAccount,
  };
}

function buttonVariantProp(value: unknown): ButtonVariant {
  return value === 'secondary' || value === 'link' ? value : 'primary';
}

export function sanitizeAuthPageLinkHref(value: string): string {
  const trimmedValue = value.trim();
  if (!trimmedValue) return '/';
  if (trimmedValue.startsWith('/')) return trimmedValue;
  return sanitizeExternalUrl(trimmedValue) || '/';
}

function sanitizeAuthPageAssetSrc(value: string): string {
  const trimmedValue = value.trim();
  if (!trimmedValue) return '';
  if (trimmedValue.includes('\\')) return '';
  if (trimmedValue.startsWith('//')) return '';
  if (trimmedValue.startsWith('/')) return trimmedValue;
  return sanitizeImageUrl(trimmedValue) || '';
}

function stringProp(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
