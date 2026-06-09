/**
 * Jest Configuration for MicroBreaks
 * Premium-level testing setup for React Native + Expo
 */

module.exports = {
  // Use expo preset as base
  preset: 'jest-expo',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Transform configuration
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|zustand)',
  ],

  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.(spec|test).[jt]s?(x)',
    '**/*.(spec|test).[jt]s?(x)',
  ],

  // Ignore patterns. The scalability suites are time-sensitive perf checks
  // that flake on heavily loaded CI runners — they run via the dedicated
  // `test:scalability` script (audit task C-TEST8), not the default suite.
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
    '<rootDir>/dist/',
    // Cloud Functions has its own jest setup (functions/jest.config.js)
    // so root jest shouldn't compile its tests with the jest-expo
    // preset — they run via `npm --prefix functions test`.
    '<rootDir>/functions/',
    process.env.RUN_SCALABILITY ? '' : '<rootDir>/__tests__/unit/scalability/',
  ].filter(Boolean),

  // Coverage configuration
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'store/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],

  // Coverage thresholds
  // Global is set to the realistic current baseline so CI does not fail on
  // legitimate work. Per-module thresholds ratchet up the directories that
  // already have meaningful coverage so they cannot regress.
  //
  // When adding tests, raise the relevant threshold rather than the global —
  // the global is a floor, not a target.
  coverageThreshold: {
    global: {
      branches: 22,
      functions: 28,
      lines: 25,
      statements: 25,
    },
    'services/breakHistory.ts': {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    'services/sync/': {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    'store/': {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Globals
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },

  // Test environment
  testEnvironment: 'jsdom',

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Note: restoreMocks removed - it breaks jest.fn(impl) mocks like AsyncStorage
  // Use jest.restoreAllMocks() explicitly in tests that need it

  // Maximum workers
  maxWorkers: '50%',

  // Fail on console errors
  errorOnDeprecated: true,

  // Timeout for scalability tests (30 seconds)
  testTimeout: 30000,
};
