import { useCallback, useState, type FormEvent } from 'react';

import { useI18n } from '../../../i18n';
import type {
  CreateSsoProviderInput,
  SsoProvider,
  UpdateSsoProviderInput,
} from '../../../hooks/useSsoProviders';
import { ErrorMessage } from '../../shared/ErrorMessage';
import { SsoProviderFormFields, type SsoProviderFormValues } from './SsoProviderFormFields';

interface SsoProviderFormProps {
  provider: SsoProvider | null;
  orgId?: string;
  error: string | null;
  isLoading: boolean;
  onSave: (data: CreateSsoProviderInput | UpdateSsoProviderInput) => void;
  onCancel: () => void;
}

export function SsoProviderForm(props: SsoProviderFormProps) {
  const { provider, error, isLoading, onCancel } = props;
  const t = useI18n().t;
  const isEditing = Boolean(provider);
  const form = useSsoProviderForm(props);

  return (
    <form className="cedros-sso-provider-form" onSubmit={form.handleSubmit}>
      <div className="cedros-data__header cedros-settings-page-header">
        <div className="cedros-data__header-text cedros-settings-page-header-content">
          <h2 className="cedros-data__title cedros-settings-page-title">
            {isEditing ? t.admin.settings.editSsoProvider : t.admin.settings.addSsoProvider}
          </h2>
          <p className="cedros-data__subtitle cedros-settings-page-description">
            {t.admin.settings.ssoDescription}
          </p>
        </div>
      </div>
      {error && <ErrorMessage error={error} />}
      <SsoProviderFormFields values={form.values} isEditing={isEditing} onChange={form.setValue} />
      <div className="cedros-data-actions cedros-form-actions">
        <button
          type="button"
          className="cedros-data-btn cedros-data-btn--ghost cedros-button cedros-button-ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t.common.cancel}
        </button>
        <button
          type="submit"
          className="cedros-data-btn cedros-data-btn--primary cedros-button cedros-button-primary"
          disabled={isLoading}
        >
          {isLoading
            ? t.admin.settings.saving
            : isEditing
              ? t.admin.settings.saveChanges
              : t.admin.settings.addProvider}
        </button>
      </div>
    </form>
  );
}

function useSsoProviderForm({ provider, orgId, onSave }: SsoProviderFormProps) {
  const [values, setValues] = useState<SsoProviderFormValues>(() => initialValues(provider));
  const setValue = useCallback((key: keyof SsoProviderFormValues, value: string | boolean) => {
    setValues((current) => ({ ...current, [key]: value }));
  }, []);
  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (provider) onSave(updateInput(values));
      else if (orgId) onSave({ orgId, ...createInput(values) });
    },
    [onSave, orgId, provider, values]
  );
  return { handleSubmit, setValue, values };
}

function initialValues(provider: SsoProvider | null): SsoProviderFormValues {
  return {
    name: provider?.name ?? '',
    issuerUrl: provider?.issuerUrl ?? '',
    clientId: provider?.clientId ?? '',
    clientSecret: '',
    emailDomain: provider?.emailDomain ?? '',
    allowRegistration: provider?.allowRegistration ?? true,
    enabled: provider?.enabled ?? true,
  };
}

function createInput(values: SsoProviderFormValues) {
  return { ...values, emailDomain: values.emailDomain || null };
}

function updateInput(values: SsoProviderFormValues): UpdateSsoProviderInput {
  const { clientSecret, ...rest } = values;
  return {
    ...rest,
    emailDomain: values.emailDomain || null,
    ...(clientSecret ? { clientSecret } : {}),
  };
}
