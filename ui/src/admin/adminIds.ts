/**
 * Qualified Cedros admin section ids for the cedros-login plugin.
 *
 * Only rendered section ids are exposed here. Legacy ids covered by the
 * consolidated Login section live in `replacesSectionIds` on the registered
 * section so they cannot be reintroduced as live sidebar entries.
 */
export const CEDROS_LOGIN_ADMIN_SECTION_IDS = {
  users: 'cedros-login:users',
  team: 'cedros-login:team',
  teamInvites: 'cedros-login:team-invites',
  /** Consolidated Login admin page for extension-owned configuration. */
  login: 'cedros-login:login',
} as const;
