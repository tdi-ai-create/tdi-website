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
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
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
      // Registered so its rule names resolve, with none of them enabled.
      // Files across this codebase carry eslint-disable comments for
      // @typescript-eslint rules. Without the plugin loaded, ESLint treats each
      // one as naming a rule that does not exist and fails the file, so the
      // gate reports "a database write here can fail without anything noticing"
      // about a file whose writes are all checked. A gate that cries wolf is
      // one people learn to skip.
      '@typescript-eslint': tsPlugin,
      // Same reason. app/partners/[dashboardSlug]/page.tsx carries an
      // eslint-disable for react-hooks/exhaustive-deps, so before this was
      // registered, any edit to that file failed the gate with "rule not
      // found" while reporting it as an unchecked database write.
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'tdi/no-unchecked-db-write': 'error',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
];
