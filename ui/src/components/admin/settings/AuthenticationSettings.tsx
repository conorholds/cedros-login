import { useExternalEffect } from '../../../hooks/effects';
/**
 * Authentication settings page - auth methods, behavior, and advanced options.
 *
 * Five tabs:
 *  - Methods:  email / google / apple / solana / passkey / SSO as toggle-to-expand
 *              provider cards (mirrors the host Providers page).
 *  - Behavior: post-login flow + social button order.
 *  - Advanced: two-factor authentication + instant link.
 *  - Signup limits: UTC calendar-period registration caps.
 *  - Invite codes: invite code policy and admin-created codes.
 */
import { useState, useMemo, useId, type KeyboardEvent, type ReactNode } from 'react';
import type { SystemSetting } from '../../../types';
import { useSettingsAutosave } from '../../../hooks/useSettingsAutosave';
import { SettingsSection, type ManualSettingCommitControls } from './settingsInputs';
import { AuthMethodCard } from './AuthMethodCard';
import { AutosaveStatus } from './AutosaveStatus';
import { PasskeySettingsCard } from './PasskeySettingsCard';
import { SsoProvidersSettings } from './SsoProvidersSettings';
import { SocialButtonOrderSettings } from './SocialButtonOrderSettings';
import { InviteCodeSettings } from './InviteCodeSettings';
import { SignupLimitSettings } from './SignupLimitSettings';
import { PostLoginFlowOrderSettings } from './PostLoginFlowOrderSettings';
import { useCedrosLoginAdminRuntimeOptional } from '../../../admin/CedrosLoginAdminRuntimeContext';
import { useI18n } from '../../../i18n';

type AuthTab = 'methods' | 'behavior' | 'advanced' | 'signupLimits' | 'inviteCodes';

type SettingsMap = Record<string, SystemSetting[]>;
type ByKey = Record<string, SystemSetting>;

interface PanelProps {
  byKey: ByKey;
  edits: Record<string, string>;
  onChange: (key: string, value: string) => void;
  manualCommit: ManualSettingCommitControls;
}

export interface AuthenticationSettingsProps {
  className?: string;
  cedrosPayInstalled?: boolean;
}

export function AuthenticationSettings({
  className,
  cedrosPayInstalled: cedrosPayInstalledProp,
}: AuthenticationSettingsProps) {
  const { t } = useI18n();
  const adminRuntime = useCedrosLoginAdminRuntimeOptional();
  const {
    settings,
    edits,
    isLoading,
    autosaveStatus,
    autosaveError,
    error,
    fetchSettings,
    handleChange,
    confirmManualSetting,
    discardManualSetting,
    isManualSettingSaving,
    getManualSettingError,
  } = useSettingsAutosave();

  const [activeTab, setActiveTab] = useState<AuthTab>('methods');
  const tabsId = useId();

  useExternalEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Flat key -> setting lookup so cards/panels can pick keys regardless of the
  // server's category grouping.
  const byKey = useMemo<ByKey>(() => {
    const map: ByKey = {};
    for (const list of Object.values(settings)) {
      for (const setting of list) map[setting.key] = setting;
    }
    return map;
  }, [settings]);
  const cedrosPayInstalled = cedrosPayInstalledProp ?? adminRuntime?.cedrosPayInstalled;
  const manualCommit: ManualSettingCommitControls = {
    onConfirm: confirmManualSetting,
    onCancel: discardManualSetting,
    isSaving: isManualSettingSaving,
    getError: getManualSettingError,
  };

  const tabs: { id: AuthTab; label: string }[] = [
    { id: 'methods', label: t.admin.settings.methodsTab },
    { id: 'behavior', label: t.admin.settings.behaviorTab },
    { id: 'advanced', label: t.admin.settings.advancedTab },
    { id: 'signupLimits', label: t.admin.settings.signupLimitsTab },
    { id: 'inviteCodes', label: t.admin.settings.inviteCodesTab },
  ];

  if (isLoading && Object.keys(settings).length === 0) {
    return (
      <div
        className={`cedros-system-settings cedros-auth-settings cedros-data-stack ${className ?? ''}`}
        aria-busy="true"
      >
        <div className="cedros-data__header cedros-settings-page-header">
          <div className="cedros-data__header-text cedros-settings-page-header-content">
            <h2 className="cedros-data__title cedros-settings-page-title">
              {t.admin.settings.authTitle}
            </h2>
            <p className="cedros-data__subtitle cedros-settings-page-description">
              {t.admin.settings.authDescription}
            </p>
          </div>
        </div>
        <div className="cedros-data-card cedros-login-admin-skeleton" role="status">
          <span className="cedros-sr-only">{t.admin.settings.loading}</span>
          <span className="cedros-login-admin-skeleton__line" />
          <span className="cedros-login-admin-skeleton__line cedros-login-admin-skeleton__line--short" />
        </div>
        <div className="cedros-data-card cedros-login-admin-skeleton" aria-hidden="true">
          <span className="cedros-login-admin-skeleton__line cedros-login-admin-skeleton__line--short" />
          <span className="cedros-login-admin-skeleton__line" />
        </div>
        <div className="cedros-data-card cedros-login-admin-skeleton" aria-hidden="true">
          <span className="cedros-login-admin-skeleton__line cedros-login-admin-skeleton__line--short" />
          <span className="cedros-login-admin-skeleton__line" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div
          className={`cedros-system-settings cedros-auth-settings cedros-data-stack ${className ?? ''}`}
        >
          <div className="cedros-data__header cedros-settings-page-header">
            <div className="cedros-data__header-text cedros-settings-page-header-content">
              <h2 className="cedros-data__title cedros-settings-page-title">
                {t.admin.settings.authTitle}
              </h2>
              <p className="cedros-data__subtitle cedros-settings-page-description">
                {t.admin.settings.authDescription}
              </p>
            </div>
          </div>
          <div className="cedros-data-status cedros-data-status--error" role="alert">
            <span>{t.admin.settings.authLoadError}</span>
            <div className="cedros-data-status__actions">
              <button
                type="button"
                className="cedros-data-btn cedros-data-btn--secondary cedros-data-btn--sm"
                onClick={() => void fetchSettings()}
              >
                {t.common.retry}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const content = (
    <div
      className={`cedros-system-settings cedros-auth-settings cedros-data-stack ${className ?? ''}`}
    >
      <div className="cedros-data__header cedros-settings-page-header">
        <div className="cedros-data__header-text cedros-settings-page-header-content">
          <h2 className="cedros-data__title cedros-settings-page-title">
            {t.admin.settings.authTitle}
          </h2>
          <p className="cedros-data__subtitle cedros-settings-page-description">
            {t.admin.settings.authDescription}
          </p>
        </div>
        <div className="cedros-data-actions">
          <AutosaveStatus status={autosaveStatus} error={autosaveError} />
        </div>
      </div>

      <div className="cedros-data-tabs cedros-auth-tabs">
        <div
          className="cedros-data-tabs__list cedros-admin-tabs cedros-admin-tabs--pill"
          role="tablist"
          aria-label={t.admin.login.sectionAriaLabel}
          onKeyDown={(event) => handleTabKeyDown(event, tabs, activeTab, setActiveTab)}
        >
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;
            const tabId = `${tabsId}-${tab.id}-tab`;
            const panelId = `${tabsId}-${tab.id}-panel`;
            return (
              <button
                key={tab.id}
                id={tabId}
                type="button"
                className={`cedros-data-tabs__tab cedros-admin-tab ${selected ? 'cedros-admin-tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                aria-selected={selected}
                aria-controls={panelId}
                role="tab"
                tabIndex={selected ? 0 : -1}
                data-auth-tab-id={tab.id}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`${tabsId}-${activeTab}-panel`}
        className="cedros-data-tabs__panel cedros-admin-tab-content"
        role="tabpanel"
        aria-labelledby={`${tabsId}-${activeTab}-tab`}
      >
        {activeTab === 'methods' && (
          <MethodsPanel
            byKey={byKey}
            edits={edits}
            onChange={handleChange}
            manualCommit={manualCommit}
          />
        )}
        {activeTab === 'behavior' && (
          <BehaviorPanel
            settings={settings}
            byKey={byKey}
            edits={edits}
            onChange={handleChange}
            manualCommit={manualCommit}
            cedrosPayInstalled={cedrosPayInstalled}
          />
        )}
        {activeTab === 'advanced' && (
          <AdvancedPanel
            byKey={byKey}
            edits={edits}
            onChange={handleChange}
            manualCommit={manualCommit}
          />
        )}
        {activeTab === 'inviteCodes' && (
          <InviteCodesPanel
            byKey={byKey}
            edits={edits}
            onChange={handleChange}
            manualCommit={manualCommit}
            onRefreshSettings={fetchSettings}
          />
        )}
        {activeTab === 'signupLimits' && (
          <SignupLimitSettings
            byKey={byKey}
            edits={edits}
            onChange={handleChange}
            manualCommit={manualCommit}
          />
        )}
      </div>
    </div>
  );

  return content;
}

function handleTabKeyDown(
  event: KeyboardEvent<HTMLDivElement>,
  tabs: { id: AuthTab; label: string }[],
  activeTab: AuthTab,
  setActiveTab: (tab: AuthTab) => void
) {
  const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
  let nextIndex = currentIndex;

  if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
  else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  else if (event.key === 'Home') nextIndex = 0;
  else if (event.key === 'End') nextIndex = tabs.length - 1;
  else return;

  event.preventDefault();
  const nextTab = tabs[nextIndex]?.id;
  if (!nextTab) return;

  setActiveTab(nextTab);
  event.currentTarget.querySelector<HTMLButtonElement>(`[data-auth-tab-id="${nextTab}"]`)?.focus();
}

function MethodsPanel({ byKey, edits, onChange, manualCommit }: PanelProps) {
  const { t } = useI18n();
  const card = (title: string, enabledKey: string, configKeys?: string[], children?: ReactNode) => (
    <AuthMethodCard
      title={title}
      enabledKey={enabledKey}
      configKeys={configKeys}
      byKey={byKey}
      edits={edits}
      onChange={onChange}
      manualCommit={manualCommit}
    >
      {children}
    </AuthMethodCard>
  );

  return (
    <div className="cedros-auth-method-list">
      {card(t.auth.providers.email, 'auth_email_enabled', [
        'auth_email_require_verification',
        'auth_email_block_disposable',
      ])}
      {card(t.auth.providers.google, 'auth_google_enabled', ['auth_google_client_id'])}
      {card(t.auth.providers.apple, 'auth_apple_enabled', [
        'auth_apple_client_id',
        'auth_apple_team_id',
      ])}
      {/* Challenge expiry is intentionally not surfaced; it stays at the 5-minute
          default (auth_solana_challenge_expiry) so admins don't have to tune it. */}
      {card(t.auth.providers.solana, 'auth_solana_enabled')}
      <PasskeySettingsCard byKey={byKey} edits={edits} onChange={onChange} />
      {card(
        t.admin.settings.ssoTitle,
        'feature_sso',
        undefined,
        <SsoProvidersSettings hideHeader />
      )}
    </div>
  );
}

function BehaviorPanel({
  settings,
  byKey,
  edits,
  onChange,
  manualCommit,
  cedrosPayInstalled,
}: PanelProps & { settings: SettingsMap; cedrosPayInstalled?: boolean }) {
  const { t } = useI18n();
  const redirectSettings = useMemo(
    () => [byKey.postlogin_redirect_url].filter((s): s is SystemSetting => Boolean(s)),
    [byKey]
  );

  return (
    <div className="cedros-auth-section-stack">
      <section className="cedros-auth-subsection">
        <h3 className="cedros-auth-subsection-title">{t.admin.settings.socialOrderTitle}</h3>
        <SocialButtonOrderSettings settings={settings} handleChange={onChange} />
      </section>
      <section className="cedros-auth-subsection">
        <h3 className="cedros-auth-subsection-title">{t.admin.settings.postLoginTitle}</h3>
        <div className="cedros-auth-method-list">
          <PostLoginFlowOrderSettings
            byKey={byKey}
            edits={edits}
            onChange={onChange}
            cedrosPayInstalled={cedrosPayInstalled}
          />
          {redirectSettings.length > 0 && (
            <SettingsSection
              settings={redirectSettings}
              edits={edits}
              onChange={onChange}
              manualCommit={manualCommit}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function AdvancedPanel({ byKey, edits, onChange, manualCommit }: PanelProps) {
  const { t } = useI18n();
  return (
    <div className="cedros-auth-method-list">
      <AuthMethodCard
        title={t.admin.settings.twoFactorTitle}
        enabledKey="feature_mfa"
        configKeys={['security_require_mfa']}
        byKey={byKey}
        edits={edits}
        onChange={onChange}
        manualCommit={manualCommit}
      />
      <AuthMethodCard
        enabledKey="auth_new_device_alert_enabled"
        byKey={byKey}
        edits={edits}
        onChange={onChange}
        manualCommit={manualCommit}
      />
      <AuthMethodCard
        title={t.auth.providers.instantLink}
        enabledKey="auth_instantlink_enabled"
        configKeys={['auth_instantlink_expiry', 'auth_instantlink_rate_limit']}
        byKey={byKey}
        edits={edits}
        onChange={onChange}
        manualCommit={manualCommit}
      />
    </div>
  );
}

function InviteCodesPanel({
  byKey,
  edits,
  onChange,
  onRefreshSettings,
}: PanelProps & { onRefreshSettings: () => Promise<void> }) {
  return (
    <InviteCodeSettings
      byKey={byKey}
      edits={edits}
      onChange={onChange}
      onRefreshSettings={onRefreshSettings}
    />
  );
}
