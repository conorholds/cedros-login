import { Suspense, createElement, lazy, useState } from 'react';

import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { useExternalEffect } from '../hooks/effects';
import { AccountWorkspaceShell } from './visualBuilderRenderers';

const InteractiveAccountWorkspace = lazy(() => import('./interactiveAccountWorkspace'));

/**
 * Public `cedros-login:account-workspace` block.
 *
 * First-paints with a portable static shell so SSR stays deterministic, then
 * swaps to the real account settings experience once the browser can mount the
 * Cedros Login provider and check the current session.
 *
 * The lazy island is wrapped in an error boundary that falls back to the
 * static shell: the host SSRs installed extension blocks as empty placeholders,
 * so an uncaught chunk-load or render error would otherwise unmount the root
 * and leave the page blank.
 */
export function AccountWorkspaceBlock({
  props,
  runtimeBaseUrl,
  colorMode,
}: {
  props: Record<string, unknown>;
  runtimeBaseUrl?: string;
  colorMode?: 'light' | 'dark';
}) {
  const mounted = useBrowserMounted();
  const shell = createElement(AccountWorkspaceShell, { props, colorMode });
  if (!mounted) return shell;
  return createElement(
    ErrorBoundary,
    { fallback: shell },
    createElement(
      Suspense,
      { fallback: shell },
      createElement(InteractiveAccountWorkspace, { props, runtimeBaseUrl, colorMode })
    )
  );
}

function useBrowserMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useExternalEffect(() => setMounted(true), []);
  return mounted;
}
