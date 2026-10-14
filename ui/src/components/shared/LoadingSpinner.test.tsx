import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('width', '24');
    expect(spinner).toHaveAttribute('height', '24');
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('width', '16');
    expect(spinner).toHaveAttribute('height', '16');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('width', '32');
    expect(spinner).toHaveAttribute('height', '32');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('custom-class');
    expect(spinner).toHaveClass('cedros-spinner');
  });

  it('applies custom style', () => {
    render(<LoadingSpinner style={{ color: 'red' }} />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('has accessible aria-label', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with aria-live region when announce is true', () => {
    render(<LoadingSpinner announce={true} label="Loading data" />);
    // Should have sr-only text for screen readers
    const srText = screen.getByText('Loading data');
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('cedros-sr-only');
  });

  it('has aria-busy attribute when announcing', () => {
    const { container } = render(<LoadingSpinner announce={true} />);
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-busy', 'true');
  });

  it('uses CSS animation so reduced-motion styles can disable spinner motion', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('animateTransform')).not.toBeInTheDocument();
  });
});
