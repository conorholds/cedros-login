/**
 * Security settings page - CORS, cookies, sessions, rate limiting
 */
import { SettingsPageLayout } from './SettingsPageLayout';
import { useTranslations } from '../../../i18n';

const CATEGORIES = ['security', 'rate_limit'];

export interface SecuritySettingsProps {
  className?: string;
}

export function SecuritySettings({ className }: SecuritySettingsProps) {
  const t = useTranslations();
  return (
    <SettingsPageLayout
      title={t.admin.settings.securityTitle}
      description={t.admin.settings.securityDescription}
      categories={CATEGORIES}
      className={className}
    />
  );
}
