import * as path from 'node:path';
import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      '$/solid-js': path.resolve(
        __dirname,
        '../../node_modules/solid-js/dist/solid.js',
      ),
    },
  },
});
