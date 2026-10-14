import { Suspense, createElement, lazy, useState, useSyncExternalStore } from 'react';

import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { useExternalEffect } from '../hooks/effects';
import { AuthFormShell, authFormModeProp, type AuthFormMode } from './authFormBlockRenderer';
import { CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE } from './visualBuilderIds';

const InteractiveAuthForm = lazy(() => import('./interactiveAuthForm'));

/**
 * Public `cedros-login:auth-form` block.
 *
 * Server-renders the presentational {@link AuthFormShell} for static public
 * pages. If the browser is hydrating that shell, the first client render keeps
 * it in place so React sees matching markup, then swaps every supported mode
 * to the real interactive {@link InteractiveAuthForm}
 * after mount. Client-only host rendering has no SSR shell to preserve, so the
 * lazy-load fallback is blank instead of flashing the placeholder form first.
 *
 */
export function AuthFormBlock({
  props,
  runtimeBaseUrl,
  colorMode,
}: {
  props: Record<string, unknown>;
  runtimeBaseUrl?: string;
  colorMode?: 'light' | 'dark';
}) {
  const mode = authFormModeProp(props.mode);
  const { preserveShell, hasInitialHydrationShell } = useHydrationShellState(mode);
  const shell = createElement(AuthFormShell, {
    props,
    suppressClientConditionalProviderButtons: true,
    colorMode,
  });
  if (preserveShell) return shell;
  // If the interactive chunk fails, report a fail-closed error instead of
  // leaving a presentational form that appears to accept credentials.
  return createElement(
    ErrorBoundary,
    { fallback: createElement(AuthRuntimeFailure) },
    createElement(
      Suspense,
      { fallback: hasInitialHydrationShell ? shell : null },
      createElement(InteractiveAuthForm, { props, runtimeBaseUrl, colorMode })
    )
  );
}

function AuthRuntimeFailure() {
  return createElement(
    'div',
    { className: 'cedros-error', role: 'alert' },
    'Authentication is temporarily unavailable. Please reload and try again.'
  );
}

function useHydrationShellState(mode: AuthFormMode): {
  preserveShell: boolean;
  hasInitialHydrationShell: boolean;
} {
  const hasInitialHydrationShell = useSyncExternalStore(
    subscribeToHydrationShellSnapshot,
    () => hasExistingAuthFormShell(mode),
    () => true
  );
  const [preserveShell, setPreserveShell] = useState(() => hasInitialHydrationShell);

  useExternalEffect(() => {
    if (preserveShell) setPreserveShell(false);
  }, [preserveShell]);

  return { preserveShell, hasInitialHydrationShell };
}

function subscribeToHydrationShellSnapshot() {
  return () => {};
}

function hasExistingAuthFormShell(mode: AuthFormMode): boolean {
  if (typeof document === 'undefined') return true;
  return Boolean(
    document.querySelector(
      `[data-cedros-block="${CEDROS_LOGIN_AUTH_FORM_BLOCK_TYPE}"][data-auth-mode="${mode}"] .cedros-auth-form__panel`
    )
  );
}
