import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-redirects',
      closeBundle() {
        // Ensure the _redirects file is copied to the build output
        try {
          fs.copyFileSync('public/_redirects', 'dist/_redirects');
        } catch (error) {
          console.error('Error copying _redirects file:', error);
        }
      }
    }
  ],
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