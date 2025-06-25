import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split big libraries into their own files
          react: ['react', 'react-dom'],
          plotly: ['plotly.js', 'react-plotly.js'],
          recharts: ['recharts'],
        }
      }
    },
    chunkSizeWarningLimit: 1000 // (Optional) Increase warning limit to 1000 kB
  },
  define: {
    // Provide polyfills needed by some libraries
    global: 'window',
    'process.env': {},
  },
  // Fix for the "buffer/" error
  resolve: {
    alias: {
      // Important: No trailing slash here
      buffer: 'buffer', // <-- no slash!
      process: 'process/browser',
    }
  }
});
