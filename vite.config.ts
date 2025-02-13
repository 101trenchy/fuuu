import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    historyApiFallback: true,
    port: 5173,
    strictPort: true,
    host: true,
    open: true,
    proxy: {},
    cors: true,
    middlewareMode: false,
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: true,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  base: '/'
});