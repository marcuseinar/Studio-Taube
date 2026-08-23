import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Unit tests live beside the code they cover. tests/e2e belongs to
    // Playwright, which has its own runner.
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**', 'tests/e2e/**'],
  },
});
