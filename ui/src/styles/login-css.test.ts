import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const loginCss = readFileSync(join(process.cwd(), 'src/styles/login.css'), 'utf8');
const authBlocksCss = readFileSync(join(process.cwd(), 'src/extension/auth-blocks.css'), 'utf8');
const adminWorkbenchCss = readFileSync(
  join(process.cwd(), 'src/admin/admin-workbench.css'),
  'utf8'
);
const extensionCssSources = [
  ['login.css', loginCss],
  ['auth-blocks.css', authBlocksCss],
] as const;

/** Every stylesheet this package ships, so a clobber cannot hide in a partial. */
function allPackageStylesheets(): ReadonlyArray<readonly [string, string]> {
  const found: Array<readonly [string, string]> = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.css')) found.push([full, readFileSync(full, 'utf8')]);
    }
  };
  walk(join(process.cwd(), 'src'));
  return found;
}

/**
 * Design tokens owned by the Cedros theme kernel — the exact `TOKEN_MAP` of
 * cedros-data's `themeKernelTokenCompiler.ts`, plus the `-light`/`-dark`
 * mode-scoped color variants it emits alongside each color. A site theme sets
 * these; assigning one inside our roots silently discards the theme's value
 * there, which is how the runtime blocks drifted from the host palette in dark
 * mode. Read them (with a fallback) and keep our own values in the
 * `--cedros-login-*` namespace.
 */
const HOST_THEME_COLOR_TOKENS = [
  'background',
  'foreground',
  'muted',
  'muted-foreground',
  'border',
  'link',
  'primary',
  'primary-foreground',
  'accent',
  'ring',
  'success',
  'error',
] as const;

const HOST_THEME_TOKENS: readonly string[] = [
  ...HOST_THEME_COLOR_TOKENS,
  ...HOST_THEME_COLOR_TOKENS.flatMap((token) => [`${token}-light`, `${token}-dark`]),
  // Non-color kernel groups: typography, spacing, radius, shadow, container.
  'font-body',
  'font-heading',
  'font-mono',
  'font-sans',
  'font-display',
  'font-size-base',
  'line-height-body',
  'line-height-heading',
  'space-unit',
  'space-section',
  'space-content',
  'space-page-inset',
  'radius',
  'radius-sm',
  'radius-md',
  'radius-lg',
  'radius-pill',
  'shadow-sm',
  'shadow-md',
  'shadow-lg',
  'container-content',
  'container-wide',
  'container-full',
  // Not kernel tokens, but host/consumer-owned brand inputs this package reads.
  'card',
  'warning',
  'info',
];

// A scoped `--cedros-x: initial` reset is the one allowed form: it declines an
// inherited host value inside an extension block root without imposing
// extension branding on host surfaces.
const hostTokenDefinitionPattern = new RegExp(
  `--cedros-(?:${HOST_THEME_TOKENS.join('|')})\\s*:(?!\\s*initial\\s*[;}])`
);

const highRiskGlobalSelectorPattern =
  /(^|[},])\s*(?::root|html|body|\*|a|button|input|h[1-6]|\.cedros-(?:admin|data|site|runtime)[A-Za-z0-9_-]*)\s*(?:\{|,)/;

describe('login.css accessibility safeguards', () => {
  it('keeps a global reduced-motion guard for Cedros UI motion', () => {
    expect(loginCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(loginCss).toContain('animation-duration: 0.001ms !important');
    expect(loginCss).toContain('transition-duration: 0.001ms !important');
    expect(loginCss).toContain('animation-iteration-count: 1 !important');
  });

  it('flags a host-token clobber but allows our namespaced and scale tokens', () => {
    // The guard is only worth having if it fails on the real regressions, so
    // pin both directions against the exact shapes that shipped before.
    expect('  --cedros-radius: 0.5rem;').toMatch(hostTokenDefinitionPattern);
    expect('  --cedros-radius-pill: 9999px;').toMatch(hostTokenDefinitionPattern);
    expect('  --cedros-shadow-md: 0 2px 4px;').toMatch(hostTokenDefinitionPattern);
    expect('  --cedros-success-light: hsl(142, 76%, 94%);').toMatch(hostTokenDefinitionPattern);
    expect('  --cedros-primary: hsl(0, 0%, 0%);').toMatch(hostTokenDefinitionPattern);

    expect('  --cedros-login-radius: var(--cedros-radius, 0.5rem);').not.toMatch(
      hostTokenDefinitionPattern
    );
    expect('  --cedros-radius-field: var(--cedros-radius-md, 0.75rem);').not.toMatch(
      hostTokenDefinitionPattern
    );
    expect('  --cedros-card-foreground: hsl(0, 0%, 0%);').not.toMatch(hostTokenDefinitionPattern);
    expect('  --cedros-warning-light: hsl(48, 96%, 89%);').not.toMatch(hostTokenDefinitionPattern);
    expect('  --cedros-primary: initial;').not.toMatch(hostTokenDefinitionPattern);
  });

  it('does not define host-owned design tokens in any shipped stylesheet', () => {
    const stylesheets = allPackageStylesheets();

    expect(stylesheets.length).toBeGreaterThan(1);
    for (const [sourceName, css] of stylesheets) {
      // Comments describe the tokens by name; only declarations matter.
      const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
      expect(declarations, sourceName).not.toMatch(hostTokenDefinitionPattern);
    }
  });

  it('does not ship high-risk unscoped global or host selectors', () => {
    for (const [sourceName, css] of extensionCssSources) {
      expect(css, sourceName).not.toMatch(highRiskGlobalSelectorPattern);
    }
  });

  it('defines every package-owned theme variable it consumes', () => {
    const definitions = new Set<string>();
    const usages = new Map<string, Set<string>>();

    for (const [sourceName, css] of allPackageStylesheets()) {
      const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
      for (const match of declarations.matchAll(/(--[\w-]+)\s*:/g)) {
        definitions.add(match[1]!);
      }
      for (const match of declarations.matchAll(/var\((--[\w-]+)/g)) {
        const token = match[1]!;
        const sources = usages.get(token) ?? new Set<string>();
        sources.add(sourceName);
        usages.set(token, sources);
      }
    }

    const missing = [...usages]
      .filter(
        ([token]) =>
          (token.startsWith('--cedros-login-') || token.startsWith('--admin-')) &&
          !definitions.has(token)
      )
      .map(([token, sources]) => `${token}: ${[...sources].join(', ')}`)
      .sort();

    expect(missing).toEqual([]);
  });

  it('limits direct component color literals to functional and provider-brand exceptions', () => {
    const allowedSelectorFragments = [
      '.cedros-modal-backdrop',
      '.wallet-adapter-modal',
      '.cedros-totp-qr-image',
      '.cedros-profile-avatar-overlay',
      '.cedros-admin-auth-badge-',
    ];
    const violations: string[] = [];
    const directColorDeclaration =
      /(?:^|;)\s*(?:background(?:-color)?|border(?:-[\w-]+)?-color|color)\s*:\s*(?:#[\da-f]{3,8}\b|(?:rgb|hsl)a?\(|white\b|black\b)/i;

    for (const [sourceName, css] of allPackageStylesheets()) {
      const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
      for (const match of declarations.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        const selector = match[1]!.trim();
        const body = match[2]!;
        if (
          directColorDeclaration.test(body) &&
          !allowedSelectorFragments.some((fragment) => selector.includes(fragment))
        ) {
          violations.push(`${sourceName}: ${selector}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('uses semantic radius tiers and avoids catch-all transitions', () => {
    expect(loginCss).toContain('--cedros-radius-control:');
    expect(loginCss).toContain('--cedros-radius-field:');
    expect(loginCss).toContain('--cedros-radius-card:');
    expect(loginCss).toContain('--cedros-radius-overlay:');
    expect(loginCss).not.toMatch(/transition(?:-property)?\s*:\s*all\b/);
  });

  it('only promotes buttons to a compositor layer during interaction', () => {
    const buttonRuleStart = loginCss.indexOf('.cedros-button {');
    const buttonRuleEnd = loginCss.indexOf('\n}', buttonRuleStart);
    const buttonRule = loginCss.slice(buttonRuleStart, buttonRuleEnd);

    expect(buttonRuleStart).toBeGreaterThanOrEqual(0);
    expect(buttonRule).not.toContain('will-change');
    expect(loginCss).toContain('.cedros-button:hover,');
    expect(loginCss).toContain('.cedros-button:focus-visible,');
    expect(loginCss).toContain('.cedros-button:active {');
    expect(loginCss).toContain('will-change: transform;');
  });

  it('does not scope inherited base styles from the provider theme wrapper onto host children', () => {
    const baseStylesComment = '/* Apply system font stack';
    const baseStylesStart = loginCss.indexOf(baseStylesComment);
    const baseStylesEnd = loginCss.indexOf(') {\n  font-family:', baseStylesStart);
    const baseStylesBlock = loginCss.slice(baseStylesStart, baseStylesEnd);

    expect(baseStylesStart).toBeGreaterThanOrEqual(0);
    expect(baseStylesEnd).toBeGreaterThan(baseStylesStart);
    expect(baseStylesBlock).not.toContain('.cedros-login-theme');
    expect(baseStylesBlock).toContain('.cedros-login-form,');
    expect(baseStylesBlock).toContain('.cedros-login-form *');
  });
});

describe('login.css block theme bridge', () => {
  // Wherever this package renders as a Cedros extension block, the host owns
  // the palette through its `--cedros-runtime-*` block tokens, which it flips
  // for dark mode and rebinds to the live site theme on public pages. Every
  // themeable `--cedros-login-*` alias must prefer them so the live form
  // interior follows the site instead of this package's shadcn defaults; the
  // brand-token fallback keeps standalone and admin surfaces unchanged.
  const bridgedAliases: ReadonlyArray<readonly [string, string]> = [
    ['--cedros-login-primary', '--cedros-runtime-action-bg'],
    ['--cedros-login-primary-foreground', '--cedros-runtime-action-fg'],
    ['--cedros-login-background', '--cedros-runtime-bg'],
    ['--cedros-login-foreground', '--cedros-runtime-text'],
    ['--cedros-login-card', '--cedros-runtime-panel'],
    ['--cedros-login-muted', '--cedros-runtime-accent-soft'],
    ['--cedros-login-muted-foreground', '--cedros-runtime-muted'],
    ['--cedros-login-accent', '--cedros-runtime-accent-soft'],
    ['--cedros-login-border', '--cedros-runtime-border'],
    ['--cedros-input', '--cedros-runtime-border'],
    ['--cedros-login-ring', '--cedros-runtime-accent'],
    ['--cedros-login-link', '--cedros-runtime-accent'],
    ['--cedros-login-warning', '--cedros-runtime-warning'],
    ['--cedros-login-error', '--cedros-runtime-error'],
  ];

  it.each(bridgedAliases)('resolves %s through %s in every mode', (alias, runtimeToken) => {
    const definitions = [...loginCss.matchAll(new RegExp(`${alias}:\\s*([^;]+);`, 'g'))].map(
      (match) => match[1]!.replace(/\s+/g, '')
    );

    // Light and dark token blocks both define it, and neither may skip the host token.
    expect(definitions.length).toBe(2);
    for (const definition of definitions) {
      expect(definition).toMatch(new RegExp(`^var\\(${runtimeToken},`));
    }
  });

  const derivedAliases: ReadonlyArray<readonly [string, string]> = [
    ['--cedros-accent-foreground', '--cedros-login-foreground'],
    ['--cedros-destructive', '--cedros-login-error'],
    ['--cedros-destructive-foreground', '--cedros-login-foreground'],
    ['--cedros-input-fill', '--cedros-login-background'],
    ['--cedros-login-text', '--cedros-login-foreground'],
  ];

  it.each(derivedAliases)('derives %s from %s in every mode', (alias, sourceToken) => {
    const definitions = [...loginCss.matchAll(new RegExp(`${alias}:\\s*([^;]+);`, 'g'))].map(
      (match) => match[1]!.replace(/\s+/g, '')
    );

    expect(definitions).toEqual([`var(${sourceToken})`, `var(${sourceToken})`]);
  });

  it('keeps account surfaces and foregrounds on the resolved theme aliases', () => {
    expect(loginCss).toMatch(
      /\.cedros-account-card\s*\{[^}]*background: var\(--cedros-login-card\);[^}]*box-shadow: var\(--cedros-login-shadow-sm\);/
    );
    expect(loginCss).toMatch(
      /\.cedros-profile-avatar-fallback\s*\{[^}]*color: var\(--cedros-login-primary-foreground\);/
    );
    expect(loginCss).toMatch(
      /\.cedros-button-danger-outline:hover:not\(:disabled\)\s*\{[^}]*color: var\(--cedros-destructive-foreground\);/
    );
  });

  it('uses the panel token for raised surfaces and the canvas token for page surfaces', () => {
    for (const selector of [
      '.cedros-modal',
      '.cedros-dropdown',
      '.cedros-suggestions',
      '.cedros-org-selector-dropdown',
      '.cedros-full-page-card',
      '.cedros-totp-panel',
    ]) {
      expect(ruleFor(loginCss, selector), selector).toMatch(
        /background(?:-color)?: var\(--cedros-login-card\);/
      );
    }

    expect(ruleFor(loginCss, '.cedros-split-page-form')).toContain(
      'background: var(--cedros-login-background);'
    );
  });

  it('derives semantic washes and elevations from resolved host tokens in every mode', () => {
    const semanticWashes: ReadonlyArray<readonly [string, string]> = [
      ['--cedros-warning-light', '--cedros-login-warning'],
      ['--cedros-login-success-soft', '--cedros-login-success'],
      ['--cedros-destructive-light', '--cedros-destructive'],
    ];
    const elevations: ReadonlyArray<readonly [string, string]> = [
      ['--cedros-login-shadow-xs', '--cedros-shadow-sm'],
      ['--cedros-login-shadow-sm', '--cedros-shadow-sm'],
      ['--cedros-login-shadow-md', '--cedros-shadow-md'],
      ['--cedros-login-shadow-lg', '--cedros-shadow-lg'],
      ['--cedros-login-shadow-overlay', '--cedros-shadow-lg'],
    ];

    for (const [alias, sourceToken] of [...semanticWashes, ...elevations]) {
      const definitions = [...loginCss.matchAll(new RegExp(`${alias}:\\s*([^;]+);`, 'g'))].map(
        (match) => match[1]!
      );

      expect(definitions, alias).toHaveLength(2);
      for (const definition of definitions) {
        expect(definition.replace(/\s+/g, ''), alias).toMatch(
          new RegExp(`var\\(${sourceToken}(?:,|\\))`)
        );
      }
    }
  });
});

describe('login.css admin theme safeguards', () => {
  it('maps admin palette aliases through Cedros theme tokens', () => {
    expect(loginCss).toContain('--admin-bg: var(--cedros-login-card);');
    expect(loginCss).toContain('--admin-fg: var(--cedros-login-foreground);');
    expect(loginCss).toContain('--admin-border: var(--cedros-login-border);');
    expect(loginCss).toContain('--admin-table-row-hover: var(--cedros-login-accent);');
    expect(loginCss).not.toContain('--admin-bg: hsl(0, 0%, 100%);');
  });

  it('maps admin links through the Cedros Data link token', () => {
    expect(adminWorkbenchCss).toContain(
      '--cedros-login-admin-link: var(--cd-link, var(--admin-link, var(--cedros-login-link)));'
    );
  });

  it('honors common host dark-mode markers for injected admin surfaces', () => {
    expect(loginCss).toMatch(/\.dark\s+:where\([\s\S]*\.cedros-login-admin-root/);
    expect(loginCss).toMatch(/\[data-theme='dark'\]\s+:where\([\s\S]*\.cedros-login-admin-root/);
    expect(loginCss).toMatch(
      /\[data-color-mode='dark'\]\s+:where\([\s\S]*\.cedros-login-admin-root/
    );
    expect(loginCss).toContain('color-scheme: dark;');
  });

  it('keeps dark select arrows and admin badges in sync with host dark selectors', () => {
    expect(loginCss).toContain("[data-theme='dark'] .cedros-setting-select");
    expect(loginCss).toContain(
      "[data-color-mode='dark'] :where(.cedros-login-admin-root) .cedros-admin-auth-badge-email"
    );
  });
});

function ruleFor(css: string, selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));
  expect(match, `Expected CSS rule for ${selector}`).toBeTruthy();
  return match![1]!;
}
