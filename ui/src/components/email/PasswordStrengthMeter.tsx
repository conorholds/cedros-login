import { useId } from 'react';
import { useTranslations } from '../../i18n';
import type { PasswordValidation } from '../../types';

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="4.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export interface PasswordStrengthMeterProps {
  /** Result of validatePassword for the current value. */
  validation: PasswordValidation;
  /** id applied to the requirements list so the input can aria-describedby it. */
  requirementsId?: string;
}

/**
 * Honest password feedback: a validity-gated strength bar plus a full
 * requirements checklist (every rule shown with a met/unmet state).
 *
 * The bar is amber while the password is invalid and green only once every
 * requirement is met, so it can never contradict a disabled submit button.
 * Requirement state is conveyed by icon + text (not colour alone), and progress
 * is announced via a polite live region keyed to the met-count.
 */
export function PasswordStrengthMeter({ validation, requirementsId }: PasswordStrengthMeterProps) {
  const t = useTranslations();
  const titleId = useId();
  const { strength, isValid, metCount, requirements } = validation;
  const total = requirements.length;
  const fillPct = total > 0 ? Math.round((metCount / total) * 100) : 0;
  const validAttr = isValid ? 'true' : 'false';

  const summary = isValid
    ? t.passwordValidation.allRequirementsMet
    : t.passwordValidation.requirementsProgress
        .replace('{met}', String(metCount))
        .replace('{total}', String(total));

  return (
    <div className="cedros-password-meter">
      <div className="cedros-password-strength">
        <div className="cedros-strength-bar">
          <div
            className="cedros-strength-fill"
            data-valid={validAttr}
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <span className="cedros-strength-label" data-valid={validAttr}>
          {t.passwordValidation[strength]}
        </span>
      </div>

      <p id={titleId} className="cedros-password-requirements-title">
        {t.passwordValidation.requirementsTitle}
      </p>
      <ul id={requirementsId} className="cedros-password-requirements" aria-labelledby={titleId}>
        {requirements.map((req) => (
          <li
            key={req.key}
            className="cedros-password-requirement"
            data-met={req.met ? 'true' : 'false'}
          >
            <span className="cedros-requirement-icon">
              {req.met ? <CheckIcon /> : <PendingIcon />}
            </span>
            <span className="cedros-requirement-text">{req.label}</span>
            <span className="cedros-sr-only">
              {' — '}
              {req.met ? t.passwordValidation.met : t.passwordValidation.notMet}
            </span>
          </li>
        ))}
      </ul>

      {/* Keyed to met-count, so screen readers hear progress only when it changes. */}
      <span role="status" aria-live="polite" className="cedros-sr-only">
        {summary}
      </span>
    </div>
  );
}
