import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import { cedrosLoginRuntimeExternals, cedrosLoginRuntimeGlobals } from './vite.runtime';

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['src/web/register.ts'],
      entryRoot: 'src/web',
      outDir: 'dist/web',
    }),
  ],
  base: './',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist/web',
    emptyOutDir: false,
    lib: {
      entry: {
        register: resolve(__dirname, 'src/web/register.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    cssCodeSplit: false,
    rolldownOptions: {
      external: cedrosLoginRuntimeExternals,
      output: {
        codeSplitting: false,
        exports: 'named',
        globals: cedrosLoginRuntimeGlobals,
        preserveModules: false,
      },
      checks: {
        pluginTimings: false,
      },
    },
    sourcemap: 'hidden',
    minify: 'esbuild',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
