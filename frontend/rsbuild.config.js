import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.jsx',
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || ''),
    },
  },
  html: {
    template: './index.html',
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
