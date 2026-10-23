import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules', '.next'],
    // Human-readable output on the console (default reporter) plus two
    // machine-readable reports on disk whenever CI/`test:report` sets
    // VITEST_REPORT=1, so a run can be inspected or archived afterwards.
    reporters: process.env.VITEST_REPORT
      ? ['default', 'junit', 'json']
      : ['default'],
    outputFile: {
      junit: './reports/unit/junit.xml',
      json: './reports/unit/results.json',
    },
    coverage: {
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './reports/unit/coverage',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});