import react from '@vitejs/plugin-react';
import * as path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@ghostry/finity-reactjs': path.resolve(__dirname, './dist/esm/index.js'),
    },
  },
});
