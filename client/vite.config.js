import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  const authUrl = env.RENDER_AUTH_URL || env.VITE_AUTH_URL || 'http://localhost:4000'
  const matchingUrl = env.RENDER_MATCHING_URL || env.VITE_API_URL || 'http://localhost:5000/api'

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'import.meta.env.VITE_AUTH_URL': JSON.stringify(authUrl.replace(/\/$/, '')),
      'import.meta.env.VITE_API_URL': JSON.stringify(
        matchingUrl.replace(/\/$/, '').endsWith('/api')
          ? matchingUrl.replace(/\/$/, '')
          : `${matchingUrl.replace(/\/$/, '')}/api`,
      ),
    },
  }
})
