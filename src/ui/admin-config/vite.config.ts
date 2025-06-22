import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000, // You can change the port if needed
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true
        // rewrite: (path) => path.replace(/^\/api/, '') // This line was causing the 404
      }
    }
  },
});