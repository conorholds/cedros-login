import { useMemo } from 'react';

import { useTranslations } from '../../../i18n';
import type { SettingMeta } from '../../../types';
import { CATEGORY_METADATA, SETTING_METADATA, type CategoryMeta } from './settingsMetadata';

type SettingOverrides = Record<
  string,
  {
    label?: string;
    description?: string;
    warningMessage?: string;
    presets?: Record<string, string>;
  }
>;

type CategoryOverrides = Record<string, { label?: string; description?: string }>;

export function useLocalizedSettingMetadata() {
  const t = useTranslations();
  const overrides = t.admin.settings.settingsMetadata;

  return useMemo(
    () => ({
      settingMetadata: localizeSettings(SETTING_METADATA, overrides.settings),
      categoryMetadata: localizeCategories(CATEGORY_METADATA, overrides.categories),
    }),
    [overrides.categories, overrides.settings]
  );
}

function localizeSettings(
  metadata: Record<string, SettingMeta>,
  overrides: SettingOverrides
): Record<string, SettingMeta> {
  if (Object.keys(overrides).length === 0) return metadata;

  const localized: Record<string, SettingMeta> = {};
  for (const [key, meta] of Object.entries(metadata)) {
    const override = overrides[key];
    if (!override) {
      localized[key] = meta;
      continue;
    }

    localized[key] = {
      ...meta,
      label: override.label ?? meta.label,
      description: override.description ?? meta.description,
      presets: meta.presets?.map((preset) => ({
        ...preset,
        label: override.presets?.[preset.value] ?? preset.label,
      })),
      warningThreshold: meta.warningThreshold
        ? {
            ...meta.warningThreshold,
            message: override.warningMessage ?? meta.warningThreshold.message,
          }
        : undefined,
    };
  }
  return localized;
}

function localizeCategories(
  metadata: Record<string, CategoryMeta>,
  overrides: CategoryOverrides
): Record<string, CategoryMeta> {
  if (Object.keys(overrides).length === 0) return metadata;

  const localized: Record<string, CategoryMeta> = {};
  for (const [key, meta] of Object.entries(metadata)) {
    const override = overrides[key];
    localized[key] = override
      ? {
          ...meta,
          label: override.label ?? meta.label,
          description: override.description ?? meta.description,
        }
      : meta;
  }
  return localized;
}
