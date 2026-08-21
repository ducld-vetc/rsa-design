import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const PORT = 3340;

/** Độ phủ trạm — standalone, không menu portal */
export default defineConfig({
  root: path.resolve(__dirname),
  publicDir: path.resolve(__dirname, 'public'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: PORT,
    host: '127.0.0.1',
    strictPort: false,
    open: '/',
  },
  preview: {
    port: PORT,
    host: '127.0.0.1',
    strictPort: false,
    open: '/',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '..'),
    },
  },
});
