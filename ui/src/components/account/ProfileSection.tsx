/**
 * ProfileSection — the Profile tab of the account settings page.
 *
 * Composes the avatar uploader and inline-editable name and username fields
 * into one card. Name persists via PATCH /me; username validates + checks
 * availability before persisting. Email management lives in the Emails tab.
 */

import { useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useUsername } from '../../hooks/useUsername';
import { AvatarUploader } from './AvatarUploader';
import { EditableTextField } from './EditableTextField';

const RESERVED_USERNAMES = new Set([
  'admin',
  'system',
  'support',
  'help',
  'root',
  'moderator',
  'mod',
  'staff',
  'cedros',
]);

/** Mirror of the server's username rules so we fail fast before the round-trip. */
function validateUsername(value: string): string | null {
  if (value.length < 3) return 'Username must be at least 3 characters.';
  if (value.length > 30) return 'Username must be 30 characters or less.';
  if (!/^[a-z0-9_]+$/.test(value)) {
    return 'Use lowercase letters, numbers, and underscores only.';
  }
  if (value.startsWith('_') || value.endsWith('_')) {
    return 'Username cannot start or end with an underscore.';
  }
  if (RESERVED_USERNAMES.has(value)) return 'That username is reserved.';
  return null;
}

function validateName(value: string): string | null {
  if (value.length === 0) return 'Name cannot be empty.';
  if (value.length > 100) return 'Name must be 100 characters or less.';
  return null;
}

export interface ProfileSectionProps {
  className?: string;
}

export function ProfileSection({ className = '' }: ProfileSectionProps) {
  const { user, refreshUser } = useAuth();
  const { updateProfile } = useProfile();
  const { checkAvailability, setUsername } = useUsername();

  const saveName = useCallback(
    async (name: string) => {
      await updateProfile({ name });
      await refreshUser();
    },
    [updateProfile, refreshUser]
  );

  const saveUsername = useCallback(
    async (username: string) => {
      await setUsername(username);
      await refreshUser();
    },
    [setUsername, refreshUser]
  );

  const checkUsername = useCallback(
    async (username: string): Promise<string | null> => {
      const result = await checkAvailability(username);
      if (result.available) return null;
      return result.error || 'That username is taken.';
    },
    [checkAvailability]
  );

  return (
    <div className={`cedros-account-card ${className}`.trim()}>
      <AvatarUploader />
      <div className="cedros-account-card__divider" />
      <EditableTextField
        label="Display name"
        value={user?.name ?? ''}
        placeholder="Your name"
        validateFormat={validateName}
        onSave={saveName}
      />
      <div className="cedros-account-card__divider" />
      <EditableTextField
        label="Username"
        value={user?.username ?? ''}
        placeholder="username"
        prefix="@"
        helpText="3–30 characters: lowercase letters, numbers, and underscores."
        validateFormat={validateUsername}
        checkAvailable={checkUsername}
        onSave={saveUsername}
      />
    </div>
  );
}
