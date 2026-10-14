import { createElement } from 'react';

import { AccountWorkspaceBlock } from './accountWorkspaceBlock';
import { AuthFormBlock, AuthPageCopyBlock, LoginButtonBlock } from './visualBuilderRenderers';
import {
  CEDROS_LOGIN_ACCOUNT_WORKSPACE_BLOCK_TYPE,
  CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE,
  CEDROS_LOGIN_AUTH_PAGE_COPY_BLOCK_TYPE,
  CEDROS_LOGIN_CONTENT_TEMPLATE_IDS,
  CEDROS_LOGIN_LOGIN_BUTTON_BLOCK_TYPE,
} from './visualBuilderIds';

import type { JsonObject } from '../admin/types';
import type { CedrosJsonSchemaObject } from './jsonSchema';
import type {
  CedrosExtensionContentBlockManifest,
  CedrosExtensionContentTemplateManifest,
  CedrosRuntimeAuthoredBlock,
  CedrosRuntimeContentBlockRenderer,
  CedrosRuntimeContentBlockDefinition,
  CedrosRuntimeContentTemplateDefinition,
} from './contracts';

const authPageCopyBlockSchema = {
  type: 'object',
  properties: {
    eyebrow: { type: 'string' },
    logoAlt: { type: 'string' },
    logoUrl: { type: 'string' },
    title: { type: 'string' },
    body: { type: 'string' },
    primaryLink: {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['cedros-link'] },
        href: { type: 'string' },
        label: { type: 'string' },
      },
      required: ['kind', 'href', 'label'],
    },
    secondaryText: { type: 'string' },
    variant: { type: 'string', enum: ['auth', 'profile'] },
  },
  required: ['title', 'body'],
} as const;

const authFormBlockSchema = {
  type: 'object',
  properties: {
    mode: {
      type: 'string',
      enum: [
        'sign-in',
        'create-account',
        'forgot-password',
        'reset-password',
        'verify-email',
        'instant-link-verify',
        'accept-invite',
      ],
    },
    title: { type: 'string' },
    submitLabel: { type: 'string' },
    successMessage: { type: 'string' },
    showProviderButtons: { type: 'boolean' },
    enabledProviders: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['email', 'google', 'apple', 'solana', 'passkey', 'instant-link'],
      },
    },
    layout: { type: 'string', enum: ['card', 'inline', 'compact'] },
  },
  required: ['mode'],
} as const;

const loginButtonBlockSchema = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    href: { type: 'string' },
    variant: { type: 'string', enum: ['primary', 'secondary', 'link'] },
    align: { type: 'string', enum: ['start', 'center', 'end'] },
  },
  required: ['label', 'href'],
} as const;

const accountWorkspaceBlockSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    body: { type: 'string' },
    sections: {
      type: 'array',
      items: { type: 'string', enum: ['profile', 'security', 'linked-accounts', 'sessions'] },
    },
    signInHref: { type: 'string' },
    signInLabel: { type: 'string' },
  },
  required: ['title', 'body'],
} as const;

const cedrosLoginContentBlocks: CedrosExtensionContentBlockManifest[] = [
  {
    type: CEDROS_LOGIN_AUTH_PAGE_COPY_BLOCK_TYPE,
    displayName: 'Login Page Copy',
    description: 'Owner-editable heading, body, and safe link copy for Login public pages.',
    category: 'identity',
    order: 10,
  },
  {
    type: CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE,
    displayName: 'Login Auth Form',
    description:
      'Portable sign-in, account creation, forgot-password, and reset-password form starter.',
    category: 'identity',
    order: 20,
  },
  {
    type: CEDROS_LOGIN_LOGIN_BUTTON_BLOCK_TYPE,
    displayName: 'Login Button',
    description: 'Safe call-to-action link for sign-in and account handoff flows.',
    category: 'identity',
    order: 30,
  },
  {
    type: CEDROS_LOGIN_ACCOUNT_WORKSPACE_BLOCK_TYPE,
    displayName: 'Account Workspace',
    description:
      'Portable authenticated account workspace starter for profile, security, linked accounts, and sessions.',
    category: 'identity',
    order: 40,
  },
];

const cedrosLoginContentTemplateMetadata: CedrosExtensionContentTemplateManifest[] = [
  template(0, 'Login Page Template', 'Starter page for the Cedros Login login flow.'),
  template(1, 'Register Page Template', 'Starter page for Cedros Login registration.'),
  template(2, 'Password Recovery Page Template', 'Starter page for password recovery.'),
  template(
    3,
    'Reset Password Page Template',
    'Starter page for choosing a new password from a secure reset link.'
  ),
  template(
    4,
    'Email Verification Page Template',
    'Starter page for confirming an account email address.'
  ),
  template(
    5,
    'Instant Link Verification Page Template',
    'Starter page for completing sign-in from a secure email link.'
  ),
  template(6, 'Invite Acceptance Page Template', 'Starter page for team invite acceptance.'),
  template(
    7,
    'Profile Workspace Page Template',
    'Starter page for authenticated profile, identity, and security management.'
  ),
];

export const cedrosLoginRuntimeContentBlocks: CedrosRuntimeContentBlockDefinition[] = [
  {
    ...cedrosLoginContentBlocks[0],
    Component: AuthPageCopyBlock,
  },
  {
    ...cedrosLoginContentBlocks[1],
    Component: AuthFormBlock,
  },
  {
    ...cedrosLoginContentBlocks[2],
    Component: LoginButtonBlock,
  },
  {
    ...cedrosLoginContentBlocks[3],
    Component: AccountWorkspaceBlock,
  },
];

const cedrosLoginContentBlockSchemas: CedrosJsonSchemaObject[] = [
  authPageCopyBlockSchema,
  authFormBlockSchema,
  loginButtonBlockSchema,
  accountWorkspaceBlockSchema,
];

export const cedrosLoginRuntimeContentBlockRenderers: CedrosRuntimeContentBlockRenderer[] =
  cedrosLoginRuntimeContentBlocks.map(({ type, Component }, index) => ({
    type,
    render: ({ block, siteData, colorMode }) =>
      createElement(Component, {
        props: schemaApprovedProps(block.props, cedrosLoginContentBlockSchemas[index]),
        runtimeBaseUrl: trustedRuntimeBaseUrl(siteData),
        colorMode,
      }),
  }));

export const cedrosLoginRuntimeContentTemplates: CedrosRuntimeContentTemplateDefinition[] = [
  runtimeTemplate(0, [
    authoredBlock(CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE, {
      mode: 'sign-in',
      title: 'Log in',
      submitLabel: 'Log in',
      successMessage: 'You will continue after logging in.',
      showProviderButtons: true,
      enabledProviders: ['email', 'google', 'apple', 'passkey', 'solana', 'instant-link'],
      layout: 'card',
    }),
  ]),
  runtimeTemplate(1, [
    authoredBlock(CEDROS_LOGIN_AUTH_PAGE_COPY_BLOCK_TYPE, {
      eyebrow: 'Cedros Login',
      title: 'Create your account',
      body: 'Choose a sign-in method to create your account and continue.',
      primaryLink: cedrosLink('/register', 'Create account'),
      secondaryText: 'Already have an account? Sign in instead.',
      variant: 'auth',
    }),
    authoredBlock(CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE, {
      mode: 'create-account',
      title: 'Register',
      submitLabel: 'Register',
      successMessage: 'Check your email for the next account step.',
      showProviderButtons: true,
      enabledProviders: ['email', 'google', 'apple', 'passkey', 'solana'],
      layout: 'card',
    }),
  ]),
  runtimeTemplate(2, [
    authoredBlock(CEDROS_LOGIN_AUTH_PAGE_COPY_BLOCK_TYPE, {
      eyebrow: 'Account recovery',
      title: 'Recover access',
      body: 'Enter your email and we’ll send instructions if an account exists.',
      primaryLink: cedrosLink('/password-recovery', 'Recover access'),
      secondaryText: 'For your privacy, we won’t confirm whether an email has an account.',
      variant: 'auth',
    }),
    authoredBlock(CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE, {
      mode: 'forgot-password',
      title: 'Forgot password',
      submitLabel: 'Send recovery email',
      successMessage: 'If an account exists, recovery instructions will be sent.',
      showProviderButtons: false,
      enabledProviders: ['email'],
      layout: 'card',
    }),
  ]),
  runtimeTemplate(3, [
    authoredBlock(CEDROS_LOGIN_AUTH_PAGE_COPY_BLOCK_TYPE, {
      eyebrow: 'Account recovery',
      title: 'Reset password',
      body: 'Choose a new password to restore access to your account.',
      primaryLink: cedrosLink('/reset-password', 'Reset password'),
      secondaryText: 'This link can only be used once and may expire.',
      variant: 'auth',
    }),
    authoredBlock(CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE, {
      mode: 'reset-password',
      title: 'Reset password',
      submitLabel: 'Update password',
      successMessage: 'Your password has been updated.',
      showProviderButtons: false,
      enabledProviders: ['email'],
      layout: 'card',
    }),
  ]),
  runtimeTemplate(4, [
    authoredBlock(CEDROS_LOGIN_AUTH_PAGE_COPY_BLOCK_TYPE, {
      eyebrow: 'Email verification',
      title: 'Verify your email',
      body: 'Confirm your email address to finish securing your account.',
      primaryLink: cedrosLink('/verify-email', 'Verify email'),
      secondaryText: 'You can close this page after your email is verified.',
      variant: 'auth',
    }),
    authoredBlock(CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE, {
      mode: 'verify-email',
      title: 'Verify email',
      submitLabel: 'Verify email',
      successMessage: 'Your email is verified.',
      showProviderButtons: false,
      enabledProviders: ['email'],
      layout: 'card',
    }),
  ]),
  runtimeTemplate(5, [
    authoredBlock(CEDROS_LOGIN_AUTH_PAGE_COPY_BLOCK_TYPE, {
      eyebrow: 'Instant link',
      title: 'Continue signing in',
      body: 'Finish signing in with the secure link from your email.',
      primaryLink: cedrosLink('/instant-link/verify', 'Continue'),
      secondaryText: 'This link can only be used once and may expire.',
      variant: 'auth',
    }),
    authoredBlock(CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE, {
      mode: 'instant-link-verify',
      title: 'Continue with instant link',
      submitLabel: 'Continue',
      successMessage: 'Your sign-in link is confirmed.',
      showProviderButtons: false,
      enabledProviders: ['email'],
      layout: 'card',
    }),
  ]),
  runtimeTemplate(6, [
    authoredBlock(CEDROS_LOGIN_AUTH_PAGE_COPY_BLOCK_TYPE, {
      eyebrow: 'Team invite',
      title: 'Accept your invite',
      body: 'Sign in with the invited account to join the team.',
      primaryLink: cedrosLink('/accept-invite', 'Accept invite'),
      secondaryText: 'If you’re signed in with another account, you can switch before accepting.',
      variant: 'auth',
    }),
    authoredBlock(CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE, {
      mode: 'accept-invite',
      title: 'Accept invite',
      submitLabel: 'Accept invite',
      successMessage: 'Your team access is ready.',
      showProviderButtons: false,
      enabledProviders: ['email'],
      layout: 'card',
    }),
  ]),
  runtimeTemplate(7, [
    authoredBlock(CEDROS_LOGIN_ACCOUNT_WORKSPACE_BLOCK_TYPE, {
      title: 'Manage your account',
      body: 'Update your profile, security settings, and sign-in methods.',
      sections: ['profile', 'security', 'linked-accounts', 'sessions'],
      signInHref: '/login',
      signInLabel: 'Log in to manage account',
    }),
  ]),
];

function template(
  index: number,
  displayName: string,
  description: string
): CedrosExtensionContentTemplateManifest {
  return {
    id: CEDROS_LOGIN_CONTENT_TEMPLATE_IDS[index],
    displayName,
    description,
    order: index + 1,
    contentTypes: ['page'],
  };
}

function authoredBlock(type: string, props: JsonObject): CedrosRuntimeAuthoredBlock {
  return { type, props };
}

function runtimeTemplate(
  index: number,
  blocks: CedrosRuntimeAuthoredBlock[]
): CedrosRuntimeContentTemplateDefinition {
  const metadata = cedrosLoginContentTemplateMetadata[index];

  return {
    ...metadata,
    label: metadata.displayName,
    zones: [
      {
        id: 'main',
        label: 'Main content',
        description: 'Owner-editable Cedros Login page content.',
        order: 10,
        emptyLabel: 'Add Cedros Login content blocks to this page.',
        allowedBlockTypes: allowedBlockTypesForTemplate(index, blocks),
      },
    ],
    blocks,
    nativeFallback: 'Display owner-authored content or omit this web-only builder template.',
  };
}

function uniqueBlockTypes(blocks: CedrosRuntimeAuthoredBlock[]): string[] {
  return [...new Set(blocks.map((block) => block.type))];
}

function allowedBlockTypesForTemplate(
  index: number,
  blocks: CedrosRuntimeAuthoredBlock[]
): string[] {
  if (index === 0) {
    return [CEDROS_LOGIN_AUTH_PAGE_COPY_BLOCK_TYPE, CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE];
  }
  return uniqueBlockTypes(blocks);
}

function cedrosLink(href: string, label: string) {
  return { kind: 'cedros-link', href, label };
}

function schemaApprovedProps(props: JsonObject, schema: CedrosJsonSchemaObject): JsonObject {
  const approvedKeys = Object.keys(schema.properties ?? {});
  const approvedProps: JsonObject = {};
  for (const key of approvedKeys) {
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      approvedProps[key] = props[key];
    }
  }
  return approvedProps;
}

function trustedRuntimeBaseUrl(siteData: unknown): string | undefined {
  if (!siteData || typeof siteData !== 'object') return undefined;
  const record = siteData as Record<string, unknown>;
  const cedrosLogin = record.cedrosLogin;
  if (cedrosLogin && typeof cedrosLogin === 'object') {
    const nested = cedrosLogin as Record<string, unknown>;
    if (typeof nested.runtimeBaseUrl === 'string' && nested.runtimeBaseUrl) {
      return nested.runtimeBaseUrl;
    }
    if (typeof nested.serverUrl === 'string' && nested.serverUrl) {
      return nested.serverUrl;
    }
  }
  if (typeof record.runtimeBaseUrl === 'string' && record.runtimeBaseUrl) {
    return record.runtimeBaseUrl;
  }
  return undefined;
}
