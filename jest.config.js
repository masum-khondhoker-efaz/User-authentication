module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
      '^.+\\.ts$': 'ts-jest'
    },
    testMatch: ['**/*.spec.ts'],
    collectCoverageFrom: ['src/**/*.ts'],
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/dist/',
      '/__tests__/',
      'src/app.ts',
      'src/server.ts'
    ]
  };