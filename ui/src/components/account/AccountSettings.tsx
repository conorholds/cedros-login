/**
 * AccountSettings — full-featured account settings page with a sidebar.
 *
 * A Shadcn-inspired settings surface: a vertical section nav on the left and the
 * active section's content on the right. Sections compose the focused building
 * blocks (ProfileSection, SecuritySection, LinkedAccounts, DeleteAccountSection)
 * so each concern stays independently testable.
 *
 * On narrow viewports the nav collapses to a horizontal, scrollable tab strip.
 */

import { useId, useRef, useState } from 'react';
import { ProfileSection } from './ProfileSection';
import type { ProfileSectionProps } from './ProfileSection';
import { SecuritySection } from './SecuritySection';
import type { SecuritySectionProps } from './SecuritySection';
import { EmailManagement } from './EmailManagement';
import { LinkedAccounts } from './LinkedAccounts';
import type { LinkedAccountsProps } from './LinkedAccounts';
import { DeleteAccountSection } from './DeleteAccountSection';
import { InviteCodesSection } from './InviteCodesSection';

export type AccountSection = 'profile' | 'emails' | 'security' | 'connected' | 'invites' | 'danger';

const SECTIONS: SectionMeta[] = [
  {
    id: 'profile',
    label: 'Profile',
    description: 'This is how others will see you.',
    icon: UserIcon,
  },
  {
    id: 'emails',
    label: 'Emails',
    description: 'Add and verify the email addresses you can use to sign in.',
    icon: MailIcon,
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Your password, two-factor authentication, and signed-in devices.',
    icon: ShieldIcon,
  },
  {
    id: 'connected',
    label: 'Connected accounts',
    description: 'The ways you can sign in to your account.',
    icon: LinkIcon,
  },
  {
    id: 'invites',
    label: 'Invite codes',
    description: 'Invite codes available for you to share.',
    icon: TicketIcon,
  },
  {
    id: 'danger',
    label: 'Danger zone',
    description: 'Permanently delete your account.',
    icon: TrashIcon,
  },
];

export interface AccountSettingsProps
  extends ProfileSectionProps, SecuritySectionProps, LinkedAccountsProps {
  /** Called after the account's email addresses change (added or new primary) */
  onEmailChange?: () => void;
  /** Which section to show initially */
  defaultSection?: AccountSection;
  /** Called when the user requests to close the settings page */
  onClose?: () => void;
  /** Called after the current account is deleted */
  onAccountDeleted?: () => void;
  /** Additional CSS class */
  className?: string;
}

interface SectionMeta {
  id: AccountSection;
  label: string;
  description: string;
  icon: () => React.ReactElement;
}

export function AccountSettings({
  defaultSection = 'profile',
  onClose,
  onPasswordChange,
  onEmailChange,
  onTotpChange,
  onAccountDeleted,
  onLinkGoogle,
  onLinkApple,
  onAddPasskey,
  onLinkSolana,
  className = '',
}: AccountSettingsProps) {
  const [active, setActive] = useState<AccountSection>(defaultSection);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeMeta = SECTIONS.find((section) => section.id === active) ?? SECTIONS[0];

  // ARIA tabs keyboard pattern: roving focus with arrows/Home/End, automatic
  // activation (focusing a tab selects it — switching panels is cheap).
  const handleTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const count = SECTIONS.length;
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        next = (index + 1) % count;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        next = (index - 1 + count) % count;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setActive(SECTIONS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={`cedros-account ${className}`.trim()}>
      <nav className="cedros-account__nav" role="tablist" aria-orientation="vertical">
        {SECTIONS.map((section, index) => {
          const Icon = section.icon;
          const selected = section.id === active;
          return (
            <button
              key={section.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${section.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${section.id}`}
              tabIndex={selected ? 0 : -1}
              className={`cedros-account__nav-item${
                selected ? ' cedros-account__nav-item--active' : ''
              }`}
              onClick={() => setActive(section.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <span className="cedros-account__nav-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="cedros-account__nav-label">{section.label}</span>
            </button>
          );
        })}
      </nav>

      <div
        className="cedros-account__content"
        role="tabpanel"
        id={`${baseId}-panel-${active}`}
        aria-labelledby={`${baseId}-tab-${active}`}
        tabIndex={0}
      >
        <header className="cedros-account__header">
          <h2 className="cedros-account__title">{activeMeta.label}</h2>
          <p className="cedros-account__description">{activeMeta.description}</p>
        </header>

        {/* Keyed on the active section so it remounts (and replays the entrance
            animation) on every tab switch. */}
        <div key={active} className="cedros-account__panel">
          {active === 'profile' && <ProfileSection />}
          {active === 'emails' && (
            <div className="cedros-account-card cedros-account-card--pad">
              {/* The section header above already titles this panel. */}
              <EmailManagement showHeader={false} onEmailChange={onEmailChange} />
            </div>
          )}
          {active === 'security' && (
            <SecuritySection onPasswordChange={onPasswordChange} onTotpChange={onTotpChange} />
          )}
          {active === 'connected' && (
            <div className="cedros-account-card cedros-account-card--pad">
              <LinkedAccounts
                onLinkGoogle={onLinkGoogle}
                onLinkApple={onLinkApple}
                onAddPasskey={onAddPasskey}
                onLinkSolana={onLinkSolana}
              />
            </div>
          )}
          {active === 'invites' && <InviteCodesSection />}
          {active === 'danger' && <DeleteAccountSection onDeleted={onAccountDeleted} />}
        </div>

        {onClose && (
          <div className="cedros-account__footer">
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-md"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Section icons (Shadcn/lucide-style 1.5px line icons) ---

function iconProps() {
  return {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

function UserIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg {...iconProps()}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a2 2 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M2 9a3 3 0 1 0 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 1 0 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
