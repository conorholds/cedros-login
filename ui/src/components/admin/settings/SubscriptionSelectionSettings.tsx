import { useMemo } from 'react';
import type { SettingMeta, SystemSetting } from '../../../types';
import { AuthMethodCard } from './AuthMethodCard';

const SUBSCRIPTION_SELECTION_KEYS = [
  'subscription_selection_required',
  'subscription_selection_route',
] as const;

const SUBSCRIPTION_SELECTION_CONFIG_KEYS = ['subscription_selection_route'] as const;

const SUBSCRIPTION_SELECTION_METADATA: Record<string, SettingMeta> = {
  subscription_selection_required: {
    key: 'subscription_selection_required',
    label: 'Require subscription selection',
    description:
      'After registration and later logins, users must choose a Cedros Pay plan before continuing.',
    inputType: 'boolean',
  },
  subscription_selection_route: {
    key: 'subscription_selection_route',
    label: 'Plan chooser page',
    description: 'The page users are sent to when they still need to pick a plan.',
    inputType: 'path',
    placeholder: 'pricing',
  },
};

interface SubscriptionSelectionSettingsProps {
  byKey: Record<string, SystemSetting>;
  edits: Record<string, string>;
  onChange: (key: string, value: string) => void;
  cedrosPayInstalled?: boolean;
}

export function SubscriptionSelectionSettings({
  byKey,
  edits,
  onChange,
  cedrosPayInstalled,
}: SubscriptionSelectionSettingsProps) {
  const settings = useMemo(
    () =>
      SUBSCRIPTION_SELECTION_KEYS.map((key) => byKey[key]).filter(
        (setting): setting is SystemSetting => Boolean(setting)
      ),
    [byKey]
  );

  if (settings.length === 0) {
    return null;
  }

  if (cedrosPayInstalled === false) {
    return (
      <div className="cedros-setting-row" role="status" aria-live="polite">
        <div className="cedros-setting-label">
          <span className="cedros-setting-name">Subscription selection is blocked</span>
          <span className="cedros-setting-description">
            Install Cedros Pay before requiring users to choose a subscription plan.
          </span>
        </div>
        <div className="cedros-setting-control">
          <span className="cedros-auth-method-badge">Blocked</span>
        </div>
      </div>
    );
  }

  return (
    <AuthMethodCard
      enabledKey="subscription_selection_required"
      configKeys={SUBSCRIPTION_SELECTION_CONFIG_KEYS}
      byKey={byKey}
      edits={edits}
      onChange={onChange}
      metadata={SUBSCRIPTION_SELECTION_METADATA}
    />
  );
}
