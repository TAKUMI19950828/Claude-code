import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps asset paths relative so the build works on Netlify
// or when served from a sub-path.
export default defineConfig({
  plugins: [react()],
  base: './',
});
