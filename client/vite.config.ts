import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  return {
    base: process.env.VITE_BASE ?? '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      port: Number(env.CLIENT_PORT) || 5173,
      strictPort: true,
      proxy: {
        '/api': `http://localhost:${env.SERVER_PORT || 6001}`,
      },
    },
  }
})
