import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicons/favicon.ico',
        'favicons/apple-touch-icon.png',
        'favicons/favicon-96x96.png',
        'favicons/favicon.svg',
      ],
      manifest: {
        name: '바디버디',
        short_name: '바디버디',
        description: '함께 기록하고, 함께 건강해져요',
        lang: 'ko',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#ffad34',
        background_color: '#ffffff',
        icons: [
          {
            src: 'favicons/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'favicons/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
