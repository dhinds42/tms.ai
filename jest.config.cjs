/**
 * Jest configuration — server-side unit tests under base44/functions/__tests__.
 * Scope note: frontend specs under src/components/**/__tests__ are NOT covered
 * here (they need jsdom + React Testing Library, a separate decision).
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/base44/functions/__tests__'],
  testMatch: ['**/*.test/entry.ts', '**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'database-verification\\.sql'],
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
