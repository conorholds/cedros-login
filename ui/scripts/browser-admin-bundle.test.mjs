import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

import { JSDOM } from 'jsdom';
import React from 'react';
import { createRoot } from 'react-dom/client';
import 'react/jsx-runtime';

const uiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(uiRoot, 'dist');
const runtimeImportSpecifierPattern =
  /(\bfrom\s*["']|import\s*\(\s*["']|import\s+["'])([^"']+)(["'])/g;
const scriptElementPattern =
  /(?:document|window\.document|globalThis\.document)\s*\.\s*createElement\s*\(\s*(["'`])script\1/;

test('packaged admin ESM obeys browser runtime restrictions and renders', async () => {
  const esmFiles = await listEsmFiles(distDir);
  const processReferences = [];

  for (const file of esmFiles) {
    const source = await readFile(file, 'utf8');
    source.split('\n').forEach((line, index) => {
      if (/\bprocess\s*\./.test(line)) {
        processReferences.push(`${file.slice(distDir.length + 1)}:${index + 1}`);
      }
    });
  }

  assert.deepEqual(
    processReferences,
    [],
    `production ESM references unsupported Node global process in: ${processReferences.join(', ')}`
  );
  console.log(`checked ${esmFiles.length} packaged ESM files: no process.* references`);

  const adminFiles = await collectRuntimeFiles(resolve(distDir, 'admin/register.js'), esmFiles);
  const scriptElementReferences = [];
  for (const file of adminFiles) {
    const source = await readFile(file, 'utf8');
    if (scriptElementPattern.test(source)) {
      scriptElementReferences.push(relative(distDir, file));
    }
  }
  assert.deepEqual(
    scriptElementReferences,
    [],
    `admin ESM creates disabled script elements in: ${scriptElementReferences.join(', ')}`
  );
  console.log(`checked ${adminFiles.length} admin ESM files: no script element creation`);

  const dom = new JSDOM(
    '<!doctype html><html><head></head><body><div id="root"></div></body></html>',
    {
      url: 'https://admin.example.com/admin/account-settings',
    }
  );
  const originalGlobals = installBrowserGlobals(dom.window);
  const originalProcess = globalThis.process;
  const originalFetch = globalThis.fetch;
  const container = document.getElementById('root');
  assert.ok(container, 'browser test root is missing');
  const root = createRoot(container);

  const requests = [];
  try {
    globalThis.fetch = async (input) => {
      requests.push(String(input));
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          settings: {
            'auth.email': [
              {
                key: 'auth_email_enabled',
                value: 'true',
                description: null,
                isSecret: false,
                updatedAt: '2026-01-01T00:00:00.000Z',
                updatedBy: null,
              },
            ],
          },
        }),
      };
    };
    assert.equal(delete globalThis.process, true, 'globalThis.process must be configurable');
    assert.equal(typeof globalThis.process, 'undefined');

    const entrypoint = await import(
      `${pathToFileURL(resolve(distDir, 'admin/register.js')).href}?browser-test=${Date.now()}`
    );
    console.log('imported packaged admin/register.js with globalThis.process absent');

    const bootstrap = entrypoint.default();
    const adminModule = bootstrap.modules?.[0];
    assert.ok(adminModule, 'packaged bootstrap is missing its admin module');
    const LoginComponent = adminModule.components?.['cedros-login:login'];
    assert.equal(typeof LoginComponent, 'function', 'packaged Login component is missing');

    root.render(
      React.createElement(LoginComponent, {
        pluginContext: {
          serverUrl: 'https://admin.example.com/extensions/cedros-login',
          getAccessToken: () => 'admin-token',
          hasPermission: () => true,
          userId: 'admin-1',
          pluginData: {
            user: {
              id: 'admin-1',
              email: 'admin@example.com',
            },
          },
        },
        pageSize: 20,
        refreshInterval: 30_000,
      })
    );
    await waitFor(
      () =>
        container.textContent?.includes('Authentication') &&
        container.textContent?.includes('Email')
    );

    assert.match(container.textContent ?? '', /Authentication/);
    assert.match(container.textContent ?? '', /Email/);
    assert.doesNotMatch(container.textContent ?? '', /OAuth clients|Issuer URL|Consent URL/);
    assert.ok(
      requests.every((url) => !url.endsWith('/admin/oauth')),
      'Login must not request control-plane OAuth administration'
    );
    console.log('rendered packaged cedros-login:login section with globalThis.process absent');
  } finally {
    root.unmount();
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 50));
    globalThis.process = originalProcess;
    globalThis.fetch = originalFetch;
    dom.window.close();
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 0));
    restoreGlobals(originalGlobals);
  }
});

async function listEsmFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return listEsmFiles(path);
      return entry.name.endsWith('.js') ? [path] : [];
    })
  );
  return files.flat().sort();
}

async function collectRuntimeFiles(entrypoint, esmFiles) {
  const availableFiles = new Set(esmFiles);
  const pending = [entrypoint];
  const visited = new Set();

  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || visited.has(file)) continue;
    assert.ok(
      availableFiles.has(file),
      `packaged runtime file is missing: ${relative(distDir, file)}`
    );
    visited.add(file);

    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(runtimeImportSpecifierPattern)) {
      const specifier = match[2];
      if (!specifier.startsWith('.')) continue;
      const importedFile = resolveRuntimeImport(file, specifier, availableFiles);
      assert.ok(
        importedFile,
        `runtime import ${specifier} from ${relative(distDir, file)} is missing`
      );
      pending.push(importedFile);
    }
  }

  return [...visited].sort();
}

function resolveRuntimeImport(importer, specifier, availableFiles) {
  const target = resolve(dirname(importer), specifier);
  return (
    [
      target,
      `${target}.js`,
      `${target}.mjs`,
      resolve(target, 'index.js'),
      resolve(target, 'index.mjs'),
    ].find((candidate) => availableFiles.has(candidate)) ?? null
  );
}

function installBrowserGlobals(window) {
  const replacements = {
    window,
    document: window.document,
    navigator: window.navigator,
    HTMLElement: window.HTMLElement,
    Element: window.Element,
    Node: window.Node,
    MutationObserver: window.MutationObserver,
    getComputedStyle: window.getComputedStyle.bind(window),
    localStorage: window.localStorage,
    sessionStorage: window.sessionStorage,
  };
  const originals = new Map();

  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  });

  for (const [key, value] of Object.entries(replacements)) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  }

  return originals;
}

function restoreGlobals(originals) {
  for (const [key, descriptor] of originals) {
    if (descriptor) {
      Object.defineProperty(globalThis, key, descriptor);
    } else {
      delete globalThis[key];
    }
  }
}

async function waitFor(predicate, timeoutMs = 2_000) {
  const startedAt = Date.now();
  while (!predicate()) {
    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error('packaged Login component did not render Authentication');
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 10));
  }
}
