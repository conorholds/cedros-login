/**
 * Create organization form component
 */
import { useState, useCallback, useId } from 'react';
import { useTranslations } from '../../i18n';
import { toError } from '../../utils/toError';
import type { CreateOrgRequest } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';

export interface CreateOrgFormProps {
  isLoading: boolean;
  onSubmit: (data: CreateOrgRequest) => Promise<void>;
  onCancel: () => void;
}

export function CreateOrgForm({ isLoading, onSubmit, onCancel }: CreateOrgFormProps) {
  const t = useTranslations();
  const fieldId = useId();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-generate slug from name
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    // Generate slug: lowercase, replace spaces with hyphens, remove special chars
    const generatedSlug = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50);
    setSlug(generatedSlug);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setFormError(null);

      if (!name.trim()) {
        setFormError(t.organizations.nameRequired);
        return;
      }

      if (!slug.trim()) {
        setFormError(t.organizations.slugRequired);
        return;
      }

      try {
        await onSubmit({ name: name.trim(), slug: slug.trim() });
      } catch (err) {
        setFormError(toError(err, t.organizations.createFailed).message);
      }
    },
    [name, slug, onSubmit, t.organizations]
  );

  return (
    <form className="cedros-org-create-form" onSubmit={handleSubmit}>
      {formError && <ErrorMessage error={formError} />}

      <div className="cedros-form-group">
        <label htmlFor={`${fieldId}-org-name`} className="cedros-form-label">
          {t.organizations.name}
        </label>
        <input
          id={`${fieldId}-org-name`}
          type="text"
          className="cedros-form-input"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder={t.organizations.namePlaceholder}
          maxLength={255}
          disabled={isLoading}
          autoFocus
        />
      </div>

      <div className="cedros-form-group">
        <label htmlFor={`${fieldId}-org-slug`} className="cedros-form-label">
          {t.organizations.slug}
        </label>
        <div className="cedros-form-input-prefix">
          <span className="cedros-form-prefix">@</span>
          <input
            id={`${fieldId}-org-slug`}
            type="text"
            className="cedros-form-input"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder={t.organizations.slugPlaceholder}
            maxLength={100}
            pattern="[a-z0-9-]+"
            disabled={isLoading}
          />
        </div>
        <span className="cedros-form-hint">{t.organizations.slugHint}</span>
      </div>

      <div className="cedros-form-actions">
        <button
          type="button"
          className="cedros-button cedros-button-outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t.common.cancel}
        </button>
        <button
          type="submit"
          className="cedros-button cedros-button-primary"
          disabled={isLoading || !name.trim() || !slug.trim()}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : t.organizations.createTitle}
        </button>
      </div>
    </form>
  );
}
