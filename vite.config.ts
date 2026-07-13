import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

let build = 'DEV';
try { build = execSync('git rev-parse --short HEAD', { stdio:['ignore','pipe','ignore'] }).toString().trim(); } catch { /* first build */ }

export default defineConfig({
  base: './',
  define: { __BUILD_ID__: JSON.stringify(build) },
  plugins: [VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg', 'maskable.svg'],
    manifest: {
      name: 'Decimate', short_name: 'Decimate',
      description: 'Wreck the room. Hide before the humans return.',
      theme_color: '#090a0f', background_color: '#090a0f', display: 'standalone',
      orientation: 'landscape', start_url: './', scope: './',
      icons: [
        { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        { src: 'maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,wasm}'],
      maximumFileSizeToCacheInBytes: 4 * 1024 * 1024
    }
  })]
});
