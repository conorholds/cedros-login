import { createContext } from 'react';
import type { CedrosLoginConfig, AuthUser, AuthState, AuthError, TokenPair } from '../types';
import type { FeatureFlagName, ResolvedFeatureFlags } from '../featureFlags';

/**
 * Internal helpers for auth hooks (not part of public API)
 */
export interface CedrosLoginInternalAPI {
  handleLoginSuccess: (user: AuthUser, tokens?: TokenPair) => void;
  getAccessToken: () => string | null;
  /** Get the referral code captured from the ?ref= URL parameter (if any) */
  getReferralCode: () => string | null;
}

/**
 * Auth state context — changes only on login/logout/token refresh.
 *
 * Subscribing to this context alone avoids re-renders from UI state
 * changes (modal open/close, error display).
 */
export interface AuthStateContextValue {
  config: CedrosLoginConfig;
  featureFlags: ResolvedFeatureFlags;
  isFeatureEnabled: (name: FeatureFlagName) => boolean;
  user: AuthUser | null;
  authState: AuthState;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /** Display order for social login buttons (from server auto-discovery). */
  socialButtonOrder?: string[];
  _internal?: CedrosLoginInternalAPI;
}

/**
 * UI state context — changes on modal/error state changes.
 *
 * Subscribing to this context alone avoids re-renders from auth state
 * changes (login, token refresh).
 */
export interface AuthUIContextValue {
  error: AuthError | null;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export interface CedrosLoginContextValue extends AuthStateContextValue, AuthUIContextValue {}

export const AuthStateContext = createContext<AuthStateContextValue | null>(null);
export const AuthUIContext = createContext<AuthUIContextValue | null>(null);
