import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración principal de Vite
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,         // Puerto de desarrollo
    open: true,         // Abre automáticamente en el navegador
    host: true,         // Permite acceder desde otras máquinas en la red
  },
})
