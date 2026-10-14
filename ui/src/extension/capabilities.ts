import type { CedrosExtensionManifest } from './contracts';

export const cedrosLoginCapabilities: NonNullable<CedrosExtensionManifest['capabilities']> = [
  {
    id: 'cedros-login:user-context',
    displayName: 'Login User Context',
    description:
      'Publishes the authenticated user, admin/operator identity, auth state, and redacted permission claims to authorized Cedros hosts.',
    category: 'runtime',
    requestedScopes: [
      {
        verb: 'expose',
        resource: 'authenticated user context',
        summary: 'Expose the current user id, profile summary, and authentication state.',
      },
      {
        verb: 'expose',
        resource: 'permission claims',
        summary:
          'Expose redacted host permission claims for permission-gated CRM and admin surfaces.',
      },
    ],
  },
  {
    id: 'cedros-login:session-manage',
    displayName: 'Login Session Management',
    description:
      'Publishes session status and permission-gated account security actions such as invite, reset, revoke, logout-all, and MFA changes.',
    category: 'admin',
    requestedScopes: [
      {
        verb: 'read',
        resource: 'session status',
        summary: 'Read authenticated session status and account security posture.',
      },
      {
        verb: 'call',
        resource: 'session security actions',
        summary:
          'Call permission-gated session revocation, logout-all, MFA, invite, and reset workflows.',
      },
    ],
  },
  {
    id: 'cedros-login:admin-auth',
    displayName: 'Login Admin Authorization',
    description:
      'Publishes admin authorization context for Cedros Data Settings, Team, and CRM identity handoff flows.',
    category: 'admin',
    requestedScopes: [
      {
        verb: 'read',
        resource: 'admin authorization context',
        summary: 'Read operator role and permission context supplied by the Cedros host.',
      },
      {
        verb: 'call',
        resource: 'authorization checks',
        summary: 'Evaluate permission-gated account, team, invite, settings, and audit actions.',
      },
    ],
  },
  {
    id: 'cedros-login:site-brain-records',
    displayName: 'Login Site Brain Records',
    description:
      'Writes redacted operational records for Login jobs, email delivery failures, first-run setup, and account security events.',
    category: 'runtime',
    requestedScopes: [
      {
        verb: 'write',
        resource: 'site-brain-record:job',
        summary: 'Write redacted job completion and failure records.',
      },
      {
        verb: 'write',
        resource: 'site-brain-record:provider',
        summary: 'Write redacted email provider delivery failure records.',
      },
      {
        verb: 'write',
        resource: 'site-brain-record:security',
        summary: 'Write redacted account security event records (e.g. MFA disabled).',
      },
      {
        verb: 'write',
        resource: 'site-brain-record:setup',
        summary: 'Write redacted first-run setup completion records.',
      },
    ],
  },
  {
    id: 'cedros-login:auth-response',
    displayName: 'Login Auth Response Contract',
    description:
      'Publishes the auth-completing response contract: cedros_access/cedros_refresh session cookies (logout expires them with Max-Age=0) and a user body carrying id, email, name, username, picture, walletAddress, authMethods, emailVerified, createdAt, updatedAt plus isNewUser and the per-login method.',
    category: 'runtime',
    requestedScopes: [
      {
        verb: 'expose',
        resource: 'auth session cookies',
        summary:
          'Set the cedros_access (site-wide) and cedros_refresh (extension-scoped) cookies on auth-completing responses; logout expires both with Max-Age=0.',
      },
      {
        verb: 'expose',
        resource: 'auth response user body',
        summary:
          'Expose the authenticated user summary, isNewUser, and the auth method used for this login on auth-completing and verified method-link responses; email change responses are pending until /verify-email succeeds, and only verified link responses carry a linked marker naming the attached method.',
      },
    ],
  },
];
