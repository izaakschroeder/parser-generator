const config = {
  rootDir: process.cwd(),
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{j,t}s?(x)',
    '!<rootDir>/src/**/__tests__/**',
  ],
  testMatch: ['<rootDir>/src/**/*.test.{j,t}s?(x)'],
  setupFiles: [],
  setupFilesAfterEnv: [],
  transform: {
    '^.+\\.[tj]sx?$': [require.resolve('@swc/jest')],
  },
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageReporters: ['lcov', 'text'],
};

module.exports = config;
