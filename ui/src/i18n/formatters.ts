export type MessageValues = Record<string, string | number | boolean | null | undefined>;

const PLURAL_PATTERN = /\{(\w+),\s*plural,\s*one\s*\{([^{}]*)\}\s*other\s*\{([^{}]*)\}\s*\}/g;
const VALUE_PATTERN = /\{(\w+)\}/g;

/**
 * Normalizes a BCP 47 locale string for Intl APIs.
 *
 * @param locale Candidate locale from configuration, route params, or browser state.
 * @returns A locale accepted by Intl, falling back to English when invalid or empty.
 */
export function normalizeLocale(locale?: string | null): string {
  if (!locale) return 'en';
  try {
    return Intl.getCanonicalLocales(locale)[0] ?? 'en';
  } catch {
    return 'en';
  }
}

/**
 * Formats a message with named values and a small ICU plural subset.
 *
 * Supported plural shape:
 * `{count, plural, one {day} other {days}}`
 */
export function formatMessage(message: string, values: MessageValues = {}, locale = 'en'): string {
  const normalizedLocale = normalizeLocale(locale);
  return message
    .replace(PLURAL_PATTERN, (_match, key: string, one: string, other: string) => {
      const value = Number(values[key]);
      if (!Number.isFinite(value)) return other;
      const category = new Intl.PluralRules(normalizedLocale).select(value);
      return category === 'one' ? one : other;
    })
    .replace(VALUE_PATTERN, (_match, key: string) => {
      const value = values[key];
      return value === null || value === undefined ? '' : String(value);
    });
}

export function formatNumber(
  value: number,
  locale?: string | null,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(normalizeLocale(locale), options).format(value);
}

export function formatDate(
  value: Date | string | number,
  locale?: string | null,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(normalizeLocale(locale), options).format(date);
}

export function formatDateTime(
  value: Date | string | number,
  locale?: string | null,
  options?: Intl.DateTimeFormatOptions
): string {
  return formatDate(value, locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  });
}

export function formatRelativeDays(
  dayOffset: number,
  locale?: string | null,
  options?: Intl.RelativeTimeFormatOptions
): string {
  return new Intl.RelativeTimeFormat(normalizeLocale(locale), {
    numeric: 'auto',
    ...options,
  }).format(dayOffset, 'day');
}

export function localeCompare(locale: string | null | undefined, left: string, right: string) {
  return new Intl.Collator(normalizeLocale(locale), {
    sensitivity: 'base',
    numeric: true,
  }).compare(left, right);
}

export function localizePath(path: string, locale?: string | null, defaultLocale = 'en'): string {
  const normalizedLocale = normalizeLocale(locale);
  if (!path.startsWith('/')) return path;
  if (normalizedLocale === normalizeLocale(defaultLocale)) return path;

  const segments = path.split('/').filter(Boolean);
  if (segments[0] === normalizedLocale) return path;
  return `/${[normalizedLocale, ...segments].join('/')}`;
}
