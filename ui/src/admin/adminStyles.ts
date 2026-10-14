import { ensureCedrosLoginRuntimeStyles } from '../extension/runtimeStyles';

/**
 * Runtime stylesheet injection for the compiled admin runtime.
 *
 * Cedros platform loads the admin surface by importing the compiled
 * `@cedros/login-react/admin/register` entry directly from the uploaded
 * `.cedros-extension.zip`. There is no HTML host that links the bundled
 * `login-react.css`, so the admin sections render with default browser styles
 * unless the entry injects its own stylesheet at module-evaluation time.
 *
 * The CSS string is inlined into the admin entry at build time (Vite `?inline`
 * import), keeping the runtime self-contained — no extra package import and no
 * reliance on the host auto-loading exported package CSS.
 */

/** Stable id so injection is idempotent across repeated imports. */
export const CEDROS_LOGIN_ADMIN_STYLE_ELEMENT_ID = 'cedros-login-admin-styles';

/**
 * Inject the admin runtime stylesheet into the document head exactly once.
 *
 * - SSR / non-DOM hosts: no-op (guards on `document`).
 * - Empty CSS: no-op.
 * - Repeated calls: no-op once the style element exists.
 */
export function ensureCedrosLoginAdminStyles(css: string): void {
  ensureCedrosLoginRuntimeStyles(css, CEDROS_LOGIN_ADMIN_STYLE_ELEMENT_ID);
}
