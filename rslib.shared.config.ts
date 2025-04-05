import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es5',
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
    {
      format: 'cjs',
      syntax: 'es5',
      bundle: false,
      autoExtension: false,
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
    {
      format: 'umd',
      syntax: 'es5',
      bundle: true,
      autoExtension: false,
      output: {
        distPath: {
          root: './dist/umd',
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
    sourceMap: true,
  },
});
