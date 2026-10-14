/**
 * Webhook settings page - HTTP webhook configuration
 */
import { SettingsPageLayout } from './SettingsPageLayout';
import { useTranslations } from '../../../i18n';

const CATEGORIES = ['webhook'];

export interface WebhookSettingsProps {
  className?: string;
}

export function WebhookSettings({ className }: WebhookSettingsProps) {
  const t = useTranslations();
  return (
    <SettingsPageLayout
      title={t.admin.settings.webhooksTitle}
      description={t.admin.settings.webhooksDescription}
      categories={CATEGORIES}
      className={className}
    />
  );
}
