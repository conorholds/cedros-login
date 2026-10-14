import { Component, type ReactNode, type ErrorInfo } from 'react';

export interface ErrorBoundaryProps {
  /** Child components to render (optional so createElement call sites can pass children positionally) */
  children?: ReactNode;
  /** Custom fallback UI to show when an error occurs */
  fallback?: ReactNode;
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details (useful for development) */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors in child components.
 * Prevents the entire app from crashing and shows a fallback UI.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={<div>Something went wrong</div>}
 *   onError={(error) => logError(error)}
 * >
 *   <LoginForm />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Always log errors (not just development) for production visibility
    console.error('[Cedros Login] Error caught by ErrorBoundary:', error);
    console.error('[Cedros Login] Component stack:', errorInfo.componentStack);

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    if (hasError) {
      // Custom fallback provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div className="cedros-error-boundary" role="alert" aria-live="assertive">
          <div className="cedros-error-boundary-content">
            <svg
              className="cedros-error-boundary-icon"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>

            <h2 className="cedros-error-boundary-title">Something went wrong</h2>

            <p className="cedros-error-boundary-message">
              We encountered an unexpected error. Please try again.
            </p>

            {showDetails && error && (
              <details className="cedros-error-boundary-details">
                <summary>Error details</summary>
                <pre>
                  {error.toString()}
                  {errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <button
              type="button"
              className="cedros-button cedros-button-primary"
              onClick={this.handleRetry}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}
