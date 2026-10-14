import { createElement, useCallback, useId, useMemo, useState } from 'react';

import { useExternalEffect } from '../hooks/effects';
import { useTranslations } from '../i18n';
import { readFormFieldValues } from './authFormFieldValues';
import { authFieldsForMode } from './authFormFields';
import { authProviderButtons, type AuthProviderButton } from './authFormProviders';
import { authPasswordToggleIcon, authProviderIcon } from '../components/shared/providerIcons';
import {
  runtimeAuthFeaturesFromProps,
  useRuntimeAuthProviders,
  type RuntimeAuthProvider,
} from './authRuntimeFeatures';
import { CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE } from './visualBuilderIds';

export type AuthFormMode =
  | 'sign-in'
  | 'create-account'
  | 'forgot-password'
  | 'reset-password'
  | 'verify-email'
  | 'instant-link-verify'
  | 'accept-invite';
type AuthProvider = RuntimeAuthProvider;
type AuthField = ReturnType<typeof authFieldsForMode>[number];

const AUTH_FORM_MODES: AuthFormMode[] = [
  'sign-in',
  'create-account',
  'forgot-password',
  'reset-password',
  'verify-email',
  'instant-link-verify',
  'accept-invite',
];

const DEFAULT_PROVIDERS_BY_MODE: Record<AuthFormMode, AuthProvider[]> = {
  'sign-in': ['email', 'google', 'apple', 'passkey', 'solana', 'instant-link'],
  'create-account': ['email', 'google', 'apple', 'passkey', 'solana'],
  'forgot-password': ['email'],
  'reset-password': ['email'],
  'verify-email': ['email'],
  'instant-link-verify': ['email'],
  'accept-invite': ['email'],
};
// Public auth blocks render provider/sign-in flows only; account-link prompts
// remain owned by React SDK surfaces where authenticated context is available.
const SUPPORTED_PROVIDERS: AuthProvider[] = [
  'email',
  'google',
  'apple',
  'solana',
  'passkey',
  'instant-link',
];

export function AuthFormShell({
  props,
  suppressClientConditionalProviderButtons = false,
  colorMode,
}: {
  props: Record<string, unknown>;
  suppressClientConditionalProviderButtons?: boolean;
  colorMode?: 'light' | 'dark';
}) {
  const t = useTranslations();
  const form = normalizeAuthFormProps(props, t);
  const fields = useMemo(() => authFieldsForMode(form.mode, t), [form.mode, t]);
  const formId = useId();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const runtimeProviders = useRuntimeAuthProviders(form.providers, form.features);
  const providerButtons = authProviderButtons(
    runtimeProviders,
    form.socialButtonOrder,
    suppressClientConditionalProviderButtons
  );
  const footer = authFooterForMode(form.mode, t);
  const canSubmit =
    fields.length > 0 && fields.every((field) => (fieldValues[field.name] ?? '').trim());
  const updateField = (fieldName: string, value: string) => {
    setFieldValues((current) => ({ ...current, [fieldName]: value }));
  };
  const syncFormValues = useCallback(() => {
    setFieldValues((current) => readFormFieldValues(readFormElement(formId), fields, current));
  }, [fields, formId]);
  useExternalEffect(() => {
    syncFormValues();
    const timeoutId = window.setTimeout(syncFormValues, 250);
    return () => window.clearTimeout(timeoutId);
  }, [syncFormValues]);
  const isTabbedMode = form.mode === 'sign-in' || form.mode === 'create-account';
  const activeTab = form.mode === 'create-account' ? 'register' : 'login';
  const formNode = createElement(
    'form',
    {
      key: 'form',
      id: formId,
      className: 'cedros-form',
      onSubmit: (event: { preventDefault: () => void }) => event.preventDefault(),
      onInput: syncFormValues,
      onChange: syncFormValues,
      onFocus: syncFormValues,
    },
    [
      ...fields.map((field) =>
        renderAuthField(field, fieldValues[field.name] ?? '', updateField, t, formId)
      ),
      createElement(
        'button',
        {
          key: 'submit',
          type: 'submit',
          disabled: !canSubmit,
          className: 'cedros-button cedros-button-primary cedros-button-md cedros-button-full',
        },
        form.submitLabel
      ),
      isTabbedMode ? footer : null,
    ].filter(Boolean)
  );
  const authFormContent = [
    form.showProviderButtons && renderProviderButtons(providerButtons, t),
    form.showProviderButtons && providerButtons.length > 0 && runtimeProviders.includes('email')
      ? renderAuthDivider(t)
      : null,
    authTabsForMode(form.mode, t, formId),
    isTabbedMode
      ? createElement(
          'div',
          {
            key: 'tabpanel',
            role: 'tabpanel',
            id: `${formId}-tabpanel-${activeTab}`,
            'aria-labelledby': `${formId}-tab-${activeTab}`,
          },
          formNode
        )
      : formNode,
    !isTabbedMode && form.successMessage
      ? createElement(
          'p',
          { key: 'success', className: 'cedros-auth-form__success' },
          form.successMessage
        )
      : null,
  ].filter(Boolean);
  const panelChildren = isTabbedMode
    ? [createElement('div', { key: 'login-form', className: 'cedros-login-form' }, authFormContent)]
    : authFormContent;
  return createElement(
    'section',
    {
      className: authFormSectionClassName(form.layout, colorMode),
      'data-auth-mode': form.mode,
      'data-cedros-block': CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE,
    },
    [
      createElement('h2', { key: 'title', className: 'cedros-auth-form__title' }, form.title),
      createElement('div', { key: 'panel', className: 'cedros-auth-form__panel' }, panelChildren),
    ].filter(Boolean)
  );
}

/**
 * Class list for the auth-form block root. `colorMode` is the host-resolved
 * site color mode (footer toggle / system, already resolved): the host puts
 * `cedros-dark` on <html> and re-invokes renderers on change, so on public
 * pages the ancestor CSS alone is sufficient — the root class additionally
 * covers surfaces where the marker isn't an ancestor (e.g. builder preview
 * canvases). Undefined (SSR, older hosts) renders light by contract.
 */
export function authFormSectionClassName(layout: string, colorMode?: 'light' | 'dark'): string {
  return `cedros-auth-form cedros-auth-form--${layout}${colorMode === 'dark' ? ' cedros-dark' : ''}`;
}

function normalizeAuthFormProps(
  props: Record<string, unknown>,
  t: ReturnType<typeof useTranslations>
) {
  const mode = authFormModeProp(props.mode);
  const copy = authFormCopy(mode, t);
  const providers = providerListProp(props.enabledProviders, mode);
  const usesInteractiveCopy = mode === 'sign-in' || mode === 'create-account';
  return {
    mode,
    title: stringProp(props.title) || copy.title,
    submitLabel: usesInteractiveCopy
      ? copy.submitLabel
      : stringProp(props.submitLabel) || copy.submitLabel,
    successMessage: stringProp(props.successMessage) || copy.successMessage,
    features: runtimeAuthFeaturesFromProps(props.features),
    socialButtonOrder: socialButtonOrderProp(props.socialButtonOrder),
    showProviderButtons:
      props.showProviderButtons === true ||
      (props.showProviderButtons !== false && providers.some((provider) => provider !== 'email')),
    providers,
    layout: props.layout === 'inline' || props.layout === 'compact' ? props.layout : 'card',
  };
}

function renderProviderButtons(
  providers: AuthProviderButton[],
  t: ReturnType<typeof useTranslations>
) {
  if (providers.length === 0) return null;
  return createElement(
    'div',
    {
      key: 'providers',
      className: 'cedros-social-buttons',
      'aria-label': t.extension.authForm.authOptionsAriaLabel,
    },
    providers.map((provider) =>
      createElement(
        'button',
        {
          key: provider,
          type: 'button',
          className: 'cedros-button cedros-button-social cedros-button-md',
          'data-provider': provider,
        },
        [
          createElement(
            'span',
            {
              key: 'icon',
              className: 'cedros-social-icon',
              'aria-hidden': true,
            },
            authProviderIcon(provider, { className: 'cedros-auth-form__provider-svg' })
          ),
          createElement('span', { key: 'label' }, providerActionLabel(provider, t)),
        ]
      )
    )
  );
}

function renderAuthDivider(t: ReturnType<typeof useTranslations>) {
  return createElement(
    'div',
    { key: 'divider', className: 'cedros-divider' },
    createElement('span', null, t.messages.orContinueWith)
  );
}

function authTabsForMode(
  mode: AuthFormMode,
  t: ReturnType<typeof useTranslations>,
  formId: string
) {
  if (mode !== 'sign-in' && mode !== 'create-account') return null;
  return createElement(
    'div',
    {
      key: 'tabs',
      className: 'cedros-auth-form__tabs cedros-tabs',
      role: 'tablist',
      'aria-label': t.auth.authMethodAriaLabel,
    },
    [
      authTab('login', t.auth.tabs.signIn, mode === 'sign-in', formId),
      authTab('register', t.auth.tabs.signUp, mode === 'create-account', formId),
    ]
  );
}

function authTab(tab: 'login' | 'register', label: string, active: boolean, formId: string) {
  return createElement(
    'button',
    {
      key: tab,
      type: 'button',
      id: `${formId}-tab-${tab}`,
      className: `cedros-tab ${active ? 'cedros-tab-active' : ''}`,
      role: 'tab',
      'aria-selected': active,
      'aria-controls': `${formId}-tabpanel-${tab}`,
      tabIndex: active ? 0 : -1,
    },
    label
  );
}

function renderAuthField(
  field: AuthField,
  value: string,
  onFieldChange: (fieldName: string, value: string) => void,
  t: ReturnType<typeof useTranslations>,
  formId: string
) {
  const isPassword = field.type === 'password';
  const showForgotPassword = field.name === 'password' && field.autoComplete === 'current-password';
  const input = createElement('input', {
    key: 'input',
    id: `${formId}-${field.name}`,
    className: 'cedros-input',
    name: field.name,
    type: field.type,
    autoComplete: field.autoComplete,
    placeholder: field.placeholder,
    required: true,
    'aria-required': 'true',
    value,
    onInput: (event: { target: { value: string } }) =>
      onFieldChange(field.name, event.target.value),
    onChange: (event: { target: { value: string } }) =>
      onFieldChange(field.name, event.target.value),
  });
  const label = createElement(
    'label',
    { key: 'label', htmlFor: `${formId}-${field.name}`, className: 'cedros-label' },
    field.label
  );
  if (!isPassword)
    return createElement('div', { key: field.name, className: 'cedros-form-field' }, [
      label,
      input,
    ]);
  return createElement(
    'div',
    { key: field.name, className: 'cedros-form-field' },
    createElement('div', { className: 'cedros-password-input' }, [
      createElement('div', { key: 'label', className: 'cedros-label-row' }, [
        label,
        showForgotPassword
          ? createElement(
              'button',
              {
                key: 'forgot',
                type: 'button',
                className: 'cedros-link cedros-link-muted cedros-link-sm',
              },
              t.auth.forgotYourPassword
            )
          : null,
      ]),
      createElement('div', { key: 'control', className: 'cedros-password-wrapper' }, [
        input,
        createElement(
          'button',
          {
            key: 'toggle',
            type: 'button',
            className: 'cedros-password-toggle',
            'aria-label': t.auth.showPassword,
            tabIndex: -1,
          },
          authPasswordToggleIcon()
        ),
      ]),
    ])
  );
}

function authFooterForMode(mode: AuthFormMode, t: ReturnType<typeof useTranslations>) {
  if (mode === 'sign-in')
    return authFooter(t.auth.dontHaveAccount, '/register', t.auth.tabs.signUp);
  if (mode === 'create-account')
    return authFooter(t.auth.alreadyHaveAccount, '/login', t.auth.tabs.signIn);
  return null;
}

function authFooter(text: string, _href: string, label: string) {
  return createElement('p', { key: 'footer', className: 'cedros-form-footer' }, [
    `${text} `,
    createElement(
      'button',
      { key: 'link', type: 'button', className: 'cedros-link cedros-link-muted' },
      label
    ),
  ]);
}

function authFormCopy(mode: AuthFormMode, t: ReturnType<typeof useTranslations>) {
  const copy: Record<AuthFormMode, { title: string; submitLabel: string; successMessage: string }> =
    {
      'sign-in': {
        title: t.buttons.signIn,
        submitLabel: t.buttons.signIn,
        successMessage: t.messages.continueAfterSignIn,
      },
      'create-account': {
        title: t.buttons.createAccount,
        submitLabel: t.buttons.createAccount,
        successMessage: t.messages.checkEmailForNextStep,
      },
      'forgot-password': {
        title: t.buttons.forgotPassword,
        submitLabel: t.buttons.sendRecoveryEmail,
        successMessage: t.messages.recoveryInstructionsSent,
      },
      'reset-password': {
        title: t.buttons.resetPassword,
        submitLabel: t.buttons.updatePassword,
        successMessage: t.messages.passwordUpdated,
      },
      'verify-email': {
        title: t.auth.verifying,
        submitLabel: t.auth.verifying,
        successMessage: t.messages.emailVerified,
      },
      'instant-link-verify': {
        title: t.auth.providers.instantLink,
        submitLabel: t.common.continue,
        successMessage: t.messages.instantLinkConfirmed,
      },
      'accept-invite': {
        title: t.buttons.acceptInvite,
        submitLabel: t.buttons.acceptInvite,
        successMessage: t.messages.teamAccessReady,
      },
    };
  return copy[mode];
}

function providerLabel(provider: AuthProvider, t: ReturnType<typeof useTranslations>) {
  const labels: Record<AuthProvider, string> = {
    email: t.auth.providers.email,
    google: t.auth.providers.google,
    apple: t.auth.providers.apple,
    solana: t.auth.providers.solana,
    passkey: t.auth.providers.passkey,
    'instant-link': t.auth.providers.instantLink,
  };
  return labels[provider];
}

function providerActionLabel(provider: AuthProvider, t: ReturnType<typeof useTranslations>) {
  const labels: Partial<Record<AuthProvider, string>> = {
    google: t.buttons.continueWithGoogle,
    apple: t.buttons.continueWithApple,
    solana: t.buttons.continueWithSolana,
    passkey: t.buttons.continueWithPasskey,
  };
  return labels[provider] ?? providerLabel(provider, t);
}

function readFormElement(formId: string): HTMLFormElement | null {
  if (typeof document === 'undefined') return null;
  const element = document.getElementById(formId);
  return element instanceof HTMLFormElement ? element : null;
}

export function authFormModeProp(value: unknown): AuthFormMode {
  if (typeof value === 'string' && AUTH_FORM_MODES.includes(value as AuthFormMode))
    return value as AuthFormMode;
  return 'sign-in';
}

function providerListProp(value: unknown, mode: AuthFormMode): AuthProvider[] {
  const requested = Array.isArray(value)
    ? value.filter(isAuthProvider)
    : DEFAULT_PROVIDERS_BY_MODE[mode];
  const providers = requested.filter(
    (provider, index, values) => values.indexOf(provider) === index
  );
  return providers.length ? providers : DEFAULT_PROVIDERS_BY_MODE[mode];
}

function isAuthProvider(value: unknown): value is AuthProvider {
  return typeof value === 'string' && SUPPORTED_PROVIDERS.includes(value as AuthProvider);
}

function socialButtonOrderProp(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const order = value.filter((entry): entry is string => typeof entry === 'string');
  return order.length ? order : undefined;
}

function stringProp(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
