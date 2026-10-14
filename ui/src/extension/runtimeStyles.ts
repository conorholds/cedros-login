/**
 * Shared id for the public web/runtime stylesheet element. Both the web
 * registration entry and the self-hydrating account block inject under this id
 * so whichever runs first wins and the other becomes a no-op (no duplication).
 */
export const CEDROS_LOGIN_WEB_STYLE_ELEMENT_ID = 'cedros-login-web-styles';

/**
 * Inject a compiled runtime stylesheet into DOM hosts that import extension
 * entries directly instead of linking the package CSS from HTML.
 */
export function ensureCedrosLoginRuntimeStyles(css: string, styleElementId: string): void {
  if (typeof document === 'undefined') return;
  if (!css) return;
  if (document.getElementById(styleElementId)) return;

  const style = document.createElement('style');
  style.id = styleElementId;
  style.textContent = css;
  (document.head ?? document.documentElement).appendChild(style);
}
