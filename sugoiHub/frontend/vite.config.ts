import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Ignorar cambios en archivos de entorno que puedan ser tocados por editores
    watch: {
      ignored: ['**/.env', '**/.env.*', '**/.ENV']
    }
  },
  build: {
    // Emitir el build dentro de backend/dist para que Express lo sirva
    outDir: '../backend/dist'
  }
})
