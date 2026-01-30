import { CSSProperties } from 'react';
export interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    style?: CSSProperties;
    /** Custom label for screen readers (default: "Loading") */
    label?: string;
    /** If true, announce the loading state to screen readers */
    announce?: boolean;
}
/**
 * Accessible loading spinner component.
 * Announces loading state to screen readers when announce prop is true.
 * Wrapped with React.memo to prevent unnecessary re-renders.
 */
export declare const LoadingSpinner: import('react').NamedExoticComponent<LoadingSpinnerProps>;
