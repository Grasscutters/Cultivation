<<<<<<< HEAD
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import solid from 'vite-plugin-solid';
=======
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import solid from 'vite-plugin-solid'
>>>>>>> aa45f04 (feat: move to solid-js)

export default defineConfig({
  css: {
    modules: {
      generateScopedName: '[hash:base64:5]',
    },
  },
  plugins: [solid(), splitVendorChunkPlugin()],
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // Tauri expects a fixed port, fail if that port is not available
  server: {
    strictPort: true,
  },
  // to make use of `TAURI_PLATFORM`, `TAURI_ARCH`, `TAURI_FAMILY`,
  // `TAURI_PLATFORM_VERSION`, `TAURI_PLATFORM_TYPE` and `TAURI_DEBUG`
  // env variables
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri supports es2021
    target: ['es2021', 'chrome100', 'safari13'],
    // don't minify for debug builds
    minify: false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
