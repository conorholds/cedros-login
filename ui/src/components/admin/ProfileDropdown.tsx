import { useExternalEffect } from '../../hooks/effects';
/**
 * Profile Dropdown Component
 *
 * Displays user avatar/name with a dropdown menu for settings and logout.
 */

import { useState, useRef, useCallback } from 'react';

export interface ProfileDropdownProps {
  /** User's display name */
  name?: string;
  /** User's email */
  email?: string;
  /** User's profile picture URL */
  picture?: string;
  /** Callback when Settings is clicked */
  onSettings?: () => void;
  /** Callback when Logout is clicked */
  onLogout?: () => void;
  /** Additional CSS class */
  className?: string;
}

/**
 * Profile dropdown button with settings and logout options.
 *
 * @example
 * ```tsx
 * <ProfileDropdown
 *   name={user.name}
 *   email={user.email}
 *   picture={user.picture}
 *   onSettings={() => navigate('/settings')}
 *   onLogout={logout}
 * />
 * ```
 */
export function ProfileDropdown({
  name,
  email,
  picture,
  onSettings,
  onLogout,
  className = '',
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useExternalEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on escape key
  useExternalEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSettings = useCallback(() => {
    setIsOpen(false);
    onSettings?.();
  }, [onSettings]);

  const handleLogout = useCallback(() => {
    setIsOpen(false);
    onLogout?.();
  }, [onLogout]);

  const displayName = name || 'User';
  const initial = (name?.[0] || email?.[0] || '?').toUpperCase();

  return (
    <div className={`cedros-profile-dropdown ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="cedros-profile-dropdown__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="cedros-profile-dropdown__avatar">
          {picture ? (
            <img
              src={picture}
              alt={displayName}
              className="cedros-profile-dropdown__avatar-img"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="cedros-profile-dropdown__avatar-placeholder">{initial}</span>
          )}
        </div>
        <div className="cedros-profile-dropdown__info">
          <span className="cedros-profile-dropdown__name">{displayName}</span>
          {email && <span className="cedros-profile-dropdown__email">{email}</span>}
        </div>
        <svg
          className={`cedros-profile-dropdown__chevron ${isOpen ? 'cedros-profile-dropdown__chevron--open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="cedros-profile-dropdown__menu" role="menu">
          {onSettings && (
            <button
              type="button"
              className="cedros-profile-dropdown__item"
              onClick={handleSettings}
              role="menuitem"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Settings
            </button>
          )}
          {onLogout && (
            <button
              type="button"
              className="cedros-profile-dropdown__item cedros-profile-dropdown__item--danger"
              onClick={handleLogout}
              role="menuitem"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Log out
            </button>
          )}
        </div>
      )}
    </div>
  );
}
