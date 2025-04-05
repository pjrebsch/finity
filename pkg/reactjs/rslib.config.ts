import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';
import base from '../../rslib.shared.config';

export default defineConfig({
  ...base,
  plugins: [pluginReact()],
});
