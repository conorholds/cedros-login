import { useState, useId, type InputHTMLAttributes } from 'react';
import { validatePassword } from '../../utils/validation';
import { useTranslations } from '../../i18n';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import type { PasswordValidation } from '../../types';
import { CollapsibleBody } from '../shared/MotionPrimitives';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  /** Action element shown on the right side of the label (e.g., "Forgot password?" link) */
  labelAction?: React.ReactNode;
  showStrengthMeter?: boolean;
  onValidationChange?: (validation: PasswordValidation) => void;
  error?: string;
}

/**
 * Password input with visibility toggle and optional strength meter
 */
export function PasswordInput({
  label,
  labelAction,
  showStrengthMeter = false,
  onValidationChange,
  error,
  className = '',
  onChange,
  onFocus,
  onBlur,
  value,
  id,
  'aria-describedby': externalDescription,
  ...props
}: PasswordInputProps) {
  const t = useTranslations();
  const labelText = label ?? t.auth.password;
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const [validation, setValidation] = useState<PasswordValidation | null>(null);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const requirementsId = `${inputId}-requirements`;

  // Show the meter as soon as the field is focused (so the rules are visible
  // before typing) and keep it while it holds a value.
  const hasValue = typeof value === 'string' && value.length > 0;
  const showMeter = showStrengthMeter && (focused || hasValue);
  const displayValidation =
    validation ??
    (showStrengthMeter
      ? validatePassword(typeof value === 'string' ? value : '', t.passwordValidation)
      : null);

  const describedBy = [
    externalDescription,
    error ? `${inputId}-error` : null,
    showMeter ? requirementsId : null,
  ]
    .filter(Boolean)
    .join(' ');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (showStrengthMeter || onValidationChange) {
      const newValidation = validatePassword(newValue, t.passwordValidation);
      setValidation(newValidation);
      onValidationChange?.(newValidation);
    }

    onChange?.(e);
  };

  return (
    <div className={`cedros-password-input ${className}`}>
      <div className="cedros-label-row">
        <label htmlFor={inputId} className="cedros-label">
          {labelText}
        </label>
        {labelAction}
      </div>
      <div className="cedros-password-wrapper">
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className="cedros-input"
          onChange={handleChange}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          value={value}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
          {...props}
        />
        <button
          type="button"
          className="cedros-password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 17L17 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
        </button>
      </div>

      {error && (
        <p id={`${inputId}-error`} className="cedros-input-error">
          {error}
        </p>
      )}

      {showStrengthMeter && displayValidation && (
        <CollapsibleBody open={showMeter}>
          <PasswordStrengthMeter validation={displayValidation} requirementsId={requirementsId} />
        </CollapsibleBody>
      )}
    </div>
  );
}
