import { DisplayError } from '../../types';
export interface ErrorMessageProps {
    error: DisplayError;
    className?: string;
    onDismiss?: () => void;
    /** If true, focus the error message when it appears (for accessibility) */
    autoFocus?: boolean;
}
/**
 * Error message display component with accessibility support.
 * Announces errors to screen readers and optionally focuses the message.
 * Wrapped with React.memo to prevent unnecessary re-renders.
 */
export declare const ErrorMessage: import('react').NamedExoticComponent<ErrorMessageProps>;
