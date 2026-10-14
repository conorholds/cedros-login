import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'public/mockServiceWorker.js', '.next']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      'react-hooks': {
        additionalEffectHooks: '(useExternalEffect)',
      },
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['useEffect'],
              message: 'Use useExternalEffect from src/hooks/effects for external synchronization.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='useEffect']",
          message: 'Use useExternalEffect from src/hooks/effects instead of direct useEffect.',
        },
        {
          selector: "CallExpression[callee.object.name='React'][callee.property.name='useEffect']",
          message:
            'Use useExternalEffect from src/hooks/effects instead of direct React.useEffect.',
        },
      ],
      // Data/client SDK effects still set state after external sync completes;
      // `useExternalEffect` plus exhaustive deps is the enforced review boundary.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/hooks/effects.ts'],
    rules: {
      'no-restricted-imports': 'off',
      'no-restricted-syntax': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
]);
