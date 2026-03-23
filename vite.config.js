import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/bexio': {
          target: 'https://api.bexio.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/bexio/, ''),
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
