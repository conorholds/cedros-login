import type { AuthUser, CrmIdentifyConfig } from '../types';

const DEFAULT_ENDPOINT = '/site/crm/identify-login';

export interface NotifyCrmIdentifyLoginArgs {
  config: CrmIdentifyConfig;
  user: AuthUser;
  accessToken: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  logger?: Pick<Console, 'debug' | 'warn'>;
}

export interface CrmIdentifyResponse {
  identified: boolean;
  profileId?: string;
  linkedAnalyticsVisitor: boolean;
}

/**
 * Result of a single identify attempt.
 *
 * - `'identified'`: server linked or recorded the login user.
 * - `'visitor-not-linked'`: server returned `linkedAnalyticsVisitor: false`
 *   (no `cedros_vid` cookie was sent).
 * - `'precondition-failed'`: server returned 428 — feature not configured.
 * - `'skipped'`: required config missing (disabled, no orgId, no token).
 * - `'failed'`: network/HTTP failure. Never thrown; only reported.
 */
export type CrmIdentifyOutcome =
  | { kind: 'identified'; response: CrmIdentifyResponse }
  | { kind: 'visitor-not-linked'; response: CrmIdentifyResponse }
  | { kind: 'precondition-failed' }
  | { kind: 'skipped'; reason: string }
  | { kind: 'failed'; status?: number; error?: unknown };

function isSameOriginEndpoint(endpoint: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const resolved = new URL(endpoint, window.location.origin);
    return resolved.origin === window.location.origin;
  } catch {
    return false;
  }
}

export async function notifyCrmIdentifyLogin({
  config,
  user,
  accessToken,
  timeoutMs = 5000,
  fetchImpl = fetch,
  logger = console,
}: NotifyCrmIdentifyLoginArgs): Promise<CrmIdentifyOutcome> {
  if (!config.enabled) return { kind: 'skipped', reason: 'disabled' };
  if (!config.orgId) return { kind: 'skipped', reason: 'missing-org-id' };
  if (!accessToken) return { kind: 'skipped', reason: 'missing-access-token' };

  const endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
  if (!isSameOriginEndpoint(endpoint)) {
    logger.warn('cedros-login: CRM identify endpoint must be same-origin; request skipped');
    return { kind: 'skipped', reason: 'cross-origin-endpoint' };
  }
  const eventId = config.getEventId ? config.getEventId(user) : `login:${user.id}:${Date.now()}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'x-cedros-org-id': config.orgId,
      },
      body: JSON.stringify({ eventId }),
      signal: controller.signal,
    });

    if (response.status === 428) {
      logger.debug(
        'cedros-login: CRM identify endpoint not configured (428); skipping further attempts'
      );
      return { kind: 'precondition-failed' };
    }
    if (!response.ok) {
      logger.warn(`cedros-login: CRM identify failed with HTTP ${response.status}`);
      return { kind: 'failed', status: response.status };
    }

    const body = (await response.json().catch(() => null)) as Partial<CrmIdentifyResponse> | null;
    const identified = Boolean(body?.identified);
    const linkedAnalyticsVisitor = Boolean(body?.linkedAnalyticsVisitor);
    const normalized: CrmIdentifyResponse = {
      identified,
      profileId: typeof body?.profileId === 'string' ? body.profileId : undefined,
      linkedAnalyticsVisitor,
    };
    if (!linkedAnalyticsVisitor) {
      logger.debug(
        'cedros-login: CRM identify succeeded without visitor link (cedros_vid cookie missing)'
      );
      return { kind: 'visitor-not-linked', response: normalized };
    }
    return { kind: 'identified', response: normalized };
  } catch (error) {
    logger.warn('cedros-login: CRM identify request errored', error);
    return { kind: 'failed', error };
  } finally {
    clearTimeout(timeout);
  }
}
