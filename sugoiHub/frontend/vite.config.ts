import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Permite cambiar fácilmente el puerto/host del backend en dev.
  // - VITE_API_TARGET=http://127.0.0.1:4000 (opción más directa)
  // - o bien VITE_API_HOST=127.0.0.1 + VITE_API_PORT=4000
  const apiTarget =
    env.VITE_API_TARGET ||
    `http://${env.VITE_API_HOST || '127.0.0.1'}:${env.VITE_API_PORT || '4000'}`

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Ignorar cambios en archivos de entorno que puedan ser tocados por editores
      watch: {
        ignored: ['**/.env', '**/.env.*', '**/.ENV']
      },
      // Proxy API requests to backend during development
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      // Emitir el build dentro de backend/dist para que Express lo sirva
      outDir: '../backend/dist'
    }
  }
})
