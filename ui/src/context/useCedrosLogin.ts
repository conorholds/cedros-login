import { useContext } from 'react';
import {
  AuthStateContext,
  AuthUIContext,
  type AuthStateContextValue,
  type AuthUIContextValue,
  type CedrosLoginContextValue,
} from './CedrosLoginContext';

/**
 * Hook to access the full Cedros Login context.
 * Must be used within a CedrosLoginProvider.
 *
 * For better performance, prefer `useAuthState()` or `useAuthUI()` when you
 * only need a subset of the context. This hook re-renders on any change.
 */
export function useCedrosLogin(): CedrosLoginContextValue {
  const authState = useContext(AuthStateContext);
  const authUI = useContext(AuthUIContext);
  if (!authState || !authUI) {
    throw new Error('useCedrosLogin must be used within a CedrosLoginProvider');
  }
  return { ...authState, ...authUI };
}

/**
 * Optional version of useCedrosLogin that returns null instead of throwing
 * when used outside a CedrosLoginProvider. Useful for components that need
 * to work in both provider and non-provider contexts.
 */
export function useCedrosLoginOptional(): CedrosLoginContextValue | null {
  const authState = useContext(AuthStateContext);
  const authUI = useContext(AuthUIContext);
  return authState && authUI ? { ...authState, ...authUI } : null;
}

/**
 * Hook to access only auth state (user, authState, config, logout, refreshUser).
 *
 * Does NOT re-render on UI state changes (modal, error). Use this in components
 * that only need to know about authentication status.
 */
export function useAuthState(): AuthStateContextValue {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within a CedrosLoginProvider');
  }
  return context;
}

/**
 * Hook to access only UI state (isModalOpen, error, openModal, closeModal).
 *
 * Does NOT re-render on auth state changes (login, token refresh). Use this
 * in components that only control the login modal or display errors.
 */
export function useAuthUI(): AuthUIContextValue {
  const context = useContext(AuthUIContext);
  if (!context) {
    throw new Error('useAuthUI must be used within a CedrosLoginProvider');
  }
  return context;
}
