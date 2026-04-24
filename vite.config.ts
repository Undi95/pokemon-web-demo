import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(here, 'index.html'),
        editor: resolve(here, 'editor.html')
      }
    }
  },
  server: {
    port: 5173,
    open: '/'
  }
});
