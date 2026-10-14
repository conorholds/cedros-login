import { useModalFocus } from '../../hooks/useModalFocus';
import { useTranslations } from '../../i18n';
import { toError } from '../../utils/toError';
/**
 * Organization switcher modal component
 *
 * Composes the organization form, list, and avatar components:
 * - CreateOrgForm -> ./CreateOrgForm.tsx
 * - OrgListView -> ./OrgListView.tsx
 * - OrgAvatar -> ./OrgAvatar.tsx
 * - Icons -> ./icons.tsx
 */
import { useState, useCallback, useRef, useId } from 'react';
import type { OrgWithMembership, CreateOrgRequest, DisplayError } from '../../types';
import { ErrorMessage } from '../shared/ErrorMessage';
import { OrgListView } from './OrgListView';
import { CreateOrgForm } from './CreateOrgForm';
import { CloseIcon } from './icons';

export interface OrgSwitcherProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** List of organizations */
  orgs: OrgWithMembership[];
  /** Currently active organization */
  activeOrg: OrgWithMembership | null;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: DisplayError;
  /** Callback when organization is selected */
  onSelect: (orgId: string) => void | Promise<void>;
  /** Callback when new organization is created */
  onCreate?: (data: CreateOrgRequest) => Promise<void>;
  /** Additional CSS class */
  className?: string;
}

type ViewMode = 'list' | 'create';

/**
 * Modal for switching organizations and creating new ones.
 *
 * @example
 * ```tsx
 * function App() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const { orgs, activeOrg, switchOrg, createOrg } = useOrgs();
 *
 *   return (
 *     <>
 *       <button onClick={() => setIsOpen(true)}>Switch org</button>
 *       <OrgSwitcher
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *         orgs={orgs}
 *         activeOrg={activeOrg}
 *         onSelect={switchOrg}
 *         onCreate={createOrg}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function OrgSwitcher({
  isOpen,
  onClose,
  orgs,
  activeOrg,
  isLoading = false,
  error,
  onSelect,
  onCreate,
  className = '',
}: OrgSwitcherProps) {
  // Render null when closed - inner content unmounts, resetting state naturally
  if (!isOpen) return null;

  return (
    <OrgSwitcherModal
      onClose={onClose}
      orgs={orgs}
      activeOrg={activeOrg}
      isLoading={isLoading}
      error={error}
      onSelect={onSelect}
      onCreate={onCreate}
      className={className}
    />
  );
}

// Inner modal component - unmounts when modal closes, resetting viewMode state
function OrgSwitcherModal({
  onClose,
  orgs,
  activeOrg,
  isLoading = false,
  error,
  onSelect,
  onCreate,
  className,
}: Omit<OrgSwitcherProps, 'isOpen'>) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const modalRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const titleId = useId();
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const switching = useRef(false);
  useModalFocus(true, modalRef, onClose);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleSelect = useCallback(
    async (orgId: string) => {
      if (switching.current) return;
      switching.current = true;
      setIsSwitching(true);
      setSwitchError(null);
      try {
        await onSelect(orgId);
        onClose();
      } catch (err) {
        setSwitchError(toError(err, t.organizations.switchFailed).message);
      } finally {
        switching.current = false;
        setIsSwitching(false);
      }
    },
    [onSelect, onClose, t.organizations.switchFailed]
  );

  const handleCreate = useCallback(
    async (data: CreateOrgRequest) => {
      await onCreate?.(data);
      onClose();
    },
    [onCreate, onClose]
  );

  return (
    <div className="cedros-modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className={`cedros-modal cedros-org-switcher ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="cedros-modal-header">
          <h2 id={titleId} className="cedros-modal-title">
            {viewMode === 'list' ? t.organizations.switchTitle : t.organizations.createTitle}
          </h2>
          <button
            type="button"
            className="cedros-modal-close"
            onClick={onClose}
            aria-label={t.auth.close}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="cedros-modal-body">
          {(switchError || error) && <ErrorMessage error={switchError || error || null} />}

          {viewMode === 'list' ? (
            <OrgListView
              orgs={orgs}
              activeOrg={activeOrg}
              isLoading={isLoading || isSwitching}
              onSelect={handleSelect}
              onCreateClick={onCreate ? () => setViewMode('create') : undefined}
            />
          ) : (
            <CreateOrgForm
              isLoading={isLoading}
              onSubmit={handleCreate}
              onCancel={() => setViewMode('list')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
