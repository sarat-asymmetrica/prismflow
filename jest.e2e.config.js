// Jest configuration for Puppeteer E2E tests
module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/__tests__/**/*.e2e.js', '**/?(*.)+(e2e).js'],
  testTimeout: 30000,
  testEnvironment: 'jest-environment-puppeteer',
  setupFilesAfterEnv: ['./jest.e2e.setup.js'],
  globals: {
    BROWSER_PATH: process.env.BROWSER_PATH || 'http://localhost:3000'
  }
};