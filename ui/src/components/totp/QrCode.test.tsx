import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QrCode } from './QrCode';

const toCanvas = vi.fn();

// `qrcode` is loaded on demand via dynamic import; mock both interop shapes.
vi.mock('qrcode', () => ({
  default: { toCanvas: (...args: unknown[]) => toCanvas(...args) },
}));

describe('QrCode', () => {
  beforeEach(() => {
    toCanvas.mockReset();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a canvas and generates the QR from the value on demand', async () => {
    toCanvas.mockResolvedValue(undefined);

    render(<QrCode value="otpauth://totp/demo" size={120} alt="account QR" />);

    const canvas = screen.getByRole('img', { name: 'account QR' });
    expect(canvas.tagName).toBe('CANVAS');
    await waitFor(() => expect(toCanvas).toHaveBeenCalled());
    expect(toCanvas).toHaveBeenCalledWith(
      canvas,
      'otpauth://totp/demo',
      expect.objectContaining({ width: 120 })
    );
  });

  it('shows the error placeholder when QR generation fails', async () => {
    toCanvas.mockRejectedValue(new Error('boom'));

    render(<QrCode value="otpauth://totp/demo" alt="account QR" />);

    await waitFor(() => expect(screen.getByText('Failed to generate QR code')).toBeInTheDocument());
  });
});
