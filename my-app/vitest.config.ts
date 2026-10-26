import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
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
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
           include: ['**/*.test.ts', '**/*.test.tsx'],
          exclude: ['node_modules', '.next', 'tests/db/**', 'e2e/**'],
          setupFiles: ['tests/setup.ts'], // jest-dom matchers
        },
      },
      {
        extends: true,
        test: {
          name: 'db',
          environment: 'node',
          include: ['tests/db/**/*.test.ts'],
          exclude: ['node_modules', '.next'],
          // DB tests share badge/module rows
          fileParallelism: false,
          testTimeout: 20_000,
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});