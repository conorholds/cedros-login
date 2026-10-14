/**
 * Settings input components - reusable inputs for system settings
 */
import { useCallback, useMemo, useState } from 'react';
import type { SystemSetting, SettingMeta } from '../../../types';
import { formatDuration } from './settingsMetadata';
import { renderDescription } from './settingsDescription';
import {
  SecretInput,
  ReadonlySecretInput,
  TokenListInput,
  TokenSymbolListInput,
} from './settingsInputsAdvanced';
import { SettingSelect } from './SettingSelect';
import { PathInput } from './PathInput';
import { BooleanInput } from './BooleanInput';
import {
  ManualSettingCommitActions,
  type ManualSettingCommitControls,
} from './ManualSettingCommitActions';
import { useTranslations } from '../../../i18n';
import { useLocalizedSettingMetadata } from './localizedSettingsMetadata';
import { SettingCapabilityStatus } from './SettingCapabilityStatus';
import { isSettingReadOnly } from './settingCapability';

export type { ManualSettingCommitControls } from './ManualSettingCommitActions';

export interface SettingsSectionProps {
  settings: SystemSetting[];
  edits: Record<string, string>;
  onChange: (key: string, value: string) => void;
  manualCommit?: ManualSettingCommitControls;
  /** External warnings keyed by setting key */
  externalWarnings?: Record<string, string>;
  metadata?: Record<string, SettingMeta>;
}

export function SettingsSection({
  settings,
  edits,
  onChange,
  manualCommit,
  externalWarnings,
  metadata,
}: SettingsSectionProps) {
  return (
    <div className="cedros-data-stack cedros-settings-grid">
      {settings.map((setting) => (
        <SettingRow
          key={setting.key}
          setting={setting}
          editValue={edits[setting.key]}
          onChange={onChange}
          manualCommit={manualCommit}
          externalWarning={externalWarnings?.[setting.key]}
          metadata={metadata}
        />
      ))}
    </div>
  );
}

interface SettingRowProps {
  setting: SystemSetting;
  editValue?: string;
  onChange: (key: string, value: string) => void;
  manualCommit?: ManualSettingCommitControls;
  /** External warning message that overrides threshold-based warnings */
  externalWarning?: string;
  metadata?: Record<string, SettingMeta>;
}

function SettingRow({
  setting,
  editValue,
  onChange,
  manualCommit,
  externalWarning,
  metadata,
}: SettingRowProps) {
  const { settingMetadata } = useLocalizedSettingMetadata();
  const meta = metadata?.[setting.key] ?? settingMetadata[setting.key];
  const currentValue = editValue ?? setting.value;
  const hasChange = editValue !== undefined && editValue !== setting.value;
  const isBoolean = meta?.inputType === 'boolean';
  const manualError = manualCommit?.getError(setting.key) ?? null;
  const manualSaving = manualCommit?.isSaving(setting.key) ?? false;
  const readOnly = isSettingReadOnly(setting);
  const invalid = Boolean(setting.validationError);

  // Check for warnings (external warnings take precedence)
  const warning = useMemo(() => {
    if (externalWarning) return externalWarning;
    if (!meta?.warningThreshold) return null;
    const numValue = parseInt(currentValue, 10);
    if (isNaN(numValue)) return null;
    const { above, below, message } = meta.warningThreshold;
    if (above !== undefined && numValue > above) return message;
    if (below !== undefined && numValue < below) return message;
    return null;
  }, [currentValue, meta?.warningThreshold, externalWarning]);

  if (!meta) {
    // Fallback for unknown settings
    return (
      <div
        className={`cedros-data-field cedros-setting-row ${hasChange ? 'cedros-setting-row-changed' : ''}`}
      >
        <div className="cedros-setting-label">
          <span className="cedros-data-label cedros-setting-name">{setting.key}</span>
          {setting.description && (
            <span className="cedros-data-field__description cedros-setting-description">
              {setting.description}
            </span>
          )}
        </div>
        <div className="cedros-setting-input-wrapper">
          <input
            type="text"
            value={currentValue}
            onChange={(e) => !readOnly && onChange(setting.key, e.target.value)}
            className="cedros-data-input cedros-setting-input"
            disabled={readOnly}
            aria-invalid={invalid || undefined}
          />
          <SettingCapabilityStatus setting={setting} />
          {!readOnly && setting.isSecret && hasChange && manualCommit && (
            <ManualSettingCommitActions
              settingKey={setting.key}
              isSaving={manualSaving}
              error={manualError}
              onConfirm={manualCommit.onConfirm}
              onCancel={manualCommit.onCancel}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`cedros-data-field cedros-setting-row ${hasChange ? 'cedros-setting-row-changed' : ''} ${warning ? 'cedros-setting-row-warning' : ''} ${isBoolean ? 'cedros-setting-row-toggle' : ''}`}
    >
      <div className="cedros-setting-label">
        <span className="cedros-data-label cedros-setting-name">{meta.label}</span>
        <span className="cedros-data-field__description cedros-setting-description">
          {renderDescription(meta.description)}
        </span>
      </div>
      <fieldset
        className={`cedros-setting-control cedros-setting-control-fieldset ${isBoolean ? 'cedros-setting-control-toggle' : ''}`}
        disabled={readOnly}
      >
        <SettingInput
          meta={meta}
          value={currentValue}
          onChange={(value) => !readOnly && onChange(setting.key, value)}
          invalid={invalid}
          configured={setting.isSecret && setting.hasValue}
        />
        <SettingCapabilityStatus setting={setting} />
        {!readOnly && setting.isSecret && hasChange && manualCommit && (
          <ManualSettingCommitActions
            settingKey={setting.key}
            isSaving={manualSaving}
            error={manualError}
            onConfirm={manualCommit.onConfirm}
            onCancel={manualCommit.onCancel}
          />
        )}
        {warning && <div className="cedros-setting-warning">{warning}</div>}
      </fieldset>
    </div>
  );
}

interface SettingInputProps {
  meta: SettingMeta;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  configured?: boolean;
}

function SettingInput({ meta, value, onChange, invalid, configured }: SettingInputProps) {
  switch (meta.inputType) {
    case 'duration':
      return (
        <DurationInput value={value} onChange={onChange} presets={meta.presets} min={meta.min} />
      );
    case 'percentage':
      return (
        <PercentageInput
          value={value}
          onChange={onChange}
          min={meta.min ?? 1}
          max={meta.max ?? 100}
          step={meta.step ?? 5}
          presets={meta.presets}
        />
      );
    case 'select':
      return (
        <SelectInput
          value={value}
          onChange={onChange}
          presets={meta.presets ?? []}
          unit={meta.unit}
        />
      );
    case 'number':
      return (
        <NumberInput
          value={value}
          onChange={onChange}
          min={meta.min}
          max={meta.max}
          unit={meta.unit}
        />
      );
    case 'tokenList':
      return <TokenListInput value={value} onChange={onChange} />;
    case 'text':
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="cedros-data-input cedros-setting-input"
          placeholder={meta.label}
          aria-invalid={invalid || undefined}
        />
      );
    case 'path':
      return <PathInput value={value} onChange={onChange} placeholder={meta.placeholder} />;
    case 'boolean':
      return <BooleanInput value={value} onChange={onChange} ariaLabel={meta.label} />;
    case 'secret':
      return (
        <SecretInput
          value={value}
          onChange={onChange}
          multiline={meta.multiline}
          configured={configured}
        />
      );
    case 'readonlySecret':
      return <ReadonlySecretInput settingKey={meta.key} value={value} />;
    case 'tokenSymbolList':
      return <TokenSymbolListInput value={value} onChange={onChange} />;
    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="cedros-data-input cedros-setting-input"
          aria-invalid={invalid || undefined}
        />
      );
  }
}

interface DurationInputProps {
  value: string;
  onChange: (value: string) => void;
  presets?: { label: string; value: string }[];
  min?: number;
}

function DurationInput({ value, onChange, presets, min = 0 }: DurationInputProps) {
  const t = useTranslations();
  const [customMode, setCustomMode] = useState(false);
  const numValue = parseInt(value, 10) || 0;
  const displayValue = formatDuration(numValue);
  const presetList = presets ?? [];
  const isPreset = presetList.some((preset) => preset.value === value);
  // Preset values show a clean dropdown only; the raw-seconds input appears for
  // custom values (or after picking "Custom"), mirroring SelectInput.
  const showCustom = !isPreset || customMode;

  const handleSelect = useCallback(
    (next: string) => {
      if (next === '__custom__') {
        setCustomMode(true);
      } else {
        setCustomMode(false);
        onChange(next);
      }
    },
    [onChange]
  );

  const handleCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Math.max(min, parseInt(e.target.value, 10) || 0);
      onChange(String(newValue));
    },
    [onChange, min]
  );

  return (
    <div className="cedros-duration-input">
      {presetList.length > 0 && (
        <SettingSelect
          value={showCustom ? '__custom__' : value}
          options={[...presetList, { value: '__custom__', label: t.admin.settings.custom }]}
          onChange={handleSelect}
        />
      )}
      {showCustom && (
        <div className="cedros-duration-custom">
          <input
            type="number"
            value={numValue}
            onChange={handleCustomChange}
            min={min}
            className="cedros-data-input cedros-setting-input cedros-setting-input-sm"
          />
          <span className="cedros-setting-unit">{t.admin.settings.seconds}</span>
          <span className="cedros-duration-display">= {displayValue}</span>
        </div>
      )}
    </div>
  );
}

interface PercentageInputProps {
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step: number;
  presets?: { label: string; value: string }[];
}

function PercentageInput({ value, onChange, min, max, step, presets }: PercentageInputProps) {
  const numValue = parseInt(value, 10) || min;

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handlePresetClick = useCallback(
    (presetValue: string) => {
      onChange(presetValue);
    },
    [onChange]
  );

  return (
    <div className="cedros-percentage-input">
      <div className="cedros-percentage-slider-row">
        <input
          type="range"
          value={numValue}
          onChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          className="cedros-percentage-slider"
        />
        <span className="cedros-percentage-value">{numValue}%</span>
      </div>
      {presets && presets.length > 0 && (
        <div className="cedros-preset-buttons">
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`cedros-preset-button ${preset.value === value ? 'cedros-preset-button-active' : ''}`}
              onClick={() => handlePresetClick(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  presets: { label: string; value: string }[];
  unit?: string;
}

function SelectInput({ value, onChange, presets, unit }: SelectInputProps) {
  const t = useTranslations();
  const [customMode, setCustomMode] = useState(false);
  const isPreset = presets.some((preset) => preset.value === value);
  const showCustom = !isPreset || customMode;

  const handleSelect = useCallback(
    (next: string) => {
      if (next === '__custom__') {
        setCustomMode(true);
      } else {
        setCustomMode(false);
        onChange(next);
      }
    },
    [onChange]
  );

  const handleCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="cedros-select-input">
      <SettingSelect
        value={showCustom ? '__custom__' : value}
        options={[...presets, { value: '__custom__', label: t.admin.settings.custom }]}
        onChange={handleSelect}
      />
      {showCustom && (
        <div className="cedros-select-custom">
          <input
            type="number"
            value={value}
            onChange={handleCustomChange}
            className="cedros-data-input cedros-setting-input cedros-setting-input-sm"
          />
          {unit && <span className="cedros-setting-unit">{unit}</span>}
        </div>
      )}
    </div>
  );
}

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  unit?: string;
}

function NumberInput({ value, onChange, min, max, unit }: NumberInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="cedros-number-input">
      <input
        type="number"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        className="cedros-data-input cedros-setting-input"
      />
      {unit && <span className="cedros-setting-unit">{unit}</span>}
    </div>
  );
}
