/**
 * Playwright Configuration for PrismFlow Browser
 * Asymmetrica Protocol Compliant Testing
 * 
 * @asymmetrica: playwright_config
 * σ: TestConfiguration | Playwright setup for Electron testing
 * ρ: Global | Project-wide test configuration
 * γ: Stabilization | Infrastructure for testing
 * κ: O(1) | Configuration load time
 * λ: [Playwright → Electron → PrismFlow]
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './__tests__',
  
  // Match integration test files
  testMatch: '**/*.integration.spec.js',
  
  // Timeout for each test
  timeout: 30000,
  
  // Test execution settings
  fullyParallel: false, // Sequential for Electron app tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // One worker for Electron (single app instance)
  
  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }]
  ],
  
  // Output directory
  outputDir: 'test-results/',
  
  // Use configuration
  use: {
    // Base URL for web server (if needed)
    // baseURL: 'http://localhost:3000',
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Action timeout
    actionTimeout: 10000,
  },

  // Projects configuration
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Electron-specific settings will be in the test files
      },
    },
  ],

  // Web server (if testing web version)
  // webServer: {
  //   command: 'npm start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
