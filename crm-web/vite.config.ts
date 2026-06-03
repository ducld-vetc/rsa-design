import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const PORT = 5180;

/** Tasco CRM — chạy tại http://127.0.0.1:5180 (dùng 127.0.0.1, tránh lỗi Connection Failed trên một số IDE) */
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
  plugins: [
    react(),
    {
      name: 'log-crm-url',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          const addr = server.httpServer?.address();
          const port = typeof addr === 'object' && addr ? addr.port : PORT;
          console.log(`\n  Tasco CRM: http://127.0.0.1:${port}/\n`);
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '..'),
    },
  },
});
