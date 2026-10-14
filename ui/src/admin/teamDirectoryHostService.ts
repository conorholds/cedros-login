import { HOST_SERVICE_IDS, getHostService } from './platform';
import type { HostContext } from './types';
import type { AdminUser, ListUsersParams, Member, OrgRole } from '../types';
import { ApiClient } from '../utils/apiClient';
import { InviteApiClient } from '../utils/inviteApi';
import { MemberApiClient } from '../utils/memberApi';
import { cedrosLoginExtensionBaseUrl } from './extensionBaseUrl';

export const CEDROS_LOGIN_TEAM_DIRECTORY_HOST_SERVICE_ID = 'cedros-login-team-directory' as const;

type CedrosLoginHostService = NonNullable<HostContext['cedrosLogin']>;
type OrgHostService = NonNullable<HostContext['org']>;
type UserActionInput = string | { userId: string };

export interface CedrosLoginTeamDirectoryEntry {
  id: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  authMethods: AdminUser['authMethods'];
  isSystemAdmin: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CedrosLoginTeamDirectoryListResult {
  members: CedrosLoginTeamDirectoryEntry[];
  users: CedrosLoginTeamDirectoryEntry[];
  total: number;
  limit: number;
  offset: number;
}

/** Delegated team-invite request from Cedros Data's Invite Team Members page. */
export interface CedrosLoginTeamInviteRequest {
  email: string;
  name?: string;
  role?: string;
}

/** Invite result; `message` is safe for admin display (no tokens/secrets). */
export interface CedrosLoginTeamInviteResult {
  id?: string;
  email?: string;
  status?: string;
  message?: string;
}

export interface CedrosLoginTeamDirectoryService {
  id: typeof CEDROS_LOGIN_TEAM_DIRECTORY_HOST_SERVICE_ID;
  /**
   * Cedros Data team roster + admin-page access pickers. Resolves a plain array
   * to match the host's AdminPageAccessTeamDirectoryService contract
   * (`listTeamMembers?: () => AdminPageAccessUser[] | Promise<AdminPageAccessUser[]>`).
   */
  listTeamMembers: (params?: ListUsersParams) => Promise<CedrosLoginTeamDirectoryEntry[]>;
  /** Filtered roster lookup (email/name contains; case-insensitive). Plain array. */
  searchTeamMembers: (
    query: string,
    params?: ListUsersParams
  ) => Promise<CedrosLoginTeamDirectoryEntry[]>;
  /**
   * Delegated team invite for Cedros Data's Invite Team Members page; scoped to
   * the active organization from the host org service.
   */
  inviteTeamMember: (request: CedrosLoginTeamInviteRequest) => Promise<CedrosLoginTeamInviteResult>;
  /** Login metadata for Vault Team controls (paginated result with totals). */
  listTeamMemberLogins: (params?: ListUsersParams) => Promise<CedrosLoginTeamDirectoryListResult>;
  listLoginMetadata: (params?: ListUsersParams) => Promise<CedrosLoginTeamDirectoryListResult>;
  listMembers: (params?: ListUsersParams) => Promise<CedrosLoginTeamDirectoryListResult>;
  requestPasswordReset: (input: UserActionInput) => Promise<void>;
  delegatePasswordReset: (input: UserActionInput) => Promise<void>;
  requestTemporaryPassword: (input: UserActionInput) => Promise<never>;
  delegateTemporaryPassword: (input: UserActionInput) => Promise<never>;
}

export interface CedrosLoginTeamDirectoryHostServiceRegistration {
  id: typeof CEDROS_LOGIN_TEAM_DIRECTORY_HOST_SERVICE_ID;
  displayName: string;
  description: string;
  createService: (hostContext: HostContext) => CedrosLoginTeamDirectoryService;
  methods: Array<{
    name: keyof CedrosLoginTeamDirectoryService;
    requiredPermission: string;
    description: string;
  }>;
}

export function createCedrosLoginTeamDirectoryService(
  hostContext: HostContext
): CedrosLoginTeamDirectoryService {
  const memberApiClient = createMemberApiClient(hostContext);
  const passwordResetApiClient = createPasswordResetApiClient(hostContext);

  // Paginated roster fetch, scoped to the caller's active organization. The
  // Vault/login-metadata methods return this result directly; the host roster
  // methods unwrap it to a plain array.
  async function fetchDirectory(
    params?: ListUsersParams
  ): Promise<CedrosLoginTeamDirectoryListResult> {
    const orgId = requireManageUsersOrgId(hostContext);
    const pagination = normalizeListParams(params);
    const response = await memberApiClient.listMembers(orgId, pagination.limit, pagination.offset);
    const members = response.members.map(toDirectoryEntryFromMember);
    return {
      members,
      users: members,
      total: response.total,
      limit: pagination.limit,
      offset: pagination.offset,
    };
  }

  // Cedros Data's AdminPageAccessTeamDirectoryService consumes these as plain
  // arrays (`service.listTeamMembers()` / `service.searchTeamMembers(q)`), so
  // unwrap the paginated result here rather than returning the object.
  async function listTeamMembers(
    params?: ListUsersParams
  ): Promise<CedrosLoginTeamDirectoryEntry[]> {
    return (await fetchDirectory(params)).members;
  }

  async function searchTeamMembers(
    query: string,
    params?: ListUsersParams
  ): Promise<CedrosLoginTeamDirectoryEntry[]> {
    const needle = query.trim().toLowerCase();
    // The admin-users seam paginates but has no server-side search, so fetch a
    // bounded page and filter by email/name here (typeahead pickers, small teams).
    const { members } = await fetchDirectory({
      limit: params?.limit ?? 100,
      offset: params?.offset,
    });
    if (!needle) return members;
    return members.filter(
      (entry) =>
        (entry.email?.toLowerCase().includes(needle) ?? false) ||
        (entry.name?.toLowerCase().includes(needle) ?? false)
    );
  }

  async function inviteTeamMember(
    request: CedrosLoginTeamInviteRequest
  ): Promise<CedrosLoginTeamInviteResult> {
    // Invites are org-scoped (POST /orgs/{orgId}/invites); the guard returns the
    // active organization and fails closed without manage_users in it. request.name
    // has no field in our invite API (the invitee sets their name on registration),
    // so it is intentionally not forwarded.
    const orgId = requireManageUsersOrgId(hostContext);
    const email = request.email?.trim();
    if (!email) {
      throw new Error('cedros-login-team-directory requires an email to invite');
    }
    const response = await createInviteApiClient(hostContext).createInvite(orgId, {
      email,
      role: normalizeInviteRole(request.role),
    });
    return {
      id: response.id,
      email: response.email ?? email,
      status: 'pending',
      message: `Invite sent to ${response.email ?? email}.`,
    };
  }

  async function requestPasswordReset(input: UserActionInput): Promise<void> {
    const orgId = requireManageUsersOrgId(hostContext);
    const userId = requireUserId(input);
    const email = await findOrganizationMemberEmail(memberApiClient, orgId, userId);
    // The recovery route is deliberately enumeration-safe and cooldown-bound.
    // Deriving the address from the org-scoped membership seam avoids coupling
    // this host service to the system-wide /admin/users authorization domain.
    await passwordResetApiClient.post('/forgot-password', { email });
  }

  async function requestTemporaryPassword(input: UserActionInput): Promise<never> {
    requireManageUsersOrgId(hostContext);
    requireUserId(input);
    throw new Error(
      'cedros-login-team-directory does not issue temporary passwords; request a password reset instead.'
    );
  }

  return {
    id: CEDROS_LOGIN_TEAM_DIRECTORY_HOST_SERVICE_ID,
    listTeamMembers,
    searchTeamMembers,
    inviteTeamMember,
    listTeamMemberLogins: fetchDirectory,
    listLoginMetadata: fetchDirectory,
    listMembers: fetchDirectory,
    requestPasswordReset,
    delegatePasswordReset: requestPasswordReset,
    requestTemporaryPassword,
    delegateTemporaryPassword: requestTemporaryPassword,
  };
}

export const cedrosLoginTeamDirectoryHostService: CedrosLoginTeamDirectoryHostServiceRegistration =
  {
    id: CEDROS_LOGIN_TEAM_DIRECTORY_HOST_SERVICE_ID,
    displayName: 'Cedros Login Team Directory',
    description:
      'Lists Cedros Login account metadata for team surfaces and delegates password reset actions to Cedros Login.',
    createService: createCedrosLoginTeamDirectoryService,
    methods: [
      {
        name: 'listTeamMembers',
        requiredPermission: 'manage_users',
        description:
          'List Cedros Login members for the Cedros Data team roster and access pickers.',
      },
      {
        name: 'searchTeamMembers',
        requiredPermission: 'manage_users',
        description: 'Search Cedros Login members by email/name for access pickers.',
      },
      {
        name: 'inviteTeamMember',
        requiredPermission: 'manage_users',
        description: "Send a team invite for Cedros Data's Invite Team Members page (org-scoped).",
      },
      {
        name: 'listTeamMemberLogins',
        requiredPermission: 'manage_users',
        description: 'List redacted login metadata for Vault Team controls.',
      },
      {
        name: 'listLoginMetadata',
        requiredPermission: 'manage_users',
        description: 'List redacted login metadata for team and member directory surfaces.',
      },
      {
        name: 'delegatePasswordReset',
        requiredPermission: 'manage_users',
        description: 'Delegate password reset email delivery to Cedros Login.',
      },
      {
        name: 'delegateTemporaryPassword',
        requiredPermission: 'manage_users',
        description: 'Fail closed because Cedros Login does not issue temporary passwords.',
      },
    ],
  };

function requireCedrosLogin(hostContext: HostContext): CedrosLoginHostService {
  const cedrosLogin = getHostService<CedrosLoginHostService>(
    hostContext,
    HOST_SERVICE_IDS.cedrosLogin
  );
  if (!cedrosLogin) {
    throw new Error('cedros-login-team-directory requires the cedros-login host service');
  }
  return cedrosLogin;
}

function extensionBaseUrl(hostContext: HostContext): string {
  const cedrosLogin = requireCedrosLogin(hostContext);
  return cedrosLoginExtensionBaseUrl(cedrosLogin.serverUrl);
}

function createPasswordResetApiClient(hostContext: HostContext): ApiClient {
  return new ApiClient({ baseUrl: extensionBaseUrl(hostContext) });
}

function createInviteApiClient(hostContext: HostContext): InviteApiClient {
  const cedrosLogin = requireCedrosLogin(hostContext);
  return new InviteApiClient(
    cedrosLoginExtensionBaseUrl(cedrosLogin.serverUrl),
    undefined,
    undefined,
    cedrosLogin.getAccessToken
  );
}

async function findOrganizationMemberEmail(
  memberApiClient: MemberApiClient,
  orgId: string,
  userId: string
): Promise<string> {
  const pageSize = 100;
  let offset = 0;
  let total = 0;

  do {
    const page = await memberApiClient.listMembers(orgId, pageSize, offset);
    total = page.total;
    const member = page.members.find((candidate) => candidate.userId === userId);
    if (member) {
      const email = member.user.email?.trim();
      if (!email) {
        throw new Error('cedros-login-team-directory member has no reset email');
      }
      return email;
    }
    if (page.members.length === 0) break;
    offset += page.members.length;
  } while (offset < total);

  throw new Error('cedros-login-team-directory user is not a member of the active organization');
}

// Org-scoped member roster client. Uses the extension-mounted base URL (the host
// mounts our wasm backend under /extensions/cedros-login, so a bare /orgs/* 404s).
function createMemberApiClient(hostContext: HostContext): MemberApiClient {
  const cedrosLogin = requireCedrosLogin(hostContext);
  return new MemberApiClient(
    cedrosLoginExtensionBaseUrl(cedrosLogin.serverUrl),
    undefined,
    undefined,
    cedrosLogin.getAccessToken
  );
}

function normalizeInviteRole(role?: string): Exclude<OrgRole, 'owner'> {
  const normalized = (role ?? '').trim().toLowerCase();
  if (normalized === 'admin' || normalized === 'administrator') return 'admin';
  // Member is the least-privileged invitable role; map unknown/empty roles to it
  // rather than depending on the server default. Owner is never invitable.
  return 'member';
}

// Roster/search/login + delegated password actions all require an active org with
// manage_users. Returns that org id and fails closed otherwise — there is no
// org-less fallback, so a host consumer without org context can never read the
// system-wide directory (the cross-tenant disclosure this guard closes).
function requireManageUsersOrgId(hostContext: HostContext): string {
  const org = getHostService<OrgHostService>(hostContext, HOST_SERVICE_IDS.org);
  const orgId = typeof org?.orgId === 'string' ? org.orgId.trim() : '';
  if (!org || !orgId) {
    throw new Error('cedros-login-team-directory requires an active organization');
  }
  if (!canManageUsers(org)) {
    throw new Error('cedros-login-team-directory requires manage_users permission');
  }
  return orgId;
}

function canManageUsers(org: OrgHostService): boolean {
  // Match the host's role vocabulary (Cedros Data normalizes to lower-case
  // "owner" / "administrator"); accept "admin" too and stay case-insensitive so
  // we don't fail closed on a user the host already treats as a top-level admin.
  const role = (typeof org.role === 'string' ? org.role : '').trim().toLowerCase();
  const permissions = Array.isArray(org.permissions)
    ? org.permissions.map((permission) => String(permission).trim().toLowerCase())
    : [];
  return (
    role === 'admin' ||
    role === 'administrator' ||
    role === 'owner' ||
    permissions.includes('admin') ||
    permissions.includes('administrator') ||
    permissions.includes('owner') ||
    permissions.includes('manage_users')
  );
}

function normalizeListParams(params?: ListUsersParams): Required<ListUsersParams> {
  // listMembers takes positional limit/offset, so resolve concrete defaults
  // (the admin seam's page size) rather than an optional params object.
  const limit = params?.limit;
  const offset = params?.offset;
  return {
    limit: limit !== undefined ? Math.min(Math.max(limit, 1), 100) : 50,
    offset: offset !== undefined ? Math.max(offset, 0) : 0,
  };
}

function requireUserId(input: UserActionInput): string {
  const userId =
    typeof input === 'string'
      ? input
      : input && typeof input === 'object' && typeof input.userId === 'string'
        ? input.userId
        : '';
  if (!userId.trim()) {
    throw new Error('cedros-login-team-directory requires a userId');
  }
  return userId.trim();
}

// Map an org membership to a directory entry. The member seam intentionally
// exposes only id/email/name (and joinedAt) — the cross-tenant fields the old
// system-wide /admin/users path leaked (emailVerified, authMethods, isSystemAdmin,
// lastLoginAt, picture) are not available here and are reported as empty/false.
function toDirectoryEntryFromMember(member: Member): CedrosLoginTeamDirectoryEntry {
  return {
    id: member.userId,
    email: member.user.email,
    emailVerified: false,
    name: member.user.name,
    picture: member.user.picture,
    authMethods: [],
    isSystemAdmin: false,
    createdAt: member.joinedAt,
    updatedAt: member.joinedAt,
  };
}
