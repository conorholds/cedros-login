import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { I18nProvider, formatMessage, useI18n, useTranslations } from '.';

function TranslationProbe() {
  const t = useTranslations();
  const { locale, number, message } = useI18n();
  return (
    <div>
      <span>{locale}</span>
      <button>{t.buttons.signIn}</button>
      <output>{number(1234.5)}</output>
      <p>{message(t.errors.rateLimitedWithSeconds, { seconds: 1 })}</p>
      <p>{t.auth.inviteCodeRequiredBody}</p>
    </div>
  );
}

describe('Cedros i18n', () => {
  it('merges partial overrides and normalizes locale', () => {
    render(
      <I18nProvider locale="fr-fr" translations={{ buttons: { signIn: 'Se connecter' } }}>
        <TranslationProbe />
      </I18nProvider>
    );

    expect(screen.getByText('fr-FR')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
    expect(screen.getByText('1 234,5')).toBeInTheDocument();
    expect(screen.getByText(/1 second before trying again/)).toBeInTheDocument();
    expect(screen.getByText(/waiting for an invite code/)).toBeInTheDocument();
  });

  it('formats plural messages using Intl plural rules', () => {
    const template = '{count} {count, plural, one {attempt} other {attempts}} remaining';

    expect(formatMessage(template, { count: 1 }, 'en')).toBe('1 attempt remaining');
    expect(formatMessage(template, { count: 2 }, 'en')).toBe('2 attempts remaining');
  });
});
