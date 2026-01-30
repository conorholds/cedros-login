export interface AppleLoginButtonProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    className?: string;
    variant?: 'default' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    /**
     * Hide the button on non-Apple devices (macOS, iOS, iPadOS).
     * When true (default), button only renders on Apple devices.
     * When false, button always renders regardless of device.
     * @default true
     */
    hideOnNonApple?: boolean;
}
/**
 * Apple Sign In button
 *
 * Requires `appleClientId` to be configured in CedrosLoginProvider.
 *
 * @example
 * ```tsx
 * <AppleLoginButton
 *   onSuccess={() => console.log('Logged in!')}
 *   onError={(err) => console.error(err)}
 * />
 * ```
 */
export declare function AppleLoginButton({ onSuccess, onError, className, variant, size, disabled, hideOnNonApple, }: AppleLoginButtonProps): import("react/jsx-runtime").JSX.Element | null;
