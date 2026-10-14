import type { AuthError } from '../types';

/**
 * True when `hostname` is an IP literal (IPv4 dotted-quad or IPv6, with or
 * without brackets).
 *
 * WebAuthn requires the caller origin's effective domain to be a valid DNS
 * domain, so browsers reject IP-address origins with `SecurityError` — even
 * loopback ones like `127.0.0.1` that are otherwise secure contexts. Only the
 * literal `localhost` hostnames get the plain-HTTP carve-out.
 */
export function isIpAddressHostname(hostname: string | undefined): boolean {
  if (!hostname) return false;
  const host =
    hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;
  return host.includes(':') || /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

/**
 * Map DOMExceptions thrown by `navigator.credentials.create()/get()` to
 * user-facing auth errors. Returns `null` for anything unrecognized so the
 * caller's API error handling can take over.
 *
 * @param hostname Current page hostname; defaults to `window.location.hostname`
 * (injectable for tests / SSR-safe).
 */
export function mapWebAuthnDomError(
  err: unknown,
  hostname: string | undefined = typeof window !== 'undefined'
    ? window.location?.hostname
    : undefined
): AuthError | null {
  if (!(err instanceof Error)) return null;
  // DOMExceptions inherit from Error in modern browsers.
  const name = err.name;

  // User cancelled, dismissed, timed out, or no available credential.
  if (name === 'NotAllowedError' || name === 'AbortError') {
    return { code: 'SERVER_ERROR', message: 'Passkey operation was cancelled or timed out' };
  }

  // Common for trying to create a credential that already exists (or unusable state).
  if (name === 'InvalidStateError') {
    return { code: 'VALIDATION_ERROR', message: 'Passkey is not available for this operation' };
  }

  // Thrown for non-secure contexts, or RP ID / origin mismatches.
  if (name === 'SecurityError') {
    // Browsers reject IP-address origins outright (the RP ID must be a DNS
    // domain), so no relying-party config can make e.g. 127.0.0.1 work.
    if (isIpAddressHostname(hostname)) {
      return {
        code: 'VALIDATION_ERROR',
        message: `Passkeys cannot be used when the site is opened via an IP address (${hostname}). Open it via http://localhost or an HTTPS domain instead`,
      };
    }
    return {
      code: 'VALIDATION_ERROR',
      message:
        'Passkeys require HTTPS and a correctly configured relying party (WEBAUTHN_RP_ID / WEBAUTHN_RP_ORIGIN)',
    };
  }

  return null;
}
