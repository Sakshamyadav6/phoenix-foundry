import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const page = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works from any folder (GitHub Pages, UWGB web space, etc.)
  base: './',
  build: {
    // Two pages: the home page and /apply/ (the cohort application)
    rollupOptions: {
      input: {
        main: page('./index.html'),
        apply: page('./apply/index.html'),
      },
    },
  },
});
