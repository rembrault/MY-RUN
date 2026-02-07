
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'MY RUN',
        short_name: 'MY RUN',
        description: 'Votre plan d\'entraînement running personnalisé',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'https://via.placeholder.com/192.png/0a0a0f/00ff87?text=MY+RUN',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://via.placeholder.com/512.png/0a0a0f/00ff87?text=MY+RUN',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'https://via.placeholder.com/512.png/0a0a0f/00ff87?text=MY+RUN',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
