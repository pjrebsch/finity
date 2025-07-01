import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es6',
      bundle: false,
      autoExtension: false,
      dts: {
        distPath: './dist/types',
      },
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
  ],
  source: {
    tsconfigPath: './tsconfig.json',
  },
  output: {
    target: 'web',
    minify: {
      jsOptions: {
        minimizerOptions: {
          minify: true,
          compress: true,
          mangle: true,
        },
      },
    },
    distPath: {
      root: './dist',
    },
    cleanDistPath: true,
    sourceMap: false,
  },
});
