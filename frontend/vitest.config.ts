import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['**/*.test.tsx', 'jsdom'],
      ['**/hooks/*.test.ts', 'jsdom'],
    ],
    setupFiles: ['./src/vitest.setup.ts'],
  },
});
