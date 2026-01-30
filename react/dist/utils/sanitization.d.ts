/**
 * Input sanitization utilities for security
 */
/**
 * Sanitizes an image URL to prevent XSS and other attacks.
 *
 * ## Security Properties
 *
 * - Only allows HTTPS URLs (prevents protocol-based attacks)
 * - Blocks javascript:, data:, vbscript:, file: protocols
 * - Returns undefined for invalid URLs
 *
 * ## Limitations (S-20/SEC-08)
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
export declare function sanitizeImageUrl(url: string | undefined | null): string | undefined;
/**
 * Sanitizes an external link URL for use in href attributes.
 *
 * Security goals:
 * - Block dangerous protocols (javascript:, data:, vbscript:, file:)
 * - Only allow http/https absolute URLs
 */
export declare function sanitizeExternalUrl(url: string | undefined | null): string | undefined;
/**
 * Sanitizes user-provided text to prevent XSS in text content.
 * Escapes HTML special characters.
 *
 * @param text - The text to sanitize
 * @returns The sanitized text
 */
export declare function sanitizeText(text: string | undefined | null): string;
