import type { SystemSetting } from '../../../types';
import { useTranslations } from '../../../i18n';

/**
 * Surfaces only what an operator must act on: a restart requirement, a
 * host-owned or unsupported value, or a validation error. Settings that apply
 * immediately are the norm and stay unlabelled so the form is not stamped
 * with the same hint under every field.
 */
export function SettingCapabilityStatus({ setting }: { setting: SystemSetting }) {
  const t = useTranslations();
  const status = applicationStatus(setting.applicationMode, {
    restart: t.admin.settings.settingAppliesAfterRestart,
    hostOwned: t.admin.settings.settingManagedByHost,
    unsupported: t.admin.settings.settingUnsupported,
  });
  if (!status && !setting.validationError) return null;

  return (
    <div className="cedros-setting-capability" aria-live="polite">
      {status && <span className="cedros-setting-application-mode">{status}</span>}
      {setting.validationError && (
        <span className="cedros-setting-validation-error" role="alert">
          {setting.validationError}
        </span>
      )}
    </div>
  );
}

interface ApplicationStatusCopy {
  restart: string;
  hostOwned: string;
  unsupported: string;
}

function applicationStatus(
  mode: SystemSetting['applicationMode'],
  copy: ApplicationStatusCopy
): string | null {
  switch (mode) {
    case 'restart':
      return copy.restart;
    case 'host-owned':
      return copy.hostOwned;
    case 'unsupported':
      return copy.unsupported;
    default:
      return null;
  }
}
