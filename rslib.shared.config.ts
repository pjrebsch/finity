import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es5',
      bundle: false,
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
    distPath: {
      root: './dist',
    },
    cleanDistPath: true,
    target: 'web',
    externals: {
      '$/solid-js': 'solid-js',
    },
    sourceMap: true,
  },
});
