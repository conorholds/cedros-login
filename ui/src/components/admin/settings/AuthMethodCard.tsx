/**
 * AuthMethodCard - a toggle-to-expand auth method card.
 *
 * Mirrors the host "Providers" page: a status badge + switch in the header, and
 * the method's configuration fields/options revealed only when it is enabled.
 */
import type { ReactNode } from 'react';
import type { SettingMeta, SystemSetting } from '../../../types';
import { SettingsSection, type ManualSettingCommitControls } from './settingsInputs';
import { renderDescription } from './settingsDescription';
import { useLocalizedSettingMetadata } from './localizedSettingsMetadata';
import { useTranslations } from '../../../i18n';
import { CollapsibleBody } from '../../shared/MotionPrimitives';

export interface AuthMethodCardProps {
  /** Display name shown in the card header. Defaults to the enable setting's label. */
  title?: string;
  /** Boolean setting key that toggles this method on/off. */
  enabledKey: string;
  /** Config setting keys revealed when the method is enabled. */
  configKeys?: readonly string[];
  /** Flat key -> setting lookup across all categories. */
  byKey: Record<string, SystemSetting>;
  edits: Record<string, string>;
  onChange: (key: string, value: string) => void;
  manualCommit?: ManualSettingCommitControls;
  externalWarnings?: Record<string, string>;
  /** Optional metadata for settings outside the shared metadata catalog. */
  metadata?: Record<string, SettingMeta>;
  /** Reveal the body before enablement when setup must be completed first. */
  forceBodyOpen?: boolean;
  bodyPrefix?: ReactNode;
  /** Extra content rendered in the body (e.g. the SSO provider list). */
  children?: ReactNode;
}

export function AuthMethodCard({
  title,
  enabledKey,
  configKeys = [],
  byKey,
  edits,
  onChange,
  manualCommit,
  externalWarnings,
  metadata,
  forceBodyOpen = false,
  bodyPrefix,
  children,
}: AuthMethodCardProps) {
  const t = useTranslations();
  const { settingMetadata } = useLocalizedSettingMetadata();

  const enabledSetting = byKey[enabledKey];
  const isEnabled = (edits[enabledKey] ?? enabledSetting?.value ?? 'false') === 'true';
  const meta = metadata?.[enabledKey] ?? settingMetadata[enabledKey];
  const resolvedTitle = title ?? meta?.label ?? enabledKey;
  const description = meta?.description;
  const configSettings = configKeys
    .map((key) => byKey[key])
    .filter((setting): setting is SystemSetting => Boolean(setting));
  const isBodyOpen = isEnabled || forceBodyOpen;

  return (
    <div
      className={`cedros-data-card cedros-auth-method-card ${isEnabled ? 'cedros-auth-method-card--enabled' : ''}`}
    >
      <div className="cedros-data-card__header cedros-auth-method-card-header">
        <div className="cedros-auth-method-card-info">
          <div className="cedros-auth-method-card-title-row">
            <span className="cedros-data-card__title cedros-auth-method-card-name">
              {resolvedTitle}
            </span>
            <span
              className={`cedros-data-pill cedros-auth-method-badge ${isEnabled ? 'cedros-data-pill--success cedros-auth-method-badge--on' : ''}`}
            >
              {isEnabled ? t.common.enabled : t.common.disabled}
            </span>
          </div>
          {description && (
            <p className="cedros-auth-method-card-description">{renderDescription(description)}</p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          aria-label={resolvedTitle}
          className={`cedros-toggle ${isEnabled ? 'cedros-toggle-on' : 'cedros-toggle-off'}`}
          onClick={() => onChange(enabledKey, isEnabled ? 'false' : 'true')}
          disabled={!enabledSetting}
        >
          <span className="cedros-toggle-track">
            <span className="cedros-toggle-thumb" />
          </span>
        </button>
      </div>

      {(configSettings.length > 0 || bodyPrefix || children) && (
        <CollapsibleBody open={isBodyOpen}>
          <div className="cedros-data-card__body cedros-auth-method-card-body">
            {bodyPrefix}
            {configSettings.length > 0 && (
              <SettingsSection
                settings={configSettings}
                edits={edits}
                onChange={onChange}
                manualCommit={manualCommit}
                externalWarnings={externalWarnings}
                metadata={metadata}
              />
            )}
            {children}
          </div>
        </CollapsibleBody>
      )}
    </div>
  );
}
