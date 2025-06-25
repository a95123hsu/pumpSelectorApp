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
  }
});
