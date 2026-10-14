/**
 * Admin dashboard sections that can be permission-controlled.
 *
 * Cedros Login exposes three sidebar entries (`users`, `team`, `login`). The
 * `login` entry is the single consolidated Login admin page; legacy per-feature
 * keys (`settings-auth`, `settings-email`, etc.) have been removed because the
 * pages they gated no longer exist. Persisted permission blobs that still
 * contain those keys deserialize without error — extra keys are preserved
 * silently and ignored.
 */
export type DashboardSection =
  // Cedros Login sections
  | 'users'
  | 'team'
  | 'login'
  // Cedros Affiliates sections
  | 'referrals'
  | 'settings-referrals';

/**
 * Cedros Login dashboard sections.
 */
export const LOGIN_DASHBOARD_SECTIONS: DashboardSection[] = ['users', 'team', 'login'];

export const AFFILIATES_DASHBOARD_SECTIONS: DashboardSection[] = [
  'referrals',
  'settings-referrals',
];

/**
 * Human-readable labels for dashboard sections.
 */
export const DASHBOARD_SECTION_LABELS: Record<DashboardSection, string> = {
  users: 'Users',
  team: 'Team',
  login: 'Login',
  referrals: 'Referrals',
  'settings-referrals': 'Referrals & Rewards',
};

/**
 * Dashboard permissions per role.
 *
 * Owners always have full access; only admin and member permissions are configurable.
 */
export interface DashboardPermissions {
  admin: Record<DashboardSection, boolean>;
  member: Record<DashboardSection, boolean>;
}

/**
 * Default dashboard permissions for new orgs.
 */
export const DEFAULT_DASHBOARD_PERMISSIONS: DashboardPermissions = {
  admin: {
    users: true,
    team: true,
    login: true,
    referrals: true,
    'settings-referrals': true,
  },
  member: {
    users: false,
    team: true,
    login: false,
    referrals: false,
    'settings-referrals': false,
  },
};
