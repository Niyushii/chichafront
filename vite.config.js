// vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
  // Quita la sección 'build' si la habías puesto, no la necesitamos.

  // 🚨 AJUSTE CRÍTICO: SOLO INCLUYE, NO EXCLUYAS NADA MÁS
  optimizeDeps: {
    // ELIMINAMOS 'react' y 'rehackt' de la exclusión. 
    // Ahora, solo nos aseguraremos de que el paquete principal de Apollo se incluya.
    exclude: [], 
    
    // Forzamos la pre-agrupación de las dependencias que causan problemas CJS
    include: [
        '@apollo/client', // Forzamos el cliente principal
        'rehackt', // <--- ¡Forzamos a esbuild a procesarlo internamente!
        'graphql'
    ]
  }
})