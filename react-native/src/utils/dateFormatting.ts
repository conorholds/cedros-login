/**
 * Format an ISO date/time for display using the runtime locale by default.
 *
 * Inputs:
 * - dateString: an ISO-compatible date/time string from the API.
 * - options: Intl date/time display options.
 * - locale: optional override for callers that already know the user's locale.
 *
 * Output: locale-formatted date/time text. Invalid dates/locales return a
 * stable fallback so rendering remains resilient.
 */
export function formatLocaleDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions,
  locale?: Intl.LocalesArgument,
): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Invalid Date";
  }

  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    if (error instanceof RangeError) {
      return "Invalid Date";
    }

    throw error;
  }
}
