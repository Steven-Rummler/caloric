// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');

module.exports = defineConfig([
  expoConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-requiring-type-checking'].rules,
      ...tseslint.configs.strict.rules,
      '@typescript-eslint/strict-boolean-expressions': 'error',
    },
  },
  {
    ignores: ['dist/*'],
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-constant-binary-expression': 'error',
      'no-duplicate-imports': 'error',
      'no-self-compare': 'error',
      'require-atomic-updates': 'error',
      'camelcase': 'error',
      'curly': ['error', 'multi'],
      'dot-notation': 'error',
      'eqeqeq': 'error',
      'max-depth': ['error', 3],
      'max-params': ['error', 3],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      // 'sort-imports': 'error',
      'spaced-comment': 'error',
      'yoda': 'error',
    },
  }
]);