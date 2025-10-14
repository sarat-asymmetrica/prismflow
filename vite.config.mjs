import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: './figma_make_components',
  base: './',
  build: {
    outDir: '../dist-react',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Main chrome window
        main: path.resolve(__dirname, 'figma_make_components/index.html'),
        
        // Overlay windows
        bookmarks: path.resolve(__dirname, 'figma_make_components/overlays/bookmarks.html'),
        history: path.resolve(__dirname, 'figma_make_components/overlays/history.html'),
        downloads: path.resolve(__dirname, 'figma_make_components/overlays/downloads.html'),
        settings: path.resolve(__dirname, 'figma_make_components/overlays/settings.html'),
        'command-palette': path.resolve(__dirname, 'figma_make_components/overlays/command-palette.html'),
      },
      output: {
        // Maintain directory structure for overlays
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'main') {
            return 'assets/[name]-[hash].js';
          }
          return 'overlays/assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './figma_make_components'),
    },
  },
  server: {
    port: 5173,
  },
});
