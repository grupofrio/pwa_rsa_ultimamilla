import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command, mode }) => {
  const useMockAdapter = command === 'serve' || mode === 'test'

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'virtual:api-adapter': fileURLToPath(
          new URL(
            useMockAdapter
              ? './src/services/api/adapters/mock.ts'
              : './src/services/api/adapters/http.ts',
            import.meta.url,
          ),
        ),
        'virtual:simulator-dock': fileURLToPath(
          new URL(
            useMockAdapter
              ? './src/features/simulator/SimulatorDock.tsx'
              : './src/features/simulator/SimulatorDock.prod.tsx',
            import.meta.url,
          ),
        ),
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: 'auto',
        includeAssets: ['brand/via-agil-control-logo.png', 'icons/icon.svg'],
        manifest: {
          name: 'Vía Ágil Control',
          short_name: 'Vía Ágil',
          description: 'Inteligencia operativa de última milla',
          theme_color: '#081C2C',
          background_color: '#F4F7FA',
          display: 'standalone',
          lang: 'es-MX',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'icons/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'font',
              handler: 'CacheFirst',
              options: {
                cacheName: 'via-agil-fonts',
                expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
              handler: 'NetworkOnly',
            },
          ],
        },
      }),
    ],
    server: {
      host: '127.0.0.1',
      port: 5173,
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
    },
  }
})
