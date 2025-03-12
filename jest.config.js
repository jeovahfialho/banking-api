// jest.config.js
module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['/node_modules/'],
    testMatch: [
      '**/tests/unit/**/*.test.js',
      '**/tests/integration/**/*.test.js',
      '**/tests/e2e/**/*.test.js'
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/utils/setup.js'], // IMPORTANTE: adicionar esta linha
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
  };