import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Use process.cwd() assuming vitest is run from root
const root = process.cwd();

export default defineConfig({
  resolve: {
    alias: [
      // Exact match for package root -> src/index.ts
      { find: /^@ai-space\/shared$/, replacement: resolve(root, 'packages/shared/src/index.ts') },
      { find: /^@ai-space\/docx$/, replacement: resolve(root, 'packages/docx/src/index.ts') },
      { find: /^@ai-space\/xlsx$/, replacement: resolve(root, 'packages/xlsx/src/index.ts') },
      
      // Prefix match for subpaths -> packages/<pkg>/...
      // Capture the rest of the path
      { find: /^@ai-space\/shared\/(.*)/, replacement: resolve(root, 'packages/shared/$1') },
      { find: /^@ai-space\/docx\/(.*)/, replacement: resolve(root, 'packages/docx/$1') },
      { find: /^@ai-space\/xlsx\/(.*)/, replacement: resolve(root, 'packages/xlsx/$1') },
    ],
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/*.d.ts', '**/types.ts'],
    },
  },
});
