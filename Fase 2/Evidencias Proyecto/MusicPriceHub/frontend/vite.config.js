import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración completa para desarrollo y despliegue
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,      // Puerto local
    open: true,      // Abre el navegador automáticamente
    host: true       // Permite acceder desde otras máquinas en tu red local
  },
  build: {
    outDir: 'dist',  // Carpeta de salida para Render
  },
  base: '/',         // ✅ Importante para rutas correctas en producción
});