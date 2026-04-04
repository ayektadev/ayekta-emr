import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * GitHub Pages + offline PWA: keep in sync with `BrowserRouter` basename in `src/main.tsx`
 * and PWA `start_url` below. See `docs/v2/github-pages-offline-pwa.md`.
 */
const APP_BASE = '/ayekta-emr/';

// https://vitejs.dev/config/
export default defineConfig({
  base: APP_BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Ayekta Offline EMR',
        short_name: 'Ayekta',
        description: 'Offline Electronic Medical Records System',
        theme_color: '#2a2a2a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/ayekta-emr/',
        icons: [
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,json,webmanifest}'],
        /** When a document request fails (e.g. uncached deep link while offline), serve static offline shell. */
        navigateFallback: `${APP_BASE.replace(/\/$/, '')}/offline.html`,
        navigateFallbackDenylist: [/^\/__/, /\.[a-zA-Z0-9]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@ayekta/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
    },
  },
});
