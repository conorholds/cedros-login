import { afterEach, describe, expect, it } from 'vitest';

import { ensureCedrosLoginRuntimeStyles } from './runtimeStyles';

const STYLE_ID = 'cedros-login-runtime-test-styles';

function injectedStyles(): HTMLStyleElement[] {
  return Array.from(document.querySelectorAll<HTMLStyleElement>(`#${STYLE_ID}`));
}

afterEach(() => {
  for (const style of injectedStyles()) style.remove();
});

describe('ensureCedrosLoginRuntimeStyles', () => {
  it('injects a provided runtime stylesheet into the document head', () => {
    ensureCedrosLoginRuntimeStyles('.cedros-login-form{width:100%}', STYLE_ID);

    const styles = injectedStyles();
    expect(styles).toHaveLength(1);
    expect(styles[0]!.parentElement).toBe(document.head);
    expect(styles[0]!.textContent).toBe('.cedros-login-form{width:100%}');
  });

  it('keeps injection idempotent for repeated runtime imports', () => {
    ensureCedrosLoginRuntimeStyles('.cedros-login-form{width:100%}', STYLE_ID);
    ensureCedrosLoginRuntimeStyles('.cedros-login-form{width:auto}', STYLE_ID);

    const styles = injectedStyles();
    expect(styles).toHaveLength(1);
    expect(styles[0]!.textContent).toBe('.cedros-login-form{width:100%}');
  });
});
