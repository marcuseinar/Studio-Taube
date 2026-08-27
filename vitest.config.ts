import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Unit tests live beside the code they cover. tests/e2e belongs to
    // Playwright, which has its own runner. The scripts/ entry covers the
    // unattended sync: that code decides what reaches the live site without a
    // human in the loop, which makes it the last place to leave untested.
    include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
    exclude: ['node_modules/**', 'dist/**', 'tests/e2e/**'],
  },
});
