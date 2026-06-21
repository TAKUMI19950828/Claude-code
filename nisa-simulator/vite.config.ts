import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Netlify 独立サイトとしてルート配信するため base:'/'
export default defineConfig({
  base: '/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
