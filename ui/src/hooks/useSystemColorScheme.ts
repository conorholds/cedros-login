import { useSyncExternalStore } from 'react';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function canMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

function subscribeToSchemeChanges(onStoreChange: () => void): () => void {
  if (!canMatchMedia()) return () => {};
  const mediaQuery = window.matchMedia(DARK_SCHEME_QUERY);
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function getSystemPrefersDark(): boolean {
  return canMatchMedia() && window.matchMedia(DARK_SCHEME_QUERY).matches;
}

/**
 * Tracks the visitor's OS/browser color-scheme preference.
 *
 * Side-effect-free (no DOM class mutation) and live: re-renders when the
 * preference changes. Returns `false` during SSR.
 */
export function useSystemPrefersDark(): boolean {
  return useSyncExternalStore(subscribeToSchemeChanges, getSystemPrefersDark, () => false);
}
