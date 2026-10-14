import { createContext, useContext } from 'react';
import type { AuthState, AuthUser, CedrosLoginConfig } from '../types';

export interface CedrosLoginPasskeyDefaultsEndpoint {
  serverUrl: string;
  path: string;
  url?: string;
}

export interface CedrosLoginEarlyAccessState {
  available: boolean;
  editable: boolean;
  waitlistModeEnabled: boolean;
  enabled: boolean;
}

export interface CedrosLoginEarlyAccessHost {
  getState: () => Promise<CedrosLoginEarlyAccessState>;
  setEnabled: (enabled: boolean) => Promise<CedrosLoginEarlyAccessState>;
}

export interface CedrosLoginAdminRuntimeValue {
  config: Pick<CedrosLoginConfig, 'serverUrl' | 'requestTimeout' | 'retryAttempts'>;
  user: AuthUser | null;
  authState: AuthState;
  getAccessToken: () => string | null;
  passkeyDefaultsEndpoint?: CedrosLoginPasskeyDefaultsEndpoint;
  cedrosPayInstalled?: boolean;
  earlyAccessHost?: CedrosLoginEarlyAccessHost;
  /** True when the admin is mounted against the Cedros extension route namespace. */
  extensionRuntime?: boolean;
}

export const CedrosLoginAdminRuntimeContext = createContext<CedrosLoginAdminRuntimeValue | null>(
  null
);

export function useCedrosLoginAdminRuntimeOptional(): CedrosLoginAdminRuntimeValue | null {
  return useContext(CedrosLoginAdminRuntimeContext);
}
