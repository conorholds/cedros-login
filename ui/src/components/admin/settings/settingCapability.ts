import type { SystemSetting } from '../../../types';

export function isSettingReadOnly(setting: SystemSetting): boolean {
  return setting.applicationMode === 'host-owned' || setting.applicationMode === 'unsupported';
}
