import { useExternalEffect } from '../../hooks/effects';
/**
 * OTP Input component (shadcn-style)
 *
 * A 6-digit input with separate boxes for each digit,
 * designed for TOTP verification codes.
 */

import { useRef, useCallback, useState, useId } from 'react';
import { useI18n } from '../../i18n';

/** Number of OTP digits */
const OTP_LENGTH = 6;

export interface OtpInputProps {
  /** Up to six digits; spaces preserve empty slots during editing. */
  value?: string;
  /** Called when the value changes */
  onChange?: (value: string) => void;
  /** Called when all 6 digits are entered */
  onComplete?: (value: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /** Auto-focus the first input on mount */
  autoFocus?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * OTP input with separate boxes for each digit (shadcn pattern)
 *
 * Features:
 * - Auto-advances to next input on digit entry
 * - Backspace moves to previous input
 * - Supports paste of full code
 * - Numeric keyboard on mobile
 */
export function OtpInput({
  value = '',
  onChange,
  onComplete,
  disabled = false,
  error,
  autoFocus = false,
  className = '',
}: OtpInputProps) {
  const { t, message } = useI18n();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [localValue, setLocalValue] = useState(value.padEnd(OTP_LENGTH, ' '));
  const id = useId();

  // Sync with controlled value
  useExternalEffect(() => {
    setLocalValue(value.padEnd(OTP_LENGTH, ' '));
  }, [value]);

  const focusInput = useCallback((index: number) => {
    if (index >= 0 && index < OTP_LENGTH) {
      inputRefs.current[index]?.focus();
    }
  }, []);

  const updateValue = useCallback(
    (newValue: string) => {
      const slots = newValue
        .replace(/[^0-9 ]/g, '')
        .slice(0, OTP_LENGTH)
        .padEnd(OTP_LENGTH, ' ');
      const sanitized = slots.trimEnd();
      setLocalValue(slots);
      onChange?.(sanitized);

      if (/^\d{6}$/.test(sanitized)) {
        onComplete?.(sanitized);
      }
    },
    [onChange, onComplete]
  );

  const handleChange = useCallback(
    (index: number, digit: string) => {
      if (/^\d{2,6}$/.test(digit)) {
        updateValue(digit);
        focusInput(Math.min(digit.length, OTP_LENGTH - 1));
        return;
      }
      if (!/^\d?$/.test(digit)) return;

      const chars = localValue.split('');
      chars[index] = digit || ' ';
      const newValue = chars.join('');
      updateValue(newValue);

      // Move to next input if digit entered
      if (digit && index < OTP_LENGTH - 1) {
        focusInput(index + 1);
      }
    },
    [localValue, updateValue, focusInput]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const chars = localValue.split('');

        if (chars[index] && chars[index] !== ' ') {
          // Clear current digit
          chars[index] = ' ';
          updateValue(chars.join(''));
        } else if (index > 0) {
          // Move to previous and clear it
          chars[index - 1] = ' ';
          updateValue(chars.join(''));
          focusInput(index - 1);
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        focusInput(index - 1);
      } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
        e.preventDefault();
        focusInput(index + 1);
      }
    },
    [localValue, updateValue, focusInput]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text');
      const digits = pasted.replace(/\D/g, '').slice(0, OTP_LENGTH);
      if (digits) {
        updateValue(digits);
        // Focus the next empty slot or the last one
        focusInput(Math.min(digits.length, OTP_LENGTH - 1));
      }
    },
    [updateValue, focusInput]
  );

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  }, []);

  // Auto-focus first input
  useExternalEffect(() => {
    if (autoFocus && !disabled) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus, disabled]);

  return (
    <div className={`cedros-otp-input ${className}`}>
      <div className="cedros-otp-slots" role="group" aria-label={t.auth.oneTimePassword}>
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            id={`${id}-${index}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={OTP_LENGTH}
            className={`cedros-otp-slot ${error ? 'cedros-otp-slot-error' : ''}`}
            value={localValue[index] === ' ' ? '' : localValue[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={handleFocus}
            disabled={disabled}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={message(t.auth.otpDigit, { index: index + 1 })}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={error ? 'true' : undefined}
          />
        ))}
      </div>
      {error && (
        <p id={`${id}-error`} className="cedros-otp-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
