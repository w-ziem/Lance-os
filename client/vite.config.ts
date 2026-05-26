import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Configure backend API proxy for development
  // This allows frontend to call /api/* and have it proxied to Spring Boot
  server: {
    port: 3000,
    // Required when running inside Docker — binds to all interfaces, not just loopback
    host: '0.0.0.0',
    watch: {
      // Windows/WSL2 Docker volumes don't support inotify; polling is the fallback
      usePolling: !!process.env.VITE_BACKEND_URL,
    },
    proxy: {
      '/api': {
        // VITE_BACKEND_URL=http://backend:8080 when running in Docker; falls back to localhost for npm run dev on host
        target: process.env.VITE_BACKEND_URL ?? 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/oauth2': {
        target: process.env.VITE_BACKEND_URL ?? 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Configure path aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },

  // Configure build optimization
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
})
