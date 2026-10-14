import { useExternalEffect } from '../../hooks/effects';
/**
 * QR Code component for TOTP setup
 *
 * Generates QR codes client-side using the qrcode library.
 * SECURITY: Never sends the TOTP secret to external services.
 *
 * The `qrcode` library is loaded on demand (dynamic import) rather than as a
 * static dependency. This keeps it — and its transitive `dijkstrajs` dep — out
 * of the eagerly-loaded account/settings chunks, which the Cedros host bundler
 * fails to load (its import scanner mis-parses a string literal inside
 * dijkstrajs). On-demand loading also degrades gracefully: if the chunk can't
 * load, the error placeholder shows and TotpSetup still offers the manual secret.
 */

import { useRef, useState } from 'react';

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
export function QrCode({ value, size = 200, alt = 'QR code', className = '' }: QrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useExternalEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    let cancelled = false;

    import('qrcode')
      .then((mod) => {
        if (cancelled) return undefined;
        // `qrcode` is CommonJS; tolerate either interop shape for the default.
        const QRCode = mod.default ?? mod;
        return QRCode.toCanvas(canvas, value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });
      })
      .then(() => {
        // Clear any previous error on successful generation
        if (!cancelled) setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (error) {
    return (
      <div
        className={`cedros-qr-error ${className}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label={alt}
      >
        <p>Failed to generate QR code</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`cedros-totp-qr-image ${className}`}
      role="img"
      aria-label={alt}
      style={{ borderRadius: '0.5rem' }}
    />
  );
}
