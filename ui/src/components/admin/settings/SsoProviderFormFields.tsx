import { useI18n } from '../../../i18n';

export interface SsoProviderFormValues {
  name: string;
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  emailDomain: string;
  allowRegistration: boolean;
  enabled: boolean;
}

interface SsoProviderFormFieldsProps {
  values: SsoProviderFormValues;
  isEditing: boolean;
  onChange: (key: keyof SsoProviderFormValues, value: string | boolean) => void;
}

export function SsoProviderFormFields({ values, isEditing, onChange }: SsoProviderFormFieldsProps) {
  const t = useI18n().t;
  return (
    <div className="cedros-form-section">
      <SsoProviderTextFields values={values} isEditing={isEditing} onChange={onChange} />
      <CheckboxField
        label={t.admin.settings.allowSsoRegistration}
        checked={values.allowRegistration}
        onChange={(value) => onChange('allowRegistration', value)}
      />
      <CheckboxField
        label={t.admin.settings.enableProvider}
        checked={values.enabled}
        onChange={(value) => onChange('enabled', value)}
      />
    </div>
  );
}

function SsoProviderTextFields({ values, isEditing, onChange }: SsoProviderFormFieldsProps) {
  const t = useI18n().t;
  return (
    <>
      <TextField
        id="sso-name"
        label={t.admin.settings.providerName}
        value={values.name}
        placeholder={t.admin.settings.providerNamePlaceholder}
        required
        onChange={(value) => onChange('name', value)}
      />
      <TextField
        id="sso-issuer"
        type="url"
        label={t.admin.settings.issuerUrl}
        value={values.issuerUrl}
        placeholder={t.admin.settings.issuerUrlPlaceholder}
        description={t.admin.settings.issuerUrlHint}
        required
        onChange={(value) => onChange('issuerUrl', value)}
      />
      <TextField
        id="sso-client-id"
        label={t.admin.settings.clientId}
        value={values.clientId}
        placeholder={t.admin.settings.clientIdPlaceholder}
        required
        onChange={(value) => onChange('clientId', value)}
      />
      <TextField
        id="sso-client-secret"
        type="password"
        label={t.admin.settings.clientSecret}
        labelHint={isEditing ? t.admin.settings.leaveBlankToKeepCurrent : undefined}
        value={values.clientSecret}
        placeholder={isEditing ? '••••••••' : t.admin.settings.clientSecretPlaceholder}
        required={!isEditing}
        onChange={(value) => onChange('clientSecret', value)}
      />
      <TextField
        id="sso-email-domain"
        label={t.admin.settings.emailDomain}
        value={values.emailDomain}
        placeholder={t.admin.settings.emailDomainPlaceholder}
        description={t.admin.settings.emailDomainHint}
        onChange={(value) => onChange('emailDomain', value)}
      />
    </>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  description?: string;
  labelHint?: string;
  required?: boolean;
}

function TextField(props: TextFieldProps) {
  return (
    <div className="cedros-data-field cedros-form-group">
      <label className="cedros-data-label cedros-form-label" htmlFor={props.id}>
        {props.label}{' '}
        {props.labelHint && <span className="cedros-form-hint-inline">{props.labelHint}</span>}
      </label>
      <input
        id={props.id}
        type={props.type ?? 'text'}
        className="cedros-data-input cedros-form-input"
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder={props.placeholder}
        required={props.required}
      />
      {props.description && (
        <p className="cedros-data-field__description cedros-form-hint">{props.description}</p>
      )}
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="cedros-data-field cedros-form-group">
      <label className="cedros-data-checkbox-row cedros-form-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{label}</span>
      </label>
    </div>
  );
}
