/**
 * Jest configuration — server-side unit tests under base44/functions/__tests__.
 * Scope note: frontend specs under src/components are NOT covered here
 * (they need jsdom + React Testing Library, a separate decision).
 * Known-failure suites are excluded via jest.known-failures.cjs (see
 * TEST_BACKLOG.md); everything else gates CI.
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/base44/functions/__tests__'],
  testMatch: ['**/*.test/entry.ts', '**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'database-verification\\.sql',
    ...require('./jest.known-failures.cjs')],
  setupFiles: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^@base44/sdk$': '<rootDir>/jest.base44-stub.cjs',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true, module: 'commonjs', moduleResolution: 'node',
        target: 'es2020', lib: ['es2020'], skipLibCheck: true, allowJs: true,
      },
      isolatedModules: true,
    }],
  },
  resolver: '<rootDir>/jest-resolver.cjs',
  clearMocks: true,
};
