/**
 * Organization role in RBAC hierarchy
 * owner > admin > member
 */
export type OrgRole = 'owner' | 'admin' | 'member';

/**
 * Organization entity
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  isPersonal: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Membership - user's relationship to an organization
 */
export interface Membership {
  id?: string;
  userId?: string;
  orgId?: string;
  role: OrgRole;
  joinedAt?: string;
}

/**
 * Organization with membership details for the current user
 */
export interface OrgWithMembership extends Organization {
  membership: Membership;
}

/**
 * Permission types for RBAC
 */
export type Permission =
  | 'org:delete'
  | 'org:update'
  | 'org:read'
  | 'member:invite'
  | 'member:remove'
  | 'member:role_change'
  | 'member:read'
  | 'invite:create'
  | 'invite:cancel'
  | 'invite:read'
  | 'audit:read';

/**
 * Create organization request
 */
export interface CreateOrgRequest {
  name: string;
  slug?: string;
}

/**
 * Update organization request
 */
export interface UpdateOrgRequest {
  name?: string;
  slug?: string;
  logoUrl?: string;
}

/**
 * List organizations response
 */
export interface ListOrgsResponse {
  orgs: Array<Organization & { role: OrgRole }>;
  total?: number;
  limit?: number;
  offset?: number;
}

/**
 * Authorization check request
 */
export interface AuthorizeRequest {
  orgId: string;
  action: string;
  resource?: string;
  resourceId?: string;
}

/**
 * Authorization check response
 */
export interface AuthorizeResponse {
  allowed: boolean;
  reason?: string;
}

/**
 * Permissions response
 */
export interface PermissionsResponse {
  permissions: Permission[];
  role: OrgRole;
}

/**
 * Organization state for context
 */
export interface OrgState {
  /** Currently active organization */
  activeOrg: OrgWithMembership | null;
  /** All organizations the user belongs to */
  orgs: OrgWithMembership[];
  /** User's permissions in the active org */
  permissions: Permission[];
  /** User's role in the active org */
  role: OrgRole | null;
  /** Loading state for org operations */
  isLoading: boolean;
}

// =============================================================================
// DASHBOARD PERMISSIONS
// =============================================================================

/**
 * Admin dashboard sections that can be permission-controlled
 */
export type DashboardSection =
  // Cedros Login sections
  | 'users'
  | 'team'
  | 'deposits'
  | 'withdrawals'
  | 'settings-wallet'
  | 'settings-auth'
  | 'settings-messaging'
  | 'settings-credits'
  | 'settings-server'
  // Cedros Pay sections
  | 'pay-products'
  | 'pay-subscriptions'
  | 'pay-transactions'
  | 'pay-coupons'
  | 'pay-refunds'
  | 'pay-storefront'
  | 'pay-ai'
  | 'pay-payment'
  | 'pay-messaging'
  | 'pay-settings';

/**
 * Cedros Login dashboard sections
 */
export const LOGIN_DASHBOARD_SECTIONS: DashboardSection[] = [
  'users',
  'team',
  'deposits',
  'withdrawals',
  'settings-wallet',
  'settings-auth',
  'settings-messaging',
  'settings-credits',
  'settings-server',
];

/**
 * Cedros Pay dashboard sections
 */
export const PAY_DASHBOARD_SECTIONS: DashboardSection[] = [
  'pay-products',
  'pay-subscriptions',
  'pay-transactions',
  'pay-coupons',
  'pay-refunds',
  'pay-storefront',
  'pay-ai',
  'pay-payment',
  'pay-messaging',
  'pay-settings',
];

/**
 * All available dashboard sections
 */
export const ALL_DASHBOARD_SECTIONS: DashboardSection[] = [
  ...LOGIN_DASHBOARD_SECTIONS,
  ...PAY_DASHBOARD_SECTIONS,
];

/**
 * Human-readable labels for dashboard sections
 */
export const DASHBOARD_SECTION_LABELS: Record<DashboardSection, string> = {
  // Cedros Login
  users: 'Users',
  team: 'Team',
  deposits: 'Deposits',
  withdrawals: 'Withdrawals',
  'settings-wallet': 'Wallet Settings',
  'settings-auth': 'Auth Settings',
  'settings-messaging': 'Messages Settings',
  'settings-credits': 'Credits Settings',
  'settings-server': 'Server Settings',
  // Cedros Pay
  'pay-products': 'Products',
  'pay-subscriptions': 'Subscriptions',
  'pay-transactions': 'Transactions',
  'pay-coupons': 'Coupons',
  'pay-refunds': 'Refunds',
  'pay-storefront': 'Storefront',
  'pay-ai': 'Store AI',
  'pay-payment': 'Payment Options',
  'pay-messaging': 'Store Messages',
  'pay-settings': 'Store Server',
};

/**
 * Dashboard permissions per role
 * Only admin and member are configurable - owner always has full access
 */
export interface DashboardPermissions {
  admin: Record<DashboardSection, boolean>;
  member: Record<DashboardSection, boolean>;
}

/**
 * Default dashboard permissions for new orgs
 */
export const DEFAULT_DASHBOARD_PERMISSIONS: DashboardPermissions = {
  admin: {
    // Cedros Login
    users: true,
    team: true,
    deposits: true,
    withdrawals: true,
    'settings-wallet': true,
    'settings-auth': true,
    'settings-messaging': true,
    'settings-credits': true,
    'settings-server': true,
    // Cedros Pay
    'pay-products': true,
    'pay-subscriptions': true,
    'pay-transactions': true,
    'pay-coupons': true,
    'pay-refunds': true,
    'pay-storefront': true,
    'pay-ai': true,
    'pay-payment': true,
    'pay-messaging': true,
    'pay-settings': true,
  },
  member: {
    // Cedros Login
    users: false,
    team: true,
    deposits: false,
    withdrawals: false,
    'settings-wallet': false,
    'settings-auth': false,
    'settings-messaging': false,
    'settings-credits': false,
    'settings-server': false,
    // Cedros Pay
    'pay-products': false,
    'pay-subscriptions': false,
    'pay-transactions': false,
    'pay-coupons': false,
    'pay-refunds': false,
    'pay-storefront': false,
    'pay-ai': false,
    'pay-payment': false,
    'pay-messaging': false,
    'pay-settings': false,
  },
};
