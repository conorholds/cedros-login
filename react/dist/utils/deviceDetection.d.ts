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
export declare function isAppleDevice(): boolean;
