/**
 * Device detection utilities
 */

/**
 * Detects if the current device is an Apple device (macOS, iOS, iPadOS).
 * Apple Sign In is most useful on Apple devices where users have Apple ID readily available.
 *
 * @returns true if running on an Apple device
 *
 * @example
 * ```tsx
 * if (isAppleDevice()) {
 *   // Show Apple Sign In button
 * }
 * ```
 */
export function isAppleDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();

  // Check for iOS devices (iPhone, iPad, iPod)
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return true;
  }

  // Check for macOS
  if (platform.includes('mac') || /macintosh/.test(userAgent)) {
    return true;
  }

  // Check for iPad on iOS 13+ (reports as MacIntel but has touch)
  if (platform === 'macintel' && navigator.maxTouchPoints > 1) {
    return true;
  }

  return false;
}
