import { useExternalEffect } from '../hooks/effects';
import { useState, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { sanitizeImageUrl } from '../utils/sanitization';
import { useI18n } from '../i18n';

export interface MenuItemConfig {
  /** Label to display */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Optional icon element */
  icon?: React.ReactNode;
}

export interface LoginButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  /** Custom menu items to show above "Sign out" */
  menuItems?: MenuItemConfig[];
  /** Hide the default "Sign out" item (default: false) */
  hideSignOut?: boolean;
}

/**
 * Login button that opens the login modal when clicked.
 * Shows user info when authenticated.
 */
export function LoginButton({
  className = '',
  variant = 'default',
  size = 'md',
  children,
  menuItems = [],
  hideSignOut = false,
}: LoginButtonProps) {
  const { t, message } = useI18n();
  const { user, isAuthenticated, isLoading, openLoginModal, logout } = useAuth();
  // State for keyboard-accessible dropdown
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Build list of all menu items (custom items + sign out)
  // Memoize to avoid recreating array on every render (fixes react-hooks/exhaustive-deps warning)
  const allMenuItems = useMemo(
    () => [...menuItems, ...(hideSignOut ? [] : [{ label: t.buttons.signOut, onClick: logout }])],
    [menuItems, hideSignOut, logout, t.buttons.signOut]
  );

  // Close menu on outside click or Escape
  useExternalEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setFocusedIndex(-1);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  // Keyboard navigation for menu
  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isMenuOpen || allMenuItems.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((i) => (i + 1) % allMenuItems.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((i) => (i - 1 + allMenuItems.length) % allMenuItems.length);
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(allMenuItems.length - 1);
          break;
        case 'Enter':
        case ' ':
          if (focusedIndex >= 0) {
            e.preventDefault();
            allMenuItems[focusedIndex].onClick();
            setIsMenuOpen(false);
            setFocusedIndex(-1);
          }
          break;
      }
    },
    [isMenuOpen, focusedIndex, allMenuItems]
  );

  const toggleMenu = useCallback(() => {
    if (allMenuItems.length === 0) return;
    setIsMenuOpen((open) => !open);
    setFocusedIndex(-1);
  }, [allMenuItems.length]);

  const sizeClasses = {
    sm: 'cedros-button-sm',
    md: 'cedros-button-md',
    lg: 'cedros-button-lg',
  };

  const variantClasses = {
    default: 'cedros-button-primary',
    outline: 'cedros-button-outline',
    ghost: 'cedros-button-ghost',
  };

  if (isLoading) {
    return (
      <button
        type="button"
        className={`cedros-button ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled
      >
        <LoadingSpinner size="sm" />
      </button>
    );
  }

  if (isAuthenticated && user) {
    const displayName = user.name || user.email || 'User';
    // Cache sanitized URL to avoid double-call and ensure consistent validation
    const sanitizedPicture = sanitizeImageUrl(user.picture);
    return (
      // Added keyboard handler and ref for accessibility
      <div className="cedros-user-menu" ref={menuRef} onKeyDown={handleMenuKeyDown}>
        {/* M-13: Added ARIA attributes for accessibility */}
        <button
          ref={buttonRef}
          type="button"
          className={`cedros-button cedros-user-button ${sizeClasses[size]} ${className}`}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-label={message(t.auth.userMenuFor, { name: displayName })}
          onClick={toggleMenu}
        >
          {sanitizedPicture ? (
            <img
              src={sanitizedPicture}
              alt={displayName}
              className="cedros-user-avatar"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="cedros-user-avatar-placeholder">
              {(displayName[0] || '?').toUpperCase()}
            </div>
          )}
          <span className="cedros-user-name">{displayName}</span>
        </button>
        {/* M-13: Added role="menu" for ARIA menu pattern */}
        {/* L-08: Show/hide controlled by state, keyboard navigable */}
        {isMenuOpen && (
          <div className="cedros-dropdown cedros-dropdown-open" role="menu">
            {menuItems.map((item, index) => (
              <button
                key={index}
                type="button"
                className={`cedros-dropdown-item ${focusedIndex === index ? 'cedros-dropdown-item-focused' : ''}`}
                role="menuitem"
                tabIndex={focusedIndex === index ? 0 : -1}
                onClick={() => {
                  item.onClick();
                  setIsMenuOpen(false);
                }}
              >
                {item.icon && <span className="cedros-dropdown-icon">{item.icon}</span>}
                {item.label}
              </button>
            ))}
            {menuItems.length > 0 && !hideSignOut && (
              <div className="cedros-dropdown-divider" role="separator" />
            )}
            {!hideSignOut && (
              <button
                type="button"
                className={`cedros-dropdown-item cedros-dropdown-item-danger ${focusedIndex === menuItems.length ? 'cedros-dropdown-item-focused' : ''}`}
                role="menuitem"
                tabIndex={focusedIndex === menuItems.length ? 0 : -1}
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
              >
                {t.buttons.signOut}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`cedros-button ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={openLoginModal}
    >
      {children || t.buttons.signIn}
    </button>
  );
}
