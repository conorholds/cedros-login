import { useExternalEffect } from '../../../hooks/effects';
/**
 * SSO Providers settings - manage OIDC identity providers
 */
import { useState } from 'react';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { ErrorMessage } from '../../shared/ErrorMessage';
import { ConfirmDialog } from '../../shared/ConfirmDialog';
import {
  useSsoProviders,
  type SsoProvider,
  type CreateSsoProviderInput,
  type UpdateSsoProviderInput,
} from '../../../hooks/useSsoProviders';
import { useOrgs } from '../../../hooks/useOrgs';
import { useI18n } from '../../../i18n';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { SsoProviderForm } from './SsoProviderForm';
import { SsoProviderCard } from './SsoProviderCard';

export interface SsoProvidersSettingsProps {
  className?: string;
  /** Hide the page title/description (e.g. when embedded inside the SSO method card). */
  hideHeader?: boolean;
}

type ViewMode = 'list' | 'add' | 'edit';

export function SsoProvidersSettings({ className, hideHeader }: SsoProvidersSettingsProps) {
  const { t, message } = useI18n();
  const {
    providers,
    isLoading,
    error,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    toggleProvider,
  } = useSsoProviders();

  const { activeOrg } = useOrgs();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingProvider, setEditingProvider] = useState<SsoProvider | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { confirm, dialogProps } = useConfirmDialog();

  useExternalEffect(() => {
    fetchProviders(activeOrg?.id);
  }, [fetchProviders, activeOrg?.id]);

  const handleAdd = () => {
    setEditingProvider(null);
    setFormError(null);
    setViewMode('add');
  };

  const handleEdit = (provider: SsoProvider) => {
    setEditingProvider(provider);
    setFormError(null);
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingProvider(null);
    setFormError(null);
  };

  const handleDelete = async (provider: SsoProvider) => {
    const confirmed = await confirm({
      title: message(t.admin.settings.deleteSsoProviderTitle, { name: provider.name }),
      description: message(t.admin.settings.deleteSsoProviderConfirm, { name: provider.name }),
      confirmLabel: t.admin.settings.deleteSsoProviderAction,
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteProvider(provider.id);
    } catch {
      // Error is already set in hook
    }
  };

  const handleToggle = async (provider: SsoProvider) => {
    try {
      await toggleProvider(provider.id, !provider.enabled);
    } catch {
      // Error is already set in hook
    }
  };

  const handleSave = async (data: CreateSsoProviderInput | UpdateSsoProviderInput) => {
    setFormError(null);
    try {
      if (viewMode === 'add') {
        await createProvider(data as CreateSsoProviderInput);
      } else if (editingProvider) {
        await updateProvider(editingProvider.id, data as UpdateSsoProviderInput);
      }
      setViewMode('list');
      setEditingProvider(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.admin.settings.failedToSaveProvider);
    }
  };

  if (isLoading && providers.length === 0) {
    return (
      <div className={`cedros-system-settings cedros-system-settings-loading ${className ?? ''}`}>
        <LoadingSpinner />
        <span>{t.admin.settings.loadingSsoProviders}</span>
      </div>
    );
  }

  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <div className={`cedros-system-settings ${className ?? ''}`}>
        <SsoProviderForm
          provider={editingProvider}
          orgId={activeOrg?.id}
          error={formError}
          isLoading={isLoading}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className={`cedros-system-settings ${className ?? ''}`}>
      {hideHeader ? (
        <div className="cedros-sso-embedded-actions">
          <button
            type="button"
            className="cedros-data-btn cedros-data-btn--primary cedros-button cedros-button-primary"
            onClick={handleAdd}
          >
            {t.admin.settings.addProvider}
          </button>
        </div>
      ) : (
        <div className="cedros-data__header cedros-settings-page-header">
          <div className="cedros-data__header-text cedros-settings-page-header-content">
            <h2 className="cedros-data__title cedros-settings-page-title">
              {t.admin.settings.ssoTitle}
            </h2>
            <p className="cedros-data__subtitle cedros-settings-page-description">
              {t.admin.settings.ssoDescription}
            </p>
          </div>
          <button
            type="button"
            className="cedros-data-btn cedros-data-btn--primary cedros-button cedros-button-primary"
            onClick={handleAdd}
          >
            {t.admin.settings.addProvider}
          </button>
        </div>
      )}

      {error && <ErrorMessage error={error.message} />}

      {providers.length === 0 ? (
        <div className="cedros-data-empty cedros-system-settings-empty">
          <p>{t.admin.settings.noSsoProviders}</p>
          <p className="cedros-text-muted">{t.admin.settings.noSsoProvidersHelp}</p>
        </div>
      ) : (
        <div className="cedros-sso-provider-list" role="list">
          {providers.map((provider) => (
            <SsoProviderCard
              key={provider.id}
              provider={provider}
              onEdit={() => handleEdit(provider)}
              onDelete={() => handleDelete(provider)}
              onToggle={() => handleToggle(provider)}
            />
          ))}
        </div>
      )}
      <ConfirmDialog {...dialogProps} className="cedros-data-dialog" />
    </div>
  );
}
