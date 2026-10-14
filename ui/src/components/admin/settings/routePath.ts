/**
 * Normalization helpers for app-relative route/path settings (e.g. the welcome
 * route). Routes are stored with a single leading slash and no trailing slash;
 * these helpers absorb the common manual-entry mistakes — wrapping quotes, stray
 * whitespace, missing/doubled slashes. Intended for simple app paths, not full
 * URLs or query strings.
 *
 * Two tiers so the live (per-keystroke) value is already safe to autosave while
 * a sub-path is still being typed:
 *  - {@link cleanSlug}     runs on every change. Fixes everything EXCEPT a
 *                          trailing slash, so `app/` can still become `app/welcome`.
 *  - {@link normalizeSlug} runs on blur. Also drops the trailing slash.
 */

/** Strip a single matched pair of wrapping quotes, surrounding whitespace, and
 * any leading slashes (the leading slash is owned by the input's affix). */
function tidy(raw: string): string {
  let s = raw.trim();
  if (s.length >= 2 && /^(["']).*\1$/.test(s)) s = s.slice(1, -1).trim();
  return s.replace(/^\/+/, '');
}

/**
 * Live form (per keystroke): tidy, drop any stray quotes and inner whitespace,
 * and collapse repeated slashes. A trailing slash is preserved so a sub-path can
 * still be typed; the value is otherwise safe to persist.
 */
export function cleanSlug(raw: string): string {
  return tidy(raw)
    .replace(/["']/g, '')
    .replace(/\s+/g, '')
    .replace(/\/{2,}/g, '/');
}

/**
 * Canonical form (on blur): {@link cleanSlug} plus dropping any trailing slash.
 * `/welcome/`, `"welcome"`, and `wel come` all land on `welcome`; empty stays empty.
 */
export function normalizeSlug(raw: string): string {
  return cleanSlug(raw).replace(/\/+$/, '');
}

/** Join a slug back to the stored path; an empty slug clears the value. */
export function slugToPath(slug: string): string {
  return slug ? `/${slug}` : '';
}
