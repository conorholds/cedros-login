import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders nothing when error is null', () => {
    const { container } = render(<ErrorMessage error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders string error message', () => {
    render(<ErrorMessage error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders AuthError object message', () => {
    const error = {
      code: 'VALIDATION_ERROR' as const,
      message: 'Invalid email address',
    };
    render(<ErrorMessage error={error} />);
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ErrorMessage error="Error" className="custom-error" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-error');
    expect(alert).toHaveClass('cedros-error');
  });

  it('renders dismiss button when onDismiss is provided', () => {
    const onDismiss = vi.fn();
    render(<ErrorMessage error="Error" onDismiss={onDismiss} />);
    const dismissButton = screen.getByRole('button', { name: 'Dismiss error' });
    expect(dismissButton).toBeInTheDocument();
  });

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(<ErrorMessage error="Error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorMessage error="Error" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss error' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('has aria-live attribute for accessibility', () => {
    render(<ErrorMessage error="Error" />);
    // Use assertive for errors so screen readers announce immediately
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  it('escapes HTML in error messages (XSS protection)', () => {
    // React JSX automatically escapes HTML in text content
    // This test documents that malicious HTML is rendered as text, not executed
    const maliciousError = '<script>alert("xss")</script>';
    render(<ErrorMessage error={maliciousError} />);

    // The script tag should be visible as text, not executed
    expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();

    // The alert element should not contain actual script elements
    const alert = screen.getByRole('alert');
    expect(alert.querySelector('script')).toBeNull();
  });

  it('escapes HTML in AuthError messages (XSS protection)', () => {
    const maliciousError = {
      code: 'SERVER_ERROR' as const,
      message: '<img src=x onerror=alert("xss")>',
    };
    render(<ErrorMessage error={maliciousError} />);

    // The malicious HTML should be visible as text
    expect(screen.getByText('<img src=x onerror=alert("xss")>')).toBeInTheDocument();

    // No img elements should be rendered
    const alert = screen.getByRole('alert');
    expect(alert.querySelector('img')).toBeNull();
  });
});
