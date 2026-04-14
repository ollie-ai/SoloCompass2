export default {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/app.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/*.test.js'
  ],
  moduleFileExtensions: ['js', 'mjs'],
  transform: {},
  verbose: true,
  testTimeout: 10000,
  setupFilesAfterEnv: []
};
