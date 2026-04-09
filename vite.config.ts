
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32.png', 'favicon-192.png', 'logo-myrun.png', 'sw-custom.js'],
      devOptions: {
        enabled: true
      },
      workbox: {
        importScripts: ['/sw-custom.js'],
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
            src: '/favicon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-myrun.png',
            sizes: '800x609',
            type: 'image/png'
          },
          {
            src: '/favicon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
