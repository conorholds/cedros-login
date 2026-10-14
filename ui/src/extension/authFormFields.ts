import type { useTranslations } from '../i18n';
import type { AuthFormMode } from './authFormBlockRenderer';

interface AuthField {
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
}

/** Returns browser-entered fields; URL action tokens are never authored inputs. */
export function authFieldsForMode(
  mode: AuthFormMode,
  t: ReturnType<typeof useTranslations>
): AuthField[] {
  if (mode === 'forgot-password') {
    return [field('email', t.auth.emailAddress, 'email', 'email', t.auth.emailPlaceholder)];
  }
  if (mode === 'verify-email' || mode === 'instant-link-verify' || mode === 'accept-invite') {
    return [];
  }
  if (mode === 'reset-password') {
    return [
      field('new_password', t.auth.newPassword, 'password', 'new-password', t.auth.createPassword),
      field(
        'confirmPassword',
        t.auth.confirmPassword,
        'password',
        'new-password',
        t.auth.confirmYourPassword
      ),
    ];
  }
  if (mode === 'create-account') {
    return [
      field('name', t.auth.name, 'text', 'name', t.auth.namePlaceholder),
      field('email', t.auth.email, 'email', 'email', t.auth.emailPlaceholder),
      field('password', t.auth.password, 'password', 'new-password', t.auth.createPassword),
      field(
        'confirmPassword',
        t.auth.confirmPassword,
        'password',
        'new-password',
        t.auth.confirmYourPassword
      ),
    ];
  }
  return [
    field('email', t.auth.email, 'email', 'email', t.auth.emailPlaceholder),
    field('password', t.auth.password, 'password', 'current-password', t.auth.enterPassword),
  ];
}

function field(
  name: string,
  label: string,
  type: string,
  autoComplete: string,
  placeholder: string
): AuthField {
  return { name, label, type, autoComplete, placeholder };
}
