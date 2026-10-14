/**
 * EditableTextField — a labelled value row that flips to inline edit on demand.
 *
 * Used for the display-name and username profile fields. Supports synchronous
 * format validation plus an optional debounced async availability check (for
 * usernames), with live "Available / Taken" feedback while typing.
 */

import { useCallback, useRef, useState } from 'react';
import { useExternalEffect } from '../../hooks/effects';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export interface EditableTextFieldProps {
  label: string;
  /** Current saved value */
  value: string;
  placeholder?: string;
  /** Shown (muted) when there is no saved value */
  emptyText?: string;
  /** Static prefix rendered inside the control, e.g. "@" */
  prefix?: string;
  helpText?: string;
  /** Synchronous format check — return an error message or null when valid */
  validateFormat?: (value: string) => string | null;
  /** Debounced async check (e.g. username availability) — return error or null */
  checkAvailable?: (value: string) => Promise<string | null>;
  /** Persist the trimmed value; rejects to surface an error */
  onSave: (value: string) => Promise<void>;
  className?: string;
}

type Availability = { status: 'idle' | 'checking' | 'ok' | 'error'; message?: string };

export function EditableTextField({
  label,
  value,
  placeholder,
  emptyText = 'Not set',
  prefix,
  helpText,
  validateFormat,
  checkAvailable,
  onSave,
  className = '',
}: EditableTextFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [availability, setAvailability] = useState<Availability>({ status: 'idle' });
  const debounceRef = useRef<number | null>(null);
  const checkSeq = useRef(0);

  const start = useCallback(() => {
    setDraft(value);
    setError(null);
    setAvailability({ status: 'idle' });
    setEditing(true);
  }, [value]);

  const cancel = useCallback(() => {
    setEditing(false);
    setError(null);
    setAvailability({ status: 'idle' });
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
  }, []);

  // Debounced availability check while the draft changes.
  useExternalEffect(() => {
    if (!editing || !checkAvailable) return;
    const trimmed = draft.trim();
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (trimmed === value.trim() || trimmed.length === 0) {
      setAvailability({ status: 'idle' });
      return;
    }
    const formatError = validateFormat?.(trimmed) ?? null;
    if (formatError) {
      setAvailability({ status: 'error', message: formatError });
      return;
    }
    const seq = ++checkSeq.current;
    setAvailability({ status: 'checking' });
    debounceRef.current = window.setTimeout(async () => {
      try {
        const result = await checkAvailable(trimmed);
        if (seq !== checkSeq.current) return; // a newer keystroke superseded this
        setAvailability(
          result ? { status: 'error', message: result } : { status: 'ok', message: 'Available' }
        );
      } catch {
        if (seq === checkSeq.current) setAvailability({ status: 'idle' });
      }
    }, 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [draft, editing, checkAvailable, validateFormat, value]);

  const save = useCallback(async () => {
    const trimmed = draft.trim();
    const formatError = validateFormat?.(trimmed) ?? null;
    if (formatError) {
      setError(formatError);
      return;
    }
    if (availability.status === 'error') {
      setError(availability.message ?? 'Value is not available.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setIsSaving(false);
    }
  }, [draft, validateFormat, availability, onSave]);

  return (
    <div className={`cedros-field ${className}`.trim()}>
      <div className="cedros-field__head">
        <span className="cedros-field__label">{label}</span>
        {!editing && (
          <button
            type="button"
            className="cedros-button cedros-button-ghost cedros-button-sm"
            onClick={start}
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <>
          {helpText && <span className="cedros-field__help">{helpText}</span>}
          <div className="cedros-field__control">
            {prefix && <span className="cedros-field__prefix">{prefix}</span>}
            <input
              type="text"
              className="cedros-input"
              value={draft}
              placeholder={placeholder}
              disabled={isSaving}
              autoFocus
              aria-label={label}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save();
                if (e.key === 'Escape') cancel();
              }}
            />
          </div>
          {availability.status === 'checking' && (
            <span className="cedros-field__hint">Checking availability…</span>
          )}
          {availability.status === 'ok' && (
            <span className="cedros-field__hint cedros-field__hint--ok">
              {availability.message}
            </span>
          )}
          {(error || availability.status === 'error') && (
            <span className="cedros-field__hint cedros-field__hint--error">
              {error ?? availability.message}
            </span>
          )}
          <div className="cedros-field__actions">
            <button
              type="button"
              className="cedros-button cedros-button-primary cedros-button-sm"
              onClick={save}
              disabled={isSaving || availability.status === 'checking'}
            >
              {isSaving ? <LoadingSpinner size="sm" /> : 'Save'}
            </button>
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-sm"
              onClick={cancel}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <span className={`cedros-field__value${value ? '' : ' cedros-field__value--empty'}`}>
          {value ? `${prefix ?? ''}${value}` : emptyText}
        </span>
      )}
    </div>
  );
}
