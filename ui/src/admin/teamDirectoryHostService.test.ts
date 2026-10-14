import { describe, expect, it, beforeEach, vi } from 'vitest';
import { HOST_SERVICE_IDS } from './platform';
import type { HostContext } from './types';

import {
  CEDROS_LOGIN_TEAM_DIRECTORY_HOST_SERVICE_ID,
  cedrosLoginTeamDirectoryHostService,
  createCedrosLoginTeamDirectoryService,
} from './teamDirectoryHostService';

const mocks = vi.hoisted(() => ({
  apiConstructor: vi.fn(),
  memberConstructor: vi.fn(),
  post: vi.fn(),
  listMembers: vi.fn(),
  createInvite: vi.fn(),
}));

vi.mock('../utils/apiClient', () => ({
  ApiClient: vi.fn().mockImplementation(function ApiClientMock(options) {
    mocks.apiConstructor(options);
    return { post: mocks.post };
  }),
}));

vi.mock('../utils/memberApi', () => ({
  MemberApiClient: vi
    .fn()
    .mockImplementation(function MemberApiClientMock(baseUrl, _timeout, _retries, getAccessToken) {
      mocks.memberConstructor({
        baseUrl,
        token: typeof getAccessToken === 'function' ? getAccessToken() : null,
      });
      return {
        listMembers: mocks.listMembers,
      };
    }),
}));

vi.mock('../utils/inviteApi', () => ({
  InviteApiClient: vi.fn().mockImplementation(function InviteApiClientMock() {
    return { createInvite: mocks.createInvite };
  }),
}));

// An active org whose role grants manage_users — the precondition for every
// roster/search/login + delegated password action after the org-scoping fix.
const manageUsersOrg = { orgId: 'org-1', role: 'admin', permissions: [] as string[] };

function hostContext(overrides?: Pick<HostContext, 'org' | 'services'>): HostContext {
  return {
    services: {
      [HOST_SERVICE_IDS.cedrosLogin]: {
        user: { id: 'operator-1' },
        getAccessToken: () => 'token-1',
        serverUrl: 'https://auth.example.com',
      },
      ...(overrides?.services ?? {}),
    },
    org: overrides?.org,
  };
}

describe('cedros-login team directory host service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Org-scoped member seam (GET /orgs/{orgId}/members) — exposes only
    // id/email/name(+picture)/joinedAt, none of the cross-tenant fields the old
    // system-wide /admin/users list leaked.
    mocks.listMembers.mockResolvedValue({
      members: [
        {
          id: 'member-1',
          userId: 'user-1',
          orgId: 'org-1',
          role: 'member',
          joinedAt: '2026-01-01T00:00:00.000Z',
          user: {
            id: 'user-1',
            email: 'user@example.com',
            name: 'User One',
            picture: 'https://example.com/avatar.png',
          },
        },
      ],
      total: 1,
    });
    mocks.post.mockResolvedValue({ message: 'If an account exists, a reset email has been sent.' });
  });

  it('lists org-scoped members and delegates password reset actions', async () => {
    const service = createCedrosLoginTeamDirectoryService(hostContext({ org: manageUsersOrg }));

    expect(service.id).toBe(CEDROS_LOGIN_TEAM_DIRECTORY_HOST_SERVICE_ID);
    const result = await service.listLoginMetadata({ limit: 500, offset: -10 });
    await service.delegatePasswordReset({ userId: ' user-1 ' });

    // Roster reads go through the org-scoped member client, built on the
    // extension-mounted base URL. Reset delegation derives the target email
    // from that same seam and invokes the public, enumeration-safe recovery route.
    expect(mocks.memberConstructor).toHaveBeenCalledWith({
      baseUrl: 'https://auth.example.com/extensions/cedros-login',
      token: 'token-1',
    });
    expect(mocks.listMembers).toHaveBeenCalledWith('org-1', 100, 0);
    expect(result.members).toEqual([
      {
        id: 'user-1',
        email: 'user@example.com',
        emailVerified: false,
        name: 'User One',
        picture: 'https://example.com/avatar.png',
        authMethods: [],
        isSystemAdmin: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    expect(result.users).toBe(result.members);
    expect(result.total).toBe(1);
    expect(mocks.post).toHaveBeenCalledWith('/forgot-password', {
      email: 'user@example.com',
    });
  });

  it('refuses cross-organization password-reset delegation', async () => {
    const service = createCedrosLoginTeamDirectoryService(hostContext({ org: manageUsersOrg }));

    await expect(service.delegatePasswordReset({ userId: 'other-org-user' })).rejects.toThrow(
      'user is not a member of the active organization'
    );
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('fails closed without host context or unsupported temporary passwords', async () => {
    expect(() => createCedrosLoginTeamDirectoryService({ services: {} })).toThrow(
      'cedros-login-team-directory requires the cedros-login host service'
    );

    const service = createCedrosLoginTeamDirectoryService(hostContext({ org: manageUsersOrg }));
    await expect(service.delegatePasswordReset({ userId: ' ' })).rejects.toThrow(
      'cedros-login-team-directory requires a userId'
    );
    await expect(service.delegateTemporaryPassword('user-1')).rejects.toThrow(
      'does not issue temporary passwords'
    );
  });

  it('exposes the Cedros platform contract: listTeamMembers, searchTeamMembers, listTeamMemberLogins', async () => {
    const service = createCedrosLoginTeamDirectoryService(hostContext({ org: manageUsersOrg }));

    // Roster for the core Team page + admin-page access pickers. The host's
    // AdminPageAccessTeamDirectoryService consumes these as a PLAIN ARRAY.
    const roster = await service.listTeamMembers();
    expect(Array.isArray(roster)).toBe(true);
    expect(roster.map((member) => member.id)).toEqual(['user-1']);

    // Search filters by email/name, case-insensitive (no server-side search).
    const hit = await service.searchTeamMembers('USER one');
    expect(Array.isArray(hit)).toBe(true);
    expect(hit.map((member) => member.id)).toEqual(['user-1']);

    const miss = await service.searchTeamMembers('nobody');
    expect(miss).toEqual([]);

    // Vault Team controls read login metadata through the same service, which
    // keeps the paginated result (members + totals) for richer surfaces.
    const logins = await service.listTeamMemberLogins();
    expect(logins.members.map((member) => member.id)).toEqual(['user-1']);
    expect(logins.total).toBe(1);

    // Every roster path is org-scoped; none invoke the password-reset route.
    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.listMembers).toHaveBeenCalledWith('org-1', expect.any(Number), expect.any(Number));

    // The registration advertises the contract methods to the host.
    const declared = cedrosLoginTeamDirectoryHostService.methods.map((method) => method.name);
    expect(declared).toEqual(
      expect.arrayContaining(['listTeamMembers', 'searchTeamMembers', 'listTeamMemberLogins'])
    );
  });

  it('fails closed without an active organization (no cross-tenant directory access)', async () => {
    const service = createCedrosLoginTeamDirectoryService(hostContext());

    await expect(service.listLoginMetadata()).rejects.toThrow(
      'cedros-login-team-directory requires an active organization'
    );
    await expect(service.listTeamMembers()).rejects.toThrow('requires an active organization');
    await expect(service.delegatePasswordReset('user-1')).rejects.toThrow(
      'requires an active organization'
    );
    // Without an org there is no system-wide fallback to leak — nothing is fetched.
    expect(mocks.listMembers).not.toHaveBeenCalled();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('fails closed when the host user lacks manage_users access', async () => {
    const service = createCedrosLoginTeamDirectoryService(
      hostContext({
        org: {
          orgId: 'org-1',
          role: 'member',
          permissions: [],
        },
      })
    );

    await expect(service.listLoginMetadata()).rejects.toThrow(
      'cedros-login-team-directory requires manage_users permission'
    );
    await expect(service.delegatePasswordReset('user-1')).rejects.toThrow(
      'cedros-login-team-directory requires manage_users permission'
    );
    await expect(service.inviteTeamMember({ email: 'new@example.com' })).rejects.toThrow(
      'cedros-login-team-directory requires manage_users permission'
    );
    expect(mocks.listMembers).not.toHaveBeenCalled();
    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.createInvite).not.toHaveBeenCalled();
  });

  it('delegates a team invite to the org-scoped invite API', async () => {
    mocks.createInvite.mockResolvedValue({
      id: 'invite-1',
      orgId: 'org-1',
      email: 'new@example.com',
      role: 'member',
      invitedBy: 'operator-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      expiresAt: '2026-01-08T00:00:00.000Z',
    });
    const service = createCedrosLoginTeamDirectoryService(
      hostContext({ org: { orgId: 'org-1', role: 'admin', permissions: [] } })
    );

    const result = await service.inviteTeamMember({
      email: ' new@example.com ',
      role: 'Administrator',
    });

    // Org id comes from the host org service; role is normalised; email trimmed.
    expect(mocks.createInvite).toHaveBeenCalledWith('org-1', {
      email: 'new@example.com',
      role: 'admin',
    });
    expect(result).toMatchObject({ id: 'invite-1', email: 'new@example.com', status: 'pending' });
    expect(result.message).toContain('new@example.com');
    expect(cedrosLoginTeamDirectoryHostService.methods.map((method) => method.name)).toContain(
      'inviteTeamMember'
    );
  });

  it('defaults invites to the least-privileged member role', async () => {
    mocks.createInvite.mockResolvedValue({
      id: 'invite-2',
      orgId: 'org-1',
      email: 'member@example.com',
      role: 'member',
      invitedBy: 'operator-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      expiresAt: '2026-01-08T00:00:00.000Z',
    });
    const service = createCedrosLoginTeamDirectoryService(
      hostContext({ org: { orgId: 'org-1', role: 'admin', permissions: [] } })
    );

    // No role provided (and unknown roles) fall back to member, not the backend default.
    await service.inviteTeamMember({ email: 'member@example.com' });
    expect(mocks.createInvite).toHaveBeenCalledWith('org-1', {
      email: 'member@example.com',
      role: 'member',
    });
  });

  it('fails closed when inviting without an email or active organization', async () => {
    const withOrg = createCedrosLoginTeamDirectoryService(
      hostContext({ org: { orgId: 'org-1', role: 'admin', permissions: [] } })
    );
    await expect(withOrg.inviteTeamMember({ email: '   ' })).rejects.toThrow('requires an email');

    const noOrg = createCedrosLoginTeamDirectoryService(hostContext());
    await expect(noOrg.inviteTeamMember({ email: 'new@example.com' })).rejects.toThrow(
      'requires an active organization'
    );
    expect(mocks.createInvite).not.toHaveBeenCalled();
  });
});
