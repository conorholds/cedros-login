import { CedrosLoginContextValue } from './CedrosLoginContext';
/**
 * Hook to access the Cedros Login context.
 * Must be used within a CedrosLoginProvider.
 */
export declare function useCedrosLogin(): CedrosLoginContextValue;
/**
 * Optional version of useCedrosLogin that returns null instead of throwing
 * when used outside a CedrosLoginProvider. Useful for components that need
 * to work in both provider and non-provider contexts (e.g., Storybook demos).
 */
export declare function useCedrosLoginOptional(): CedrosLoginContextValue | null;
