import { describe, expect, it } from 'vitest';
import { createElement, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import registerCedrosLoginWebSurface from '../web/register';

const CEDROS_LOGIN_WEB_STYLE_ELEMENT_ID = 'cedros-login-web-styles';

interface AuthFormBlockElementProps {
  props: Record<string, unknown>;
  runtimeBaseUrl?: string;
}

describe('cedros-login web extension registration', () => {
  it('returns a visual-builder web bootstrap with portable authored props', () => {
    const bootstrap = registerCedrosLoginWebSurface();

    expect(bootstrap.manifest.extensionId).toBe('cedros-login');
    expect(bootstrap.manifest.surfaces.web.packageRef).toBe('react');
    expect(bootstrap.manifest.surfaces.web.routeIds).toEqual(
      bootstrap.manifest.pageSeeds?.map((seed) => seed.id)
    );
    expect(bootstrap.manifest.pageSeeds?.map((seed) => seed.routePath)).toEqual([
      '/login',
      '/register',
      '/password-recovery',
      '/reset-password',
      '/verify-email',
      '/instant-link/verify',
      '/accept-invite',
      '/profile',
    ]);
    // Page seeds are editable rows published immediately when the extension is enabled.
    expect(bootstrap.manifest.pageSeeds?.every((seed) => seed.autoCreateOnEnable === true)).toBe(
      true
    );
    expect(bootstrap.manifest.pageSeeds?.every((seed) => seed.publishOnEnable === true)).toBe(true);
    expect(
      bootstrap.manifest.pageSeeds?.every((seed) =>
        seed.description?.includes('auto-created and published when the extension is enabled')
      )
    ).toBe(true);
    expect(bootstrap.manifest.pageSeeds?.map((seed) => seed.templateId)).toEqual(
      bootstrap.manifest.surfaces.web.templateIds
    );
    const loginManifestTemplate = bootstrap.manifest.contentTemplates?.find(
      (template) => template.id === 'cedros-login:login-page-template'
    );
    expect(loginManifestTemplate).toMatchObject({
      id: 'cedros-login:login-page-template',
      displayName: 'Login Page Template',
      contentTypes: ['page'],
    });
    expect(loginManifestTemplate).not.toHaveProperty('label');
    expect(loginManifestTemplate).not.toHaveProperty('zones');
    expect(loginManifestTemplate).not.toHaveProperty('blocks');
    expect(bootstrap.manifest.formTemplates?.map((template) => template.id)).toEqual([
      'cedros-login:account-support-form',
    ]);
    expect(bootstrap.manifest.docsArticles?.map((article) => article.id)).toEqual([
      'cedros-login:getting-started',
      'cedros-login:account-security-checklist',
    ]);
    expect(bootstrap.manifest.docsArticles?.every((article) => article.bodyMarkdown.trim())).toBe(
      true
    );
    // Current hosts materialize extension docs once as drafts. These are public
    // reader articles, so they must not opt into the operator-only lane.
    for (const article of bootstrap.manifest.docsArticles ?? []) {
      expect((article as { internal?: boolean }).internal).toBe(false);
      expect(article.autoCreateOnEnable).toBeUndefined();
      expect(article.publishOnEnable).toBeUndefined();
    }
    expect(
      bootstrap.manifest.formTemplates?.every((template) => template.autoCreateOnEnable === true)
    ).toBe(true);
    expect(bootstrap.manifest.onboardingPages?.map((page) => page.id)).toEqual([
      'cedros-login:setup-login',
    ]);
    expect(bootstrap.contentBlocks?.map((block) => block.type)).toEqual([
      'cedros-login:auth-page-copy',
      'cedros-login:auth-form',
      'cedros-login:login-button',
      'cedros-login:account-workspace',
    ]);
    expect(bootstrap.contentBlockRenderers?.map((renderer) => renderer.type)).toEqual([
      'cedros-login:auth-page-copy',
      'cedros-login:auth-form',
      'cedros-login:login-button',
      'cedros-login:account-workspace',
    ]);
    expect(
      bootstrap.contentBlockRenderers?.every((renderer) => typeof renderer.render === 'function')
    ).toBe(true);
    expect(bootstrap.contentBlocks?.every((block) => !('schema' in block))).toBe(true);
    const authFormRenderer = bootstrap.contentBlockRenderers?.find(
      (renderer) => renderer.type === 'cedros-login:auth-form'
    );
    expect(authFormRenderer).toBeDefined();
    const authFormRendererMarkup = renderToStaticMarkup(
      createElement(
        'div',
        null,
        authFormRenderer!.render({
          block: {
            type: 'cedros-login:auth-form',
            props: {
              mode: 'sign-in',
              title: 'Log in',
              submitLabel: 'Log in',
              showProviderButtons: true,
              enabledProviders: ['email', 'google', 'apple', 'passkey', 'solana', 'instant-link'],
            },
          },
        })
      )
    );
    expect(authFormRendererMarkup).toContain('data-cedros-block="cedros-login:auth-form"');
    expect(authFormRendererMarkup).toContain('cedros-auth-form__panel');
    expect(authFormRendererMarkup).toContain('disabled=""');

    const craftedAuthFormRender = authFormRenderer!.render({
      block: {
        type: 'cedros-login:auth-form',
        props: {
          mode: 'sign-in',
          title: 'Log in',
          serverUrl: 'https://attacker.example/collect',
          runtimeBaseUrl: 'https://attacker.example/runtime',
        },
      },
      siteData: { cedrosLogin: { runtimeBaseUrl: 'https://host.test/extensions/cedros-login' } },
    });
    expect(isValidElement<AuthFormBlockElementProps>(craftedAuthFormRender)).toBe(true);
    if (!isValidElement<AuthFormBlockElementProps>(craftedAuthFormRender)) {
      throw new Error('Expected auth form element');
    }
    expect(craftedAuthFormRender.props.props).toEqual({ mode: 'sign-in', title: 'Log in' });
    expect(craftedAuthFormRender.props.runtimeBaseUrl).toBe(
      'https://host.test/extensions/cedros-login'
    );
    const loginButtonRenderer = bootstrap.contentBlockRenderers?.find(
      (renderer) => renderer.type === 'cedros-login:login-button'
    );
    expect(loginButtonRenderer).toBeDefined();
    const unsafeLoginButtonRendererMarkup = renderToStaticMarkup(
      createElement(
        'div',
        null,
        loginButtonRenderer!.render({
          block: {
            type: 'cedros-login:login-button',
            props: {
              label: 'Continue',
              href: 'javascript:alert(1)',
            },
          },
        })
      )
    );
    expect(unsafeLoginButtonRendererMarkup).toContain('href="/"');
    const blocksByTemplateId = new Map(
      bootstrap.contentTemplates?.map((template) => [
        template.id,
        template.blocks.map((block) => block.type),
      ])
    );
    for (const template of bootstrap.contentTemplates ?? []) {
      expect(template.label).toBe(template.displayName);
      expect(template.zones.map((zone) => zone.id)).toEqual(['main']);
      expect(template.zones[0]?.allowedBlockTypes).toEqual(
        template.id === 'cedros-login:login-page-template'
          ? ['cedros-login:auth-page-copy', 'cedros-login:auth-form']
          : [...new Set(template.blocks.map((block) => block.type))]
      );
    }
    expect(blocksByTemplateId.get('cedros-login:login-page-template')).toEqual([
      'cedros-login:auth-form',
    ]);
    expect(blocksByTemplateId.get('cedros-login:register-page-template')).toEqual([
      'cedros-login:auth-page-copy',
      'cedros-login:auth-form',
    ]);
    expect(blocksByTemplateId.get('cedros-login:password-recovery-page-template')).toEqual([
      'cedros-login:auth-page-copy',
      'cedros-login:auth-form',
    ]);
    expect(blocksByTemplateId.get('cedros-login:reset-password-page-template')).toEqual([
      'cedros-login:auth-page-copy',
      'cedros-login:auth-form',
    ]);
    expect(blocksByTemplateId.get('cedros-login:email-verification-page-template')).toEqual([
      'cedros-login:auth-page-copy',
      'cedros-login:auth-form',
    ]);
    expect(blocksByTemplateId.get('cedros-login:instant-link-verification-page-template')).toEqual([
      'cedros-login:auth-page-copy',
      'cedros-login:auth-form',
    ]);
    expect(blocksByTemplateId.get('cedros-login:invite-acceptance-page-template')).toEqual([
      'cedros-login:auth-page-copy',
      'cedros-login:auth-form',
    ]);
    expect(blocksByTemplateId.get('cedros-login:public-profile-page-template')).toEqual([
      'cedros-login:account-workspace',
    ]);
    for (const template of bootstrap.contentTemplates ?? []) {
      for (const block of template.blocks) {
        expect(JSON.stringify(block.props)).not.toMatch(
          /<script|<style|function|=>|component|private[_-]?key|secret|token/i
        );
      }
    }

    const authPageCopyBlock = bootstrap.contentBlocks?.find(
      (block) => block.type === 'cedros-login:auth-page-copy'
    );
    expect(authPageCopyBlock).toBeDefined();

    const unsafeHrefMarkup = renderToStaticMarkup(
      createElement(authPageCopyBlock!.Component, {
        props: {
          title: 'Safe title',
          body: 'Safe body',
          primaryLink: { kind: 'cedros-link', href: 'javascript:alert(1)', label: 'Continue' },
        },
      })
    );
    expect(unsafeHrefMarkup).toContain('href="/"');

    const relativeHrefMarkup = renderToStaticMarkup(
      createElement(authPageCopyBlock!.Component, {
        props: {
          title: 'Safe title',
          body: 'Safe body',
          primaryLink: { kind: 'cedros-link', href: '/profile', label: 'Continue' },
        },
      })
    );
    expect(relativeHrefMarkup).toContain('href="/profile"');

    const blankLabelMarkup = renderToStaticMarkup(
      createElement(authPageCopyBlock!.Component, {
        props: {
          title: 'Safe title',
          body: 'Safe body',
          primaryLink: { kind: 'cedros-link', href: '/login', label: '   ' },
        },
      })
    );
    expect(blankLabelMarkup).not.toContain('cedros-auth-page-copy__link');

    const logoMarkup = renderToStaticMarkup(
      createElement(authPageCopyBlock!.Component, {
        props: { title: 'Safe title', body: 'Safe body', logoUrl: '/brand.png', logoAlt: 'Brand' },
      })
    );
    expect(logoMarkup).toContain('cedros-auth-page-copy__logo');
    expect(logoMarkup).toContain('src="/brand.png"');
    expect(logoMarkup).toContain('alt="Brand"');

    const httpsLogoMarkup = renderToStaticMarkup(
      createElement(authPageCopyBlock!.Component, {
        props: {
          title: 'Safe title',
          body: 'Safe body',
          logoUrl: 'https://assets.example.com/brand.png',
        },
      })
    );
    expect(httpsLogoMarkup).toContain('src="https://assets.example.com/brand.png"');

    for (const unsafeLogoUrl of [
      'javascript:alert(1)',
      'http://attacker.invalid/pixel.png',
      '//attacker.invalid/tracker.png',
      '/\\attacker.invalid/backslash-tracker.png',
      'https://assets.example.com\\@attacker.invalid/logo.png',
    ]) {
      const unsafeLogoMarkup = renderToStaticMarkup(
        createElement(authPageCopyBlock!.Component, {
          props: { title: 'Safe title', body: 'Safe body', logoUrl: unsafeLogoUrl },
        })
      );
      expect(unsafeLogoMarkup).not.toContain('cedros-auth-page-copy__logo');
    }

    const authFormBlock = bootstrap.contentBlocks?.find(
      (block) => block.type === 'cedros-login:auth-form'
    );
    expect(authFormBlock).toBeDefined();
    const signInFormMarkup = renderToStaticMarkup(
      createElement(authFormBlock!.Component, {
        props: {
          mode: 'sign-in',
          title: 'Log in',
          submitLabel: 'Sign in',
          successMessage: 'You will continue after logging in.',
          showProviderButtons: true,
          enabledProviders: ['email', 'google', 'apple', 'passkey', 'solana', 'instant-link'],
        },
      })
    );
    // Keep the first-paint shell aligned with the hydrated LoginForm shape.
    expect(signInFormMarkup).toContain('cedros-login-form');
    expect(signInFormMarkup).toContain('cedros-auth-form__panel');
    expect(signInFormMarkup).not.toContain('cedros-auth-form__divider');
    expect(signInFormMarkup).not.toContain('Continue with Solana');
    expect(signInFormMarkup).not.toContain('Continue with passkey');
    expect(signInFormMarkup).not.toContain('Continue with Google');
    expect(signInFormMarkup).not.toContain('Continue with Apple');
    expect(signInFormMarkup).not.toContain('cedros-auth-form__provider-svg');
    expect(signInFormMarkup).toContain('cedros-auth-form__password-toggle-icon');
    expect(signInFormMarkup).not.toContain('Instant link</span>');
    expect(signInFormMarkup).toContain('cedros-label-row');
    expect(signInFormMarkup).toContain('cedros-password-input');
    expect(signInFormMarkup).toContain('Forgot your password?');
    expect(signInFormMarkup).toContain('Don&#x27;t have an account?');
    expect(signInFormMarkup).not.toContain('Email address');
    expect(signInFormMarkup).toContain('disabled=""');

    const resetFormMarkup = renderToStaticMarkup(
      createElement(authFormBlock!.Component, {
        props: {
          mode: 'reset-password',
          title: 'Reset password',
          showProviderButtons: false,
        },
      })
    );
    expect(resetFormMarkup).toContain('data-auth-mode="reset-password"');
    expect(resetFormMarkup).toContain('New password');
    expect(resetFormMarkup).toContain('Confirm Password');
    expect(resetFormMarkup).not.toContain('Recovery code');

    const inviteFormMarkup = renderToStaticMarkup(
      createElement(authFormBlock!.Component, {
        props: {
          mode: 'accept-invite',
          title: 'Accept invite',
          showProviderButtons: false,
        },
      })
    );
    expect(inviteFormMarkup).toContain('data-auth-mode="accept-invite"');
    expect(inviteFormMarkup).not.toContain('Invite code');
    expect(inviteFormMarkup).toContain('disabled=""');

    const loginButtonBlock = bootstrap.contentBlocks?.find(
      (block) => block.type === 'cedros-login:login-button'
    );
    expect(loginButtonBlock).toBeDefined();
    const unsafeButtonMarkup = renderToStaticMarkup(
      createElement(loginButtonBlock!.Component, {
        props: {
          label: 'Continue',
          href: 'javascript:alert(1)',
        },
      })
    );
    expect(unsafeButtonMarkup).toContain('href="/"');

    const accountWorkspaceBlock = bootstrap.contentBlocks?.find(
      (block) => block.type === 'cedros-login:account-workspace'
    );
    expect(accountWorkspaceBlock).toBeDefined();
    const accountMarkup = renderToStaticMarkup(
      createElement(accountWorkspaceBlock!.Component, {
        props: {
          title: 'Account',
          body: 'Manage access',
        },
      })
    );
    // SSR first-paint is a loading placeholder carrying the authored title; the
    // interactive provider swaps in the real profile (and the sanitized signed-out
    // handoff, covered in interactiveAccountWorkspace.test) only in the browser.
    expect(accountMarkup).toContain('data-cedros-block="cedros-login:account-workspace"');
    expect(accountMarkup).toContain('Account');
    expect(accountMarkup).toContain('Loading account...');
    expect(accountMarkup).not.toContain('cedros-account-workspace-block__section');

    expect(bootstrap.modules).toBeUndefined();
  });

  it('injects the styles required by the hydrated public login form', () => {
    const style = document.getElementById(CEDROS_LOGIN_WEB_STYLE_ELEMENT_ID);

    expect(style).toBeInstanceOf(HTMLStyleElement);
    expect(document.querySelectorAll(`#${CEDROS_LOGIN_WEB_STYLE_ELEMENT_ID}`)).toHaveLength(1);
  });
});
