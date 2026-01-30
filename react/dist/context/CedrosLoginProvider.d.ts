import { ReactNode } from 'react';
import { CedrosLoginConfig } from '../types';
export interface CedrosLoginProviderProps {
    config: CedrosLoginConfig;
    children: ReactNode;
}
/**
 * Provider component that wraps your app and provides authentication context.
 *
 * @example
 * ```tsx
 * <CedrosLoginProvider config={{ serverUrl: 'https://api.example.com' }}>
 *   <App />
 * </CedrosLoginProvider>
 * ```
 */
export declare function CedrosLoginProvider({ config, children }: CedrosLoginProviderProps): import("react/jsx-runtime").JSX.Element;
