/**
 * Jest config for the Cloud Functions package.
 *
 * Kept minimal: ts-jest preset, scope only to `src/`, no coverage
 * thresholds yet. The functions code is small enough that adding
 * gate-style thresholds would mostly bikeshed; we'll add them when
 * the package grows.
 */

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  // Skip type-checking node_modules to keep ts-jest fast.
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
