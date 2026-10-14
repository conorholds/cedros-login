import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { createRequire } from 'node:module';

import { cedrosLoginRuntimeExternals, cedrosLoginRuntimeGlobals } from './vite.runtime';

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['src'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts', 'src/style.ts'],
      rollupTypes: true,
      rollupOptions: {
        // Keep declaration analysis on this package's pinned TypeScript, even
        // when a parent workspace has a different compiler installed.
        typescriptCompilerFolder: resolve(
          createRequire(import.meta.url).resolve('typescript/package.json'),
          '..'
        ),
      },
    }),
  ],
  css: {
    postcss: './postcss.config.js',
  },
  // Use relative paths for assets (required for Next.js/Turbopack compatibility)
  // Without this, worker URLs are absolute (/assets/...) which Next.js can't resolve
  base: './',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        admin: resolve(__dirname, 'src/admin/index.ts'),
        'admin/register': resolve(__dirname, 'src/admin/register.ts'),
        'non-wallet': resolve(__dirname, 'src/non-wallet.ts'),
        'email-only': resolve(__dirname, 'src/email-only.ts'),
        'google-only': resolve(__dirname, 'src/google-only.ts'),
        'solana-only': resolve(__dirname, 'src/solana-only.ts'),
        style: resolve(__dirname, 'src/style.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (entryName === 'style') {
          return `style.${format === 'es' ? 'js' : 'cjs'}`;
        }
        const ext = format === 'es' ? 'js' : 'cjs';
        return `${entryName}.${ext}`;
      },
    },
    cssCodeSplit: false,
    rolldownOptions: {
      external: cedrosLoginRuntimeExternals,
      output: {
        exports: 'named',
        globals: cedrosLoginRuntimeGlobals,
        preserveModules: false,
      },
      checks: {
        pluginTimings: false,
      },
    },
    // Enable hidden sourcemaps for production debugging
    // Hidden maps are generated but not referenced in output (no //# sourceMappingURL)
    // This allows debugging production issues without exposing maps to end users
    sourcemap: 'hidden',
    minify: 'esbuild',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
