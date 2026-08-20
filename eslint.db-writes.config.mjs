/**
 * A config that runs ONE rule and nothing else.
 *
 * `npm run lint` currently reports 10,587 problems, 6,986 of them errors, all
 * pre-existing. A new rule added there would be one line in a wall nobody reads
 * and could never act as a gate.
 *
 * This config exists so `npm run check:writes` can be a gate today, without
 * waiting for the rest of the lint debt to be paid down.
 *
 * Run:  npm run check:writes
 */

import tsParser from '@typescript-eslint/parser';
import noUncheckedDbWrite from './eslint-rules/no-unchecked-db-write.mjs';

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      '.claude/**',
      'out/**',
      'build/**',
      'audit/**',
      'github-mcp-server/**',
    ],
  },
  {
    files: ['app/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'scripts/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      tdi: { rules: { 'no-unchecked-db-write': noUncheckedDbWrite } },
    },
    rules: {
      'tdi/no-unchecked-db-write': 'error',
    },
  },
];
