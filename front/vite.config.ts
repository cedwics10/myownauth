import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      // Serveur du TP1 (batcave-security). Il écoute aussi sur 3000 : à lancer à la place de app/,
      // ou sur un autre port indiqué dans BATCAVE_SECURITY_URL.
      '/batcave-security': {
        target: process.env.BATCAVE_SECURITY_URL ?? 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/batcave-security/, ''),
        configure: (proxy) => {
          // Renommé pour que le navigateur n'ouvre pas sa fenêtre de connexion sur les 401.
          proxy.on('proxyRes', (res) => {
            const value = res.headers['www-authenticate']
            if (value === undefined) return
            delete res.headers['www-authenticate']
            res.headers['x-www-authenticate'] = value
          })
        },
      },
    },
  },
})
