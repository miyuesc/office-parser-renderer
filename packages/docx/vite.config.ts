import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'opr-docx',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['@opr/shared', '@opr/definitions']
    }
  },
  plugins: [
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json')
    })
  ],
  test: {
    environment: 'happy-dom'
  }
});
