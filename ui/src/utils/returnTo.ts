const MAX_RETURN_TO_LENGTH = 2_048;

/** Returns one same-origin relative `returnTo` value from a page URL. */
export function safeReturnToPath(currentUrl: string | undefined): string | null {
  if (!currentUrl) return null;

  try {
    const pageUrl = new URL(currentUrl);
    const returnToValues = pageUrl.searchParams.getAll('returnTo');
    if (returnToValues.length !== 1) return null;

    const path = returnToValues[0]?.trim();
    if (!path?.startsWith('/') || path.startsWith('//') || path.length > MAX_RETURN_TO_LENGTH) {
      return null;
    }

    const destination = new URL(path, pageUrl);
    if (destination.origin !== pageUrl.origin) return null;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return null;
  }
}

/** Builds a login link that preserves a validated continuation from `currentUrl`. */
export function loginHrefWithReturnTo(currentUrl: string | undefined): string {
  const returnTo = safeReturnToPath(currentUrl);
  return returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login';
}
