import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/functions': {
        target: 'http://localhost:54321',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/functions/, ''),
        secure: false
      }
    }
  }
});