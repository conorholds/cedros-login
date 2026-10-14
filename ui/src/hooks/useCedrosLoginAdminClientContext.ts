import { useMemo } from 'react';

import type { AuthState, AuthUser, CedrosLoginConfig } from '../types';
import {
  useCedrosLoginAdminRuntimeOptional,
  type CedrosLoginAdminRuntimeValue,
} from '../admin/CedrosLoginAdminRuntimeContext';

export interface CedrosLoginAdminClientContextValue {
  config: Pick<CedrosLoginConfig, 'serverUrl' | 'requestTimeout' | 'retryAttempts'>;
  user: AuthUser | null;
  authState: AuthState;
  _internal: {
    getAccessToken: () => string | null;
  };
}

function toClientContext(
  adminRuntime: CedrosLoginAdminRuntimeValue | null
): CedrosLoginAdminClientContextValue | null {
  if (!adminRuntime) {
    return null;
  }

  return {
    config: adminRuntime.config,
    user: adminRuntime.user,
    authState: adminRuntime.authState,
    _internal: {
      getAccessToken: adminRuntime.getAccessToken,
    },
  };
}

export function useCedrosLoginAdminClientContextOptional(): CedrosLoginAdminClientContextValue | null {
  const adminRuntime = useCedrosLoginAdminRuntimeOptional();
  return useMemo(() => toClientContext(adminRuntime), [adminRuntime]);
}

/**
 * Returns the shared transport/auth inputs used by login admin hooks.
 *
 * The contributed admin module provides the runtime bridge.
 */
export function useCedrosLoginAdminClientContext(): CedrosLoginAdminClientContextValue {
  const value = useCedrosLoginAdminClientContextOptional();

  if (value) {
    return value;
  }

  throw new Error('Login admin hooks require CedrosLoginAdminRuntimeProvider');
}
