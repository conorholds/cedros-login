import { render, screen } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { CedrosLoginAdminRuntimeProvider } from '../../../admin/CedrosLoginAdminRuntimeProvider';
import type { AdminSectionProps } from '../../../admin/types';
import type { SystemSetting } from '../../../types';
import type { UseSettingsAutosaveReturn } from '../../../hooks/useSettingsAutosave';
import { AuthenticationSettings } from './AuthenticationSettings';

const fetchSettings = vi.fn();
export const handleChange: (key: string, value: string) => void = vi.fn();

export function renderSettings({ cedrosPayInstalled }: { cedrosPayInstalled?: boolean } = {}) {
  const pluginContext: AdminSectionProps['pluginContext'] = {
    getAccessToken: vi.fn(() => 'admin-token'),
    hasPermission: vi.fn(() => true),
    pluginData: cedrosPayInstalled === undefined ? undefined : { cedrosPayInstalled },
    serverUrl: 'https://auth.example.com/extensions/cedros-login',
  };

  return render(
    <CedrosLoginAdminRuntimeProvider pluginContext={pluginContext}>
      <AuthenticationSettings />
    </CedrosLoginAdminRuntimeProvider>
  );
}

export function createBehaviorAutosaveState(
  flowOrder = 'subscription,username,welcome,profile',
  options: { includeSubscription?: boolean } = {}
): UseSettingsAutosaveReturn {
  const settings: Record<string, SystemSetting[]> = {
    postlogin: [
      setting('postlogin_flow_order', flowOrder),
      setting('postlogin_username_enabled', 'false'),
      setting('postlogin_welcome_enabled', 'false'),
      setting('postlogin_welcome_route', '/welcome'),
      setting('postlogin_complete_enabled', 'false'),
      setting('postlogin_redirect_url', ''),
    ],
    'postlogin.subscription': [
      setting('subscription_selection_required', 'false'),
      setting('subscription_selection_route', '/subscribe'),
      setting('subscription_selection_pay_base_url', 'https://saved-pay.example.test'),
      setting('team_plan_seat_limits', '{"individual":1,"business":"unlimited"}'),
    ],
  };
  if (options.includeSubscription === false) delete settings['postlogin.subscription'];

  return {
    settings,
    edits: {},
    isLoading: false,
    autosaveStatus: 'idle',
    autosaveError: null,
    hasManualChanges: false,
    manualChangeCount: 0,
    isManualSaving: false,
    manualSaveError: null,
    confirmManualSetting: vi.fn(),
    discardManualSetting: vi.fn(),
    isManualSettingSaving: vi.fn(() => false),
    getManualSettingError: vi.fn(() => null),
    error: null,
    fetchSettings,
    handleChange,
    getEffectiveValue: (key) => key,
    flushAutosave: vi.fn(),
    saveManualChanges: vi.fn(),
    resetManualChanges: vi.fn(),
  };
}

export function expectTextOrder(labels: string[]) {
  for (let index = 0; index < labels.length - 1; index += 1) {
    const current = screen.getByText(labels[index]);
    const next = screen.getByText(labels[index + 1]);
    expect(Boolean(current.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(
      true
    );
  }
}

function setting(key: string, value: string): SystemSetting {
  return {
    key,
    value,
    description: null,
    isSecret: false,
    updatedAt: '2026-01-01T00:00:00.000Z',
    updatedBy: null,
  };
}
