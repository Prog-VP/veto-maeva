import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/bexio': {
          target: 'https://api.bexio.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/bexio/, ''),
          headers: {
            Authorization: `Bearer ${env.VITE_BEXIO_TOKEN}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      },
    },
  }
})
