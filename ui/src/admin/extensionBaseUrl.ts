/**
 * Cedros platform mounts an installed extension's wasm backend under
 * `/extensions/{extensionId}`, and hands the React admin module a `serverUrl`
 * pointing at the host origin. So the admin surface must address its own routes
 * at `{serverUrl}/extensions/cedros-login{path}` — e.g.
 * `{serverUrl}/extensions/cedros-login/admin/users`, not `{serverUrl}/admin/users`
 * (which the host 404s). See 12-admin-pages-and-dashboard-cards.md
 * ("An installed extension's React admin module ... calls its backend at
 * `{serverUrl}/extensions/{id}{path}`").
 *
 * Build the extension-mounted base URL here so every admin API client and the
 * team-directory host service stay consistent. Standalone mode does NOT use this
 * (it talks to the cedros-login server directly, where routes live at `/admin/*`).
 */
export const CEDROS_LOGIN_EXTENSION_ROUTE_PREFIX = '/extensions/cedros-login';

export function cedrosLoginExtensionBaseUrl(serverUrl: string | undefined): string {
  const origin = (serverUrl ?? '').replace(/\/+$/, '');
  if (!origin) return CEDROS_LOGIN_EXTENSION_ROUTE_PREFIX;
  // Idempotent: never double-prefix if a host ever provides an already-mounted URL.
  if (origin.endsWith(CEDROS_LOGIN_EXTENSION_ROUTE_PREFIX)) return origin;
  return `${origin}${CEDROS_LOGIN_EXTENSION_ROUTE_PREFIX}`;
}
