import { useState, useCallback } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';

export interface CompleteAccountPromptProps {
  /** Called after the user saves their profile info */
  onComplete?: () => void;
  /** Called when the user chooses to skip */
  onSkip?: () => void;
  className?: string;
}

/**
 * Prompts the user to fill in their display name.
 *
 * Shown when the server returns `postLogin.action === 'complete_profile'`,
 * indicating the user is missing a name (e.g., passkey-only or Solana-only
 * signups).
 *
 * Uses the existing `useProfile().updateProfile()` to save changes.
 */
export function CompleteAccountPrompt({
  onComplete,
  onSkip,
  className,
}: CompleteAccountPromptProps) {
  const { user } = useAuth();
  const { isLoading, error, updateProfile, clearError } = useProfile();

  const [name, setName] = useState(user?.name ?? '');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();

      const trimmed = name.trim();
      if (!trimmed) {
        onComplete?.();
        return;
      }

      try {
        await updateProfile({ name: trimmed });
        onComplete?.();
      } catch {
        // Error state is managed by useProfile
      }
    },
    [name, updateProfile, clearError, onComplete]
  );

  const hasChanges = name.trim().length > 0;

  return (
    <div className={`cedros-complete-account ${className ?? ''}`}>
      <div className="cedros-complete-account__header">
        <h2 className="cedros-complete-account__title">Complete Your Profile</h2>
        <p className="cedros-complete-account__description">
          Please fill in your name to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="cedros-complete-account__form">
        <div className="cedros-complete-account__field">
          <label htmlFor="cedros-complete-name" className="cedros-complete-account__label">
            Name
          </label>
          <input
            id="cedros-complete-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="cedros-complete-account__input"
            maxLength={100}
            autoFocus
          />
        </div>

        {error && (
          <div className="cedros-complete-account__error" role="alert">
            {error.message}
          </div>
        )}

        <div className="cedros-complete-account__actions">
          <button
            type="submit"
            className="cedros-complete-account__button cedros-complete-account__button--primary"
            disabled={isLoading || !hasChanges}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            className="cedros-complete-account__button cedros-complete-account__button--secondary"
            onClick={onSkip}
            disabled={isLoading}
          >
            Skip
          </button>
        </div>
      </form>
    </div>
  );
}
