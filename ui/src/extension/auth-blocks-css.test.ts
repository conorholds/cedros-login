import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const authBlocksCss = readFileSync(join(process.cwd(), 'src/extension/auth-blocks.css'), 'utf8');

describe('auth block runtime CSS', () => {
  it('uses Cedros runtime tokens with fallbacks for themeable values', () => {
    expect(authBlocksCss).toContain('var(--cedros-runtime-action-bg,');
    expect(authBlocksCss).toContain('var(--cedros-runtime-action-fg,');
    expect(authBlocksCss).toContain('var(--cedros-runtime-text,');
    expect(authBlocksCss).toContain('var(--cedros-runtime-muted,');
    expect(authBlocksCss).toContain('var(--cedros-runtime-panel,');
    expect(authBlocksCss).toContain('var(--cedros-runtime-border,');
    expect(authBlocksCss).toContain('var(--cedros-runtime-bg,');
    expect(authBlocksCss).toContain('var(--cedros-runtime-accent,');
    expect(authBlocksCss).toContain('var(--cedros-runtime-accent-soft,');
    expect(authBlocksCss).not.toContain('--cedros-runtime-action-text');
    expect(authBlocksCss).not.toContain('--cedros-runtime-surface');
  });

  it('restores a page rhythm for the outer auth blocks under canvas page shells', () => {
    for (const variant of ['canvas-content', 'canvas-wide', 'canvas-full']) {
      expect(authBlocksCss).toContain(`.cedros-theme-shell-page--${variant} *`);
    }
    expect(authBlocksCss).toMatch(
      /:where\(\.cedros-auth-page-copy, \.cedros-auth-form--card\):first-child:is\([^)]*\)\s*\{\s*margin-block-start:/
    );
    expect(authBlocksCss).toMatch(
      /:where\(\.cedros-auth-page-copy, \.cedros-auth-form--card\):last-child:is\([^)]*\)\s*\{\s*margin-block-end:/
    );
    // Default shells keep the host's own page padding: no unconditional margin.
    expect(authBlocksCss).not.toMatch(
      /^:where\(\.cedros-auth-form--card\)[^{]*\{[^}]*margin-block/m
    );
  });

  it('hides legacy empty auth copy links defensively', () => {
    expect(authBlocksCss).toContain(':where(.cedros-auth-page-copy__link:empty)');
    expect(authBlocksCss).toContain('display: none;');
  });

  it('centers the split auth copy and form blocks inside authored grid layouts', () => {
    const sharedRootRule = ruleFor(':where(.cedros-auth-page-copy, .cedros-auth-form)');

    expect(sharedRootRule).toContain('width: min(100%, 24rem);');
    expect(sharedRootRule).toContain('margin-inline: auto;');
    expect(sharedRootRule).toContain('justify-self: center;');
    expect(sharedRootRule).not.toContain('width: min(100%, 26rem);');
  });

  it('keeps the auth copy as copy above a standalone form card', () => {
    const copyRule = ruleFor(':where(.cedros-auth-page-copy)');
    const formRule = ruleFor(':where(.cedros-auth-form)');

    expect(copyRule).toContain('padding: 0.1rem 0.25rem 0.5rem;');
    expect(copyRule).not.toContain('border:');
    expect(copyRule).not.toContain('background:');
    expect(formRule).toContain('border-radius: 0.75rem;');
    expect(formRule).toContain('box-shadow:');
    expect(authBlocksCss).not.toContain('border-radius: 0.75rem 0.75rem 0 0;');
    expect(authBlocksCss).not.toContain('border-top: 0;');
  });

  it('uses host elevation and accent tokens for raised and selected states', () => {
    expect(ruleFor(':where(.cedros-auth-form)')).toContain(
      'box-shadow: var(\n    --cedros-shadow-sm,'
    );
    expect(ruleFor(':where(.cedros-auth-form) .cedros-button-social')).toContain(
      'box-shadow: var(--cedros-shadow-sm,'
    );
    expect(ruleFor(':where(.cedros-auth-form) .cedros-tab::after')).toContain(
      'background-color: var(--cedros-runtime-accent,'
    );
  });

  it('leaves dark mode to the host runtime tokens instead of a package palette', () => {
    // The host flips --cedros-runtime-* under .cedros-dark / .cedros-admin--dark
    // and rebinds them to the site theme on public pages, so block CSS that
    // consumes the tokens gets both modes for free. Declaring a dark palette
    // here (or discarding host tokens with `: initial`) makes the card disagree
    // with the page around it and blocks site themes from recoloring it.
    const declarations = authBlocksCss.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(declarations).not.toMatch(/--cedros-[\w-]+\s*:\s*initial/);
    expect(declarations).not.toContain('prefers-color-scheme');
    expect(declarations).not.toMatch(/\.cedros-dark|\[data-theme='dark'\]/);
    expect(declarations).not.toMatch(/--cedros-login-(?:card|border|foreground|muted-foreground)/);
  });

  it('keeps selectors scoped to extension content block roots', () => {
    for (const selectorGroup of collectSelectorGroups(authBlocksCss)) {
      const normalizedSelector = selectorGroup.replace(/\s+/g, ' ').trim();
      expect(normalizedSelector).toMatch(
        /^:where\(\s*\.cedros-(auth-(page-copy|form)|account-workspace-block)(\b|[ _:.#>[*])/
      );
    }
  });
});

function collectSelectorGroups(css: string): string[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...withoutComments.matchAll(/(?:^|[{}])\s*([^{}][^{]+)\s*\{/g)]
    .map((match) => match[1]!.trim())
    .filter((selectorGroup) => !selectorGroup.startsWith('@') && !selectorGroup.includes(';'));
}

function ruleFor(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = authBlocksCss.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));
  expect(match, `Expected CSS rule for ${selector}`).toBeTruthy();
  return match![1]!;
}
