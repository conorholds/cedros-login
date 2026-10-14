import { useExternalEffect } from '../hooks/effects';
import { useState, useCallback, useRef } from 'react';
import { useUsername } from '../hooks/useUsername';

export interface ChooseUsernamePromptProps {
  /** Called after the user saves their username */
  onComplete?: () => void;
  /** Called when the user chooses to skip */
  onSkip?: () => void;
  className?: string;
}

type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

/**
 * Prompts the user to choose a unique handle-style username.
 *
 * Shown when the server returns `postLogin.action === 'choose_username'`,
 * indicating the admin has enabled username selection and the user hasn't
 * chosen one yet.
 */
export function ChooseUsernamePrompt({ onComplete, onSkip, className }: ChooseUsernamePromptProps) {
  const { checkAvailability, getSuggestion, setUsername, isLoading, error } = useUsername();

  const [value, setValue] = useState('');
  const [status, setStatus] = useState<AvailabilityStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // Fetch a random suggestion on mount
  useExternalEffect(() => {
    mountedRef.current = true;
    getSuggestion().then((suggestion) => {
      if (mountedRef.current && suggestion) {
        setValue(suggestion);
        setStatus('available');
        setStatusMessage('Available');
      }
    });
    return () => {
      mountedRef.current = false;
    };
  }, [getSuggestion]);

  const handleChange = useCallback(
    (raw: string) => {
      // Auto-lowercase, strip invalid chars
      const cleaned = raw.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setValue(cleaned);
      setStatus('idle');
      setStatusMessage('');

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (cleaned.length < 3) {
        if (cleaned.length > 0) {
          setStatus('error');
          setStatusMessage('At least 3 characters');
        }
        return;
      }

      setStatus('checking');
      debounceRef.current = setTimeout(async () => {
        try {
          const result = await checkAvailability(cleaned);
          if (!mountedRef.current) return;
          if (result.error) {
            setStatus('error');
            setStatusMessage(result.error);
          } else if (result.available) {
            setStatus('available');
            setStatusMessage('Available');
          } else {
            setStatus('taken');
            setStatusMessage('Already taken');
          }
        } catch {
          if (!mountedRef.current) return;
          setStatus('error');
          setStatusMessage('Could not check availability');
        }
      }, 400);
    },
    [checkAvailability]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (status !== 'available' || !value.trim()) return;

      try {
        await setUsername(value.trim());
        onComplete?.();
      } catch {
        // Error state is managed by useUsername
      }
    },
    [value, status, setUsername, onComplete]
  );

  const canSubmit = status === 'available' && !isLoading;

  return (
    <div className={`cedros-choose-username ${className ?? ''}`}>
      <div className="cedros-choose-username__header">
        <h2 className="cedros-choose-username__title">Choose a Username</h2>
        <p className="cedros-choose-username__description">
          Pick a unique handle for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="cedros-choose-username__form">
        <div className="cedros-choose-username__field">
          <label htmlFor="cedros-choose-username" className="cedros-choose-username__label">
            Username
          </label>
          <div className="cedros-choose-username__input-wrapper">
            <span className="cedros-choose-username__prefix">@</span>
            <input
              id="cedros-choose-username"
              type="text"
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="swift_falcon_42"
              className="cedros-choose-username__input"
              maxLength={30}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          {statusMessage && (
            <span
              className={`cedros-choose-username__status cedros-choose-username__status--${status}`}
              role={status === 'error' || status === 'taken' ? 'alert' : undefined}
            >
              {status === 'checking' ? 'Checking...' : statusMessage}
            </span>
          )}
        </div>

        {error && (
          <div className="cedros-choose-username__error" role="alert">
            {error.message}
          </div>
        )}

        <div className="cedros-choose-username__actions">
          <button
            type="submit"
            className="cedros-choose-username__button cedros-choose-username__button--primary"
            disabled={!canSubmit}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
          <button
            type="button"
            className="cedros-choose-username__button cedros-choose-username__button--secondary"
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
