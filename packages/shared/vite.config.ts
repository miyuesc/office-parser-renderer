/// <reference types="vitest" />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'opr-shared',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['jszip', '@opr/definitions']
    }
  },
  plugins: [dts()],
  test: {
    environment: 'happy-dom'
  }
});
