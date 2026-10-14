import type { SystemSetting } from '../../../types';
import { useI18n } from '../../../i18n';
import { AuthMethodCard } from './AuthMethodCard';
import type { ManualSettingCommitControls } from './settingsInputs';

interface SignupLimitSettingsProps {
  byKey: Record<string, SystemSetting>;
  edits: Record<string, string>;
  onChange: (key: string, value: string) => void;
  manualCommit: ManualSettingCommitControls;
}

export function SignupLimitSettings({
  byKey,
  edits,
  onChange,
  manualCommit,
}: SignupLimitSettingsProps) {
  const { t } = useI18n();

  return (
    <div className="cedros-auth-method-list">
      <AuthMethodCard
        title={t.admin.settings.signupLimitsTitle}
        enabledKey="signup_limit_enabled"
        configKeys={['signup_limit_period', 'signup_limit_max', 'signup_limit_show_remaining']}
        byKey={byKey}
        edits={edits}
        onChange={onChange}
        manualCommit={manualCommit}
      />
    </div>
  );
}
