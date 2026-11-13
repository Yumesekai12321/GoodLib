import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      'data/**',
      'artifacts/**',
    ],
  },
  js.configs.recommended,
  { files: ['**/*.js'], languageOptions: { globals: globals.node } },
  {
    files: ['src/public/js/*.js', 'tests/e2e/*.js'],
    languageOptions: { globals: globals.browser },
  },
];
