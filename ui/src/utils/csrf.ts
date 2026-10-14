// UI-CSRF: Minimum CSRF token length to prevent weak/trivial tokens
// Use 32 random bytes for the CSRF token.
const MIN_CSRF_TOKEN_LENGTH = 32;

export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;

  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    const content = metaTag.getAttribute('content');
    // UI-CSRF: Reject weak tokens
    if (content && content.length >= MIN_CSRF_TOKEN_LENGTH) {
      return content;
    }
  }

  // Use case-insensitive comparison for the canonical XSRF-TOKEN cookie.
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split('=');
    const value = rest.join('=');
    const nameLower = name.toLowerCase();
    if (nameLower === 'xsrf-token') {
      try {
        const decoded = decodeURIComponent(value.trim());
        // UI-CSRF: Reject weak tokens
        if (decoded.length >= MIN_CSRF_TOKEN_LENGTH) {
          return decoded;
        }
      } catch {
        // Malformed URL-encoded value - skip this cookie
        continue;
      }
    }
  }

  return null;
}
