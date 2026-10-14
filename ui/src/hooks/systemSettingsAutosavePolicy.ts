import type { SystemSetting, UpdateSettingRequest } from '../types';

export function indexSystemSettings(
  settings: Record<string, SystemSetting[]>
): Map<string, SystemSetting> {
  const indexed = new Map<string, SystemSetting>();
  for (const categorySettings of Object.values(settings)) {
    for (const setting of categorySettings) {
      indexed.set(setting.key, setting);
    }
  }
  return indexed;
}

export function canAutosaveSystemSetting(setting: SystemSetting | undefined): boolean {
  return Boolean(setting && !setting.isSecret && canWriteSystemSetting(setting));
}

function canWriteSystemSetting(setting: SystemSetting): boolean {
  return setting.applicationMode !== 'host-owned' && setting.applicationMode !== 'unsupported';
}

export function blockedSystemSettingKeys(indexed: Map<string, SystemSetting>): string[] {
  return [...indexed.values()]
    .filter((setting) => !canAutosaveSystemSetting(setting))
    .map((setting) => setting.key);
}

export function filterSettingsPatch(
  patch: UpdateSettingRequest[],
  indexed: Map<string, SystemSetting>,
  mode: 'autosave' | 'manual' | 'all'
): UpdateSettingRequest[] {
  return patch.filter((update) => {
    const setting = indexed.get(update.key);
    if (!setting || !canWriteSystemSetting(setting)) return false;
    const canAutosave = canAutosaveSystemSetting(setting);
    if (mode === 'autosave') return canAutosave;
    if (mode === 'manual') return !canAutosave;
    return true;
  });
}
