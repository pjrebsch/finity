import * as path from 'node:path';
import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    solid({
      dev: true,
      hot: false,
    }),
  ],
  resolve: {
    alias: {
      '@ghostry/finity-solidjs': path.resolve(__dirname, './dist/esm/index.js'),
    },
  },
});
