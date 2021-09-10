module.exports = {
  rootDir: process.env.PWD,
  testEnvironment: 'node',
  resetMocks: true,
  testMatch: ['**/*.test.(t|j)s'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  verbose: true,
}
