import { useExternalEffect } from '../../../hooks/effects';
/**
 * Server settings page - infrastructure configuration with tabs
 *
 * Tab visibility:
 * - Logging, Metrics, Security: always visible.
 */
import { useMemo, useState } from 'react';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { ErrorMessage } from '../../shared/ErrorMessage';
import { useSettingsAutosave } from '../../../hooks/useSettingsAutosave';
import { SettingsSection } from './settingsInputs';
import { AutosaveStatus } from './AutosaveStatus';
import { useI18n, type Translations } from '../../../i18n';

type ServerTab = 'logging' | 'metrics' | 'security';

interface TabConfig {
  id: ServerTab;
  /** Categories to pull settings from (defaults to ['server']) */
  categories?: string[];
  keys: string[];
}

const TABS: TabConfig[] = [
  {
    id: 'logging',
    keys: ['server_log_level'],
  },
  {
    id: 'metrics',
    keys: ['server_metrics_api_key'],
  },
  {
    id: 'security',
    categories: ['security', 'features'],
    keys: ['feature_mfa', 'security_cors_origins', 'security_session_timeout'],
  },
];

export interface ServerSettingsProps {
  className?: string;
}

export function ServerSettings({ className }: ServerSettingsProps) {
  const { t, message } = useI18n();
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

  const visibleTabs = TABS;

  // Default to first visible tab
  const [activeTab, setActiveTab] = useState<ServerTab | null>(null);

  // Set initial tab when tabs become available
  useExternalEffect(() => {
    if (activeTab === null && visibleTabs.length > 0) {
      setActiveTab(visibleTabs[0].id);
    } else if (activeTab && !visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id ?? null);
    }
  }, [visibleTabs, activeTab]);

  useExternalEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Get current tab config
  const currentTab = visibleTabs.find((t) => t.id === activeTab);

  // Collect settings from all categories for the current tab
  const currentSettings = useMemo(() => {
    if (!currentTab) return [];
    const categories = currentTab.categories ?? ['server'];
    const allSettings: (typeof settings)[string] = [];
    for (const category of categories) {
      const categorySettings = settings[category] ?? [];
      allSettings.push(...categorySettings);
    }
    // Filter by keys and sort by keys order
    return allSettings
      .filter((s) => currentTab.keys.includes(s.key))
      .sort((a, b) => currentTab.keys.indexOf(a.key) - currentTab.keys.indexOf(b.key));
  }, [settings, currentTab]);

  if (isLoading && Object.keys(settings).length === 0) {
    return (
      <div className={`cedros-system-settings cedros-system-settings-loading ${className ?? ''}`}>
        <LoadingSpinner />
        <span>{t.admin.settings.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`cedros-system-settings ${className ?? ''}`}>
        <ErrorMessage error={error.message} />
      </div>
    );
  }

  return (
    <div className={`cedros-system-settings ${className ?? ''}`}>
      <div className="cedros-settings-page-header">
        <div className="cedros-settings-page-header-content">
          <h2 className="cedros-settings-page-title">{t.admin.settings.serverTitle}</h2>
          <p className="cedros-settings-page-description">{t.admin.settings.serverDescription}</p>
        </div>
        <AutosaveStatus status={autosaveStatus} error={autosaveError} />
      </div>

      {/* Tabs */}
      <div className="cedros-admin-tabs cedros-admin-tabs--line">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`cedros-admin-tab ${activeTab === tab.id ? 'cedros-admin-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tabLabel(tab.id, t)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="cedros-admin-tab-content" role="tabpanel">
        {currentSettings.length === 0 ? (
          <div className="cedros-system-settings-empty">
            <p>
              {message(t.admin.settings.noSettingsFor, {
                label: currentTab ? tabLabel(currentTab.id, t) : t.admin.settings.empty,
              })}
            </p>
          </div>
        ) : (
          <SettingsSection
            settings={currentSettings}
            edits={edits}
            onChange={handleChange}
            manualCommit={{
              onConfirm: confirmManualSetting,
              onCancel: discardManualSetting,
              isSaving: isManualSettingSaving,
              getError: getManualSettingError,
            }}
          />
        )}
      </div>
    </div>
  );
}

function tabLabel(tab: ServerTab, t: Translations): string {
  switch (tab) {
    case 'logging':
      return t.admin.settings.serverLoggingTab;
    case 'metrics':
      return t.admin.settings.serverMetricsTab;
    case 'security':
      return t.admin.settings.serverSecurityTab;
  }
}
