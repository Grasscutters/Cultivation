/// <reference types="vitest" />

import cssnano from 'cssnano';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tsPaths from 'vite-tsconfig-paths';

import devtoolsPlugin from '@solid-devtools/transform';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  define: {
    'import.meta.vitest': undefined,
  },
  test: {
    coverage: {
      reporter: ['lcov', 'text'],
    },
    includeSource: ['src/**/*.{js,ts,jsx,tsx}'],
    environment: 'jsdom',
    transformMode: {
      web: [/.[jt]sx?/],
    },
    deps: {
      registerNodeLoader: true,
    },
    setupFiles: 'src/setupTests.ts',
  },
  plugins: [
    devtoolsPlugin({
      name: true,
      jsxLocation: true,
    }),
    solidPlugin(),
    tsPaths(),
    vanillaExtractPlugin({
      identifiers: 'short',
    }),
  ],
  resolve: {
    conditions: ['development', 'browser'],
  },
  css: {
    postcss: {
      plugins: [
        cssnano({
          preset: 'advanced',
        }),
      ],
    },
  },
});
