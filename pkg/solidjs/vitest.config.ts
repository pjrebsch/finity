import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    solid({
      dev: true,
      hot: false,
    }),
  ],
  test: {
    reporters: ['verbose'],
  },
});
