// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');
const reactNativePlugin = require('eslint-plugin-react-native');
const typescriptEslintPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      'node_modules/*',
      '.expo/*',
      '__tests__/**/*',
      'jest.setup.js',
      'landing-page/**/*.js',
      'functions/**/*',
    ],
  },
  {
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      'react-native': reactNativePlugin,
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'import/export': 'off',
      'import/first': 'off',
      'import/no-named-as-default-member': 'off',
      'react-hooks/exhaustive-deps': 'error',
      'react-native/no-unused-styles': 'off',
      // Themed and animated React Native surfaces often require computed style objects.
      // Keeping this as an error in the current codebase generates too much lint noise.
      'react-native/no-inline-styles': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
    },
  },
  {
    files: ['scripts/**/*.js', 'app.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]);
