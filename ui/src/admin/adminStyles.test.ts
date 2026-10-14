import { afterEach, describe, expect, it } from 'vitest';

import { CEDROS_LOGIN_ADMIN_STYLE_ELEMENT_ID, ensureCedrosLoginAdminStyles } from './adminStyles';

function injectedStyles(): HTMLStyleElement[] {
  return Array.from(
    document.querySelectorAll<HTMLStyleElement>(`#${CEDROS_LOGIN_ADMIN_STYLE_ELEMENT_ID}`)
  );
}

afterEach(() => {
  for (const style of injectedStyles()) style.remove();
});

describe('ensureCedrosLoginAdminStyles', () => {
  it('injects the bundled stylesheet into the document head', () => {
    ensureCedrosLoginAdminStyles('.cedros-button{color:red}');

    const styles = injectedStyles();
    expect(styles).toHaveLength(1);
    expect(styles[0]!.parentElement).toBe(document.head);
    expect(styles[0]!.textContent).toBe('.cedros-button{color:red}');
  });

  it('only injects once across repeated imports/calls', () => {
    ensureCedrosLoginAdminStyles('.cedros-button{color:red}');
    ensureCedrosLoginAdminStyles('.cedros-button{color:blue}');

    const styles = injectedStyles();
    expect(styles).toHaveLength(1);
    // First write wins; a second call must not append a duplicate element.
    expect(styles[0]!.textContent).toBe('.cedros-button{color:red}');
  });

  it('is a no-op when the bundled CSS is empty', () => {
    ensureCedrosLoginAdminStyles('');

    expect(injectedStyles()).toHaveLength(0);
  });
});
