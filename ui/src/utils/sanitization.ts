/**
 * Input sanitization utilities for security
 */

/**
 * Allowed image URL protocols
 */
const SAFE_PROTOCOLS = ['https:'];

/**
 * Dangerous protocols that should never be allowed
 */
const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

/**
 * Sanitizes an image URL to prevent XSS and other attacks.
 *
 * ## Security Properties
 *
 * - Only allows HTTPS URLs (prevents protocol-based attacks)
 * - Blocks javascript:, data:, vbscript:, file: protocols
 * - Returns undefined for invalid URLs
 *
 * ## Limitations
 *
 * This function validates the URL protocol but does NOT validate the domain.
 * Any HTTPS URL will pass validation, including URLs from untrusted domains.
 * This is intentional - domain allowlisting is application-specific and should
 * be implemented at the consumer level (see example below).
 *
 * If your application requires domain validation (e.g., only allowing images
 * from trusted CDNs), implement additional validation:
 *
 * @example Domain allowlisting (application-level)
 * ```ts
 * const ALLOWED_DOMAINS = ['cdn.example.com', 'images.trusted.org'];
 *
 * function isAllowedImageUrl(url: string): boolean {
 *   const sanitized = sanitizeImageUrl(url);
 *   if (!sanitized) return false;
 *
 *   try {
 *     const hostname = new URL(sanitized).hostname;
 *     return ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
 *   } catch {
 *     return false;
 *   }
 * }
 * ```
 *
 * @param url - The URL to sanitize
 * @returns The sanitized URL or undefined if invalid
 *
 * @example Basic usage
 * ```ts
 * sanitizeImageUrl('https://example.com/avatar.png') // 'https://example.com/avatar.png'
 * sanitizeImageUrl('javascript:alert(1)') // undefined
 * sanitizeImageUrl('data:image/svg+xml,...') // undefined
 * ```
 */
export function sanitizeImageUrl(url: string | undefined | null): string | undefined {
  if (!url || typeof url !== 'string') {
    return undefined;
  }

  // Trim whitespace
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return undefined;
  }

  // Check for dangerous protocols (case-insensitive)
  const lowerUrl = trimmedUrl.toLowerCase();
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (lowerUrl.startsWith(protocol)) {
      return undefined;
    }
  }

  // Try to parse as URL
  try {
    const parsed = new URL(trimmedUrl);

    // Only allow safe protocols
    if (!SAFE_PROTOCOLS.includes(parsed.protocol)) {
      return undefined;
    }

    // Return the original URL (preserves case)
    return trimmedUrl;
  } catch {
    // Invalid URL
    return undefined;
  }
}

/**
 * Sanitizes an external link URL for use in href attributes.
 *
 * Security goals:
 * - Block dangerous protocols (javascript:, data:, vbscript:, file:)
 * - Only allow http/https absolute URLs
 */
export function sanitizeExternalUrl(url: string | undefined | null): string | undefined {
  if (!url || typeof url !== 'string') {
    return undefined;
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return undefined;
  }

  const lowerUrl = trimmedUrl.toLowerCase();
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (lowerUrl.startsWith(protocol)) {
      return undefined;
    }
  }

  try {
    const parsed = new URL(trimmedUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return undefined;
    }
    return trimmedUrl;
  } catch {
    return undefined;
  }
}
