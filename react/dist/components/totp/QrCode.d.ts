/**
 * QR Code component for TOTP setup
 *
 * Generates QR codes client-side using the qrcode library.
 * SECURITY: Never sends the TOTP secret to external services.
 */
export interface QrCodeProps {
    /** The data to encode in the QR code (e.g., otpauth:// URL) */
    value: string;
    /** Size in pixels (width and height) */
    size?: number;
    /** Alt text for accessibility */
    alt?: string;
    /** Additional CSS class */
    className?: string;
}
/**
 * Renders a QR code as a canvas element.
 * Generated entirely client-side for security.
 */
export declare function QrCode({ value, size, alt, className }: QrCodeProps): import("react/jsx-runtime").JSX.Element;
