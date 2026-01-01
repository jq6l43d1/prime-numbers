import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettierConfig, // Disables conflicting rules
    ],
    plugins: {
      prettier,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]|^_' }],
      'prettier/prettier': 'error', // Run Prettier as ESLint rule
    },
  },
  {
    // Config files need Node globals
    files: ['*.config.js', '*.config.mjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // Test files have relaxed rules and need Node + browser globals
    files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}', 'src/test/**'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-expressions': 'off',
      'no-undef': 'off',
    },
  },
]);
