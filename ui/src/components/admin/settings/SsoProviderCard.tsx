import type { SsoProvider } from '../../../hooks/useSsoProviders';
import { useI18n } from '../../../i18n';
import { AdminActionMenu } from './AdminActionMenu';

interface SsoProviderCardProps {
  provider: SsoProvider;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

export function SsoProviderCard(props: SsoProviderCardProps) {
  const { provider, onEdit, onDelete, onToggle } = props;
  const { t, message } = useI18n();
  return (
    <div
      role="listitem"
      className={`cedros-sso-provider-card ${provider.enabled ? '' : 'cedros-sso-provider-card--disabled'}`}
    >
      <div className="cedros-sso-provider-card-header">
        <div className="cedros-sso-provider-card-info">
          <h3 className="cedros-sso-provider-card-name">{provider.name}</h3>
          <p className="cedros-sso-provider-card-issuer">{provider.issuerUrl}</p>
        </div>
        <ProviderSwitch provider={provider} onToggle={onToggle} />
      </div>
      <ProviderDetails provider={provider} />
      <div className="cedros-sso-provider-card-actions">
        <button
          type="button"
          className="cedros-data-btn cedros-data-btn--ghost cedros-button cedros-button-ghost"
          onClick={onEdit}
        >
          {t.common.edit}
        </button>
        <AdminActionMenu
          label={message(t.admin.settings.providerActions, { name: provider.name })}
          items={[
            {
              label: t.admin.settings.deleteSsoProviderAction,
              destructive: true,
              onSelect: onDelete,
            },
          ]}
        />
      </div>
    </div>
  );
}

function ProviderSwitch({
  provider,
  onToggle,
}: Pick<SsoProviderCardProps, 'provider' | 'onToggle'>) {
  const t = useI18n().t;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={provider.enabled}
      aria-label={provider.name}
      className={`cedros-toggle ${provider.enabled ? 'cedros-toggle-on' : 'cedros-toggle-off'}`}
      onClick={onToggle}
    >
      <span className="cedros-toggle-track">
        <span className="cedros-toggle-thumb" />
      </span>
      <span className="cedros-toggle-label" aria-hidden="true">
        {provider.enabled ? t.common.enabled : t.common.disabled}
      </span>
    </button>
  );
}

function ProviderDetails({ provider }: Pick<SsoProviderCardProps, 'provider'>) {
  const t = useI18n().t;
  return (
    <div className="cedros-sso-provider-card-details">
      <ProviderDetail label={t.admin.settings.clientId} value={provider.clientId} mono />
      {provider.emailDomain && (
        <ProviderDetail label={t.admin.settings.emailDomain} value={`@${provider.emailDomain}`} />
      )}
      <ProviderDetail
        label={t.admin.settings.registration}
        value={
          provider.allowRegistration
            ? t.admin.settings.registrationAllowed
            : t.admin.settings.existingUsersOnly
        }
      />
    </div>
  );
}

function ProviderDetail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const Value = mono ? 'code' : 'span';
  return (
    <div className="cedros-sso-provider-card-detail">
      <span className="cedros-sso-provider-card-detail-label">{label}</span>
      <Value className="cedros-sso-provider-card-detail-value">{value}</Value>
    </div>
  );
}
