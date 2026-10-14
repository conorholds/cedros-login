import { useMemo, useState, type ReactNode } from 'react';

import {
  CedrosLoginAdminRuntimeContext,
  type CedrosLoginEarlyAccessHost,
  type CedrosLoginEarlyAccessState,
  type CedrosLoginPasskeyDefaultsEndpoint,
  type CedrosLoginAdminRuntimeValue,
} from './CedrosLoginAdminRuntimeContext';
import type { AuthUser } from '../types';
import { CEDROS_LOGIN_EXTENSION_ID } from '../extension/manifest';
import {
  CedrosLoginAdminOverlayContext,
  type CedrosLoginAdminOverlayHost,
} from './CedrosLoginAdminOverlayContext';
import type { AdminSectionProps } from './types';

interface CedrosLoginPluginData {
  user?: {
    id: string;
    email?: string;
    name?: string;
    picture?: string;
  } | null;
  cedrosLoginPasskeyDefaults?: unknown;
  cedrosPayInstalled?: unknown;
  cedrosLoginEarlyAccess?: unknown;
}

interface PasskeyDefaultsEndpointFields {
  serverUrl?: unknown;
  path?: unknown;
  url?: unknown;
}

function normalizeAdminUser(user: CedrosLoginPluginData['user']): AuthUser | null {
  return user
    ? {
        authMethods: [],
        emailVerified: false,
        createdAt: '',
        updatedAt: '',
        ...user,
      }
    : null;
}

function normalizePasskeyDefaultsEndpoint(
  value: unknown,
  trustedServerUrl: string
): CedrosLoginPasskeyDefaultsEndpoint | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const {
    serverUrl: rawServerUrl,
    path: rawPath,
    url: rawUrl,
  } = value as PasskeyDefaultsEndpointFields;
  const serverUrl = typeof rawServerUrl === 'string' ? rawServerUrl.trim() : '';
  const path = typeof rawPath === 'string' ? rawPath.trim() : '';
  const url = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (!serverUrl || !path) return undefined;
  if (!hasTrustedOrigin(serverUrl, trustedServerUrl)) return undefined;
  return { serverUrl, path: path.startsWith('/') ? path : `/${path}`, ...(url ? { url } : {}) };
}

function hasTrustedOrigin(serverUrl: string, trustedServerUrl: string): boolean {
  const trustedOrigin = parseOrigin(trustedServerUrl);
  if (!trustedOrigin) return false;
  return parseOrigin(serverUrl, trustedOrigin) === trustedOrigin;
}

function normalizeEarlyAccessState(value: unknown): CedrosLoginEarlyAccessState {
  if (!value || typeof value !== 'object') {
    throw new Error('Cedros Data returned an invalid early-access state.');
  }
  const state = value as Record<string, unknown>;
  if (
    typeof state.available !== 'boolean' ||
    typeof state.editable !== 'boolean' ||
    typeof state.waitlistModeEnabled !== 'boolean' ||
    typeof state.enabled !== 'boolean'
  ) {
    throw new Error('Cedros Data returned an invalid early-access state.');
  }
  return {
    available: state.available,
    editable: state.editable,
    waitlistModeEnabled: state.waitlistModeEnabled,
    enabled: state.enabled,
  };
}

function normalizeEarlyAccessHost(value: unknown): CedrosLoginEarlyAccessHost | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const host = value as Record<string, unknown>;
  const getState = host.getState;
  const setEnabled = host.setEnabled;
  if (typeof getState !== 'function' || typeof setEnabled !== 'function') {
    return undefined;
  }
  return {
    getState: async () => normalizeEarlyAccessState(await getState.call(value)),
    setEnabled: async (enabled) => normalizeEarlyAccessState(await setEnabled.call(value, enabled)),
  };
}

function parseOrigin(value: string, base?: string): string | undefined {
  try {
    if (base) return new URL(value, base).origin;
    if (typeof window !== 'undefined') return new URL(value, window.location.origin).origin;
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

function isExtensionRuntime(serverUrl: string): boolean {
  try {
    const path = new URL(serverUrl, 'https://cedros.invalid').pathname.replace(/\/+$/, '');
    return path.endsWith(`/extensions/${CEDROS_LOGIN_EXTENSION_ID}`);
  } catch {
    return false;
  }
}

function buildRuntimeValue(
  pluginContext: AdminSectionProps['pluginContext']
): CedrosLoginAdminRuntimeValue {
  const pluginData = pluginContext.pluginData as CedrosLoginPluginData | undefined;
  const user = normalizeAdminUser(pluginData?.user);

  return {
    config: {
      serverUrl: pluginContext.serverUrl,
    },
    user,
    authState: user ? 'authenticated' : 'unauthenticated',
    getAccessToken: pluginContext.getAccessToken,
    passkeyDefaultsEndpoint: normalizePasskeyDefaultsEndpoint(
      pluginData?.cedrosLoginPasskeyDefaults,
      pluginContext.serverUrl
    ),
    cedrosPayInstalled:
      typeof pluginData?.cedrosPayInstalled === 'boolean'
        ? pluginData.cedrosPayInstalled
        : undefined,
    earlyAccessHost: normalizeEarlyAccessHost(pluginData?.cedrosLoginEarlyAccess),
    extensionRuntime: isExtensionRuntime(pluginContext.serverUrl),
  };
}

export function CedrosLoginAdminRuntimeProvider({
  pluginContext,
  children,
}: {
  pluginContext: AdminSectionProps['pluginContext'];
  children: ReactNode;
}) {
  const value = useMemo(() => buildRuntimeValue(pluginContext), [pluginContext]);
  const [overlay, setOverlay] = useState<{ ownerId: string; content: ReactNode } | null>(null);
  const overlayHost = useMemo<CedrosLoginAdminOverlayHost>(
    () => ({
      show: (ownerId, content) => setOverlay({ ownerId, content }),
      hide: (ownerId) => setOverlay((current) => (current?.ownerId === ownerId ? null : current)),
    }),
    []
  );

  return (
    <CedrosLoginAdminRuntimeContext.Provider value={value}>
      <CedrosLoginAdminOverlayContext.Provider value={overlayHost}>
        <div
          className="cedros-login-admin-root cedros-data"
          data-extension-id={CEDROS_LOGIN_EXTENSION_ID}
        >
          {children}
          {overlay?.content}
        </div>
      </CedrosLoginAdminOverlayContext.Provider>
    </CedrosLoginAdminRuntimeContext.Provider>
  );
}
