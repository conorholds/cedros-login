import { useExternalEffect } from '../../hooks/effects';
import { useCallback, useState, useRef, useId } from 'react';
import { useTranslations } from '../../i18n';
import { toError } from '../../utils/toError';
import { ErrorMessage } from '../shared/ErrorMessage';
import type { OrgWithMembership } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { OrgAvatar } from './OrgAvatar';

export interface OrgSelectorProps {
  /** List of organizations to display */
  orgs: OrgWithMembership[];
  /** Currently active organization */
  activeOrg: OrgWithMembership | null;
  /** Loading state */
  isLoading?: boolean;
  /** Callback when organization is selected */
  onSelect: (orgId: string) => void | Promise<void>;
  /** Callback when "Create organization" is clicked */
  onCreateClick?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Placeholder when no orgs */
  placeholder?: string;
}

/**
 * Dropdown selector for switching between organizations.
 *
 * @example
 * ```tsx
 * function Header() {
 *   const { orgs, activeOrg, switchOrg } = useOrgs();
 *
 *   return (
 *     <OrgSelector
 *       orgs={orgs}
 *       activeOrg={activeOrg}
 *       onSelect={switchOrg}
 *       onCreateClick={() => setShowCreateModal(true)}
 *     />
 *   );
 * }
 * ```
 */
export function OrgSelector({
  orgs,
  activeOrg,
  isLoading = false,
  onSelect,
  onCreateClick,
  className = '',
  placeholder,
}: OrgSelectorProps) {
  const t = useTranslations();
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const switching = useRef(false);
  const restoreFocus = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useExternalEffect(() => {
    if (!isOpen && !pending && !isLoading && restoreFocus.current) {
      restoreFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [isOpen, pending, isLoading]);

  // Close dropdown when clicking outside
  useExternalEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useExternalEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    async (orgId: string) => {
      if (switching.current) return;
      switching.current = true;
      setPending(true);
      setError(null);
      try {
        await onSelect(orgId);
        restoreFocus.current = true;
        setIsOpen(false);
      } catch (err) {
        setError(toError(err, t.organizations.switchFailed).message);
      } finally {
        switching.current = false;
        setPending(false);
      }
    },
    [onSelect, t.organizations.switchFailed]
  );

  const handleCreateClick = useCallback(() => {
    setIsOpen(false);
    onCreateClick?.();
  }, [onCreateClick]);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div ref={dropdownRef} className={`cedros-org-selector ${className}`}>
      <button
        type="button"
        ref={triggerRef}
        className="cedros-org-selector-trigger"
        disabled={isLoading || pending}
        onClick={toggleDropdown}
        aria-controls={isOpen ? listId : undefined}
        aria-expanded={isOpen}
      >
        {activeOrg ? (
          <>
            <OrgAvatar org={activeOrg} size="sm" />
            <span className="cedros-org-selector-name">{activeOrg.name}</span>
            <RoleBadge role={activeOrg.membership.role} />
          </>
        ) : (
          <span className="cedros-org-selector-placeholder">
            {placeholder ?? t.organizations.select}
          </span>
        )}
        <ChevronIcon isOpen={isOpen} />
      </button>

      {(isLoading || pending) && (
        <span role="status">
          <LoadingSpinner size="sm" />
          {t.organizations.loading}
        </span>
      )}
      {error && <ErrorMessage error={error} />}
      {isOpen && (
        <div
          id={listId}
          className="cedros-org-selector-dropdown"
          role="group"
          aria-label={t.organizations.select}
        >
          {orgs.length === 0 ? (
            <div className="cedros-org-selector-empty">{t.organizations.empty}</div>
          ) : (
            <ul className="cedros-org-selector-list">
              {orgs.map((org) => (
                <li key={org.id}>
                  <button
                    type="button"
                    className={`cedros-org-selector-item ${
                      org.id === activeOrg?.id ? 'cedros-org-selector-item-active' : ''
                    }`}
                    onClick={() => handleSelect(org.id)}
                    disabled={isLoading || pending}
                    aria-current={org.id === activeOrg?.id ? true : undefined}
                  >
                    <OrgAvatar org={org} size="sm" />
                    <span className="cedros-org-selector-item-name">{org.name}</span>
                    <RoleBadge role={org.membership.role} />
                    {org.id === activeOrg?.id && <CheckIcon />}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {onCreateClick && (
            <>
              <div className="cedros-org-selector-divider" />
              <button
                type="button"
                className="cedros-org-selector-create"
                onClick={handleCreateClick}
              >
                <PlusIcon />
                <span>{t.organizations.createTitle}</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Helper components
function RoleBadge({ role }: { role: string }) {
  return <span className={`cedros-org-role cedros-org-role-${role}`}>{role}</span>;
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`cedros-org-chevron ${isOpen ? 'cedros-org-chevron-open' : ''}`}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="cedros-org-check"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 8L6 11L13 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      className="cedros-org-plus"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 3V13M3 8H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
