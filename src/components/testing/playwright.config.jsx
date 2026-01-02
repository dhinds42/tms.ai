/**
 * PLAYWRIGHT CONFIGURATION FOR TMS.AI CRITICAL PATH TESTS
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install Playwright: npm install -D @playwright/test
 * 2. Place this file at project root as: playwright.config.js
 * 3. Create /e2e directory and move P1_CriticalPathTests.spec.js there
 * 4. Set environment variables in .env.test (see below)
 * 5. Run: npx playwright test
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './e2e',
  
  // Test file pattern
  testMatch: '**/*.spec.js',
  
  // Parallel execution
  fullyParallel: false, // Sequential for critical tests to avoid conflicts
  workers: 1,
  
  // Retries
  retries: process.env.CI ? 2 : 0,
  
  // Timeout
  timeout: 60000, // 60s per test
  expect: {
    timeout: 10000 // 10s for assertions
  },
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
    ...(process.env.CI ? [['github']] : [])
  ],
  
  // Screenshot/video on failure
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Slow down for debugging (optional)
    // launchOptions: {
    //   slowMo: 100
    // }
  },
  
  // Browser projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    
    // Mobile testing (optional)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],
  
  // Web server (if testing locally)
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  
  // Global setup/teardown
  globalSetup: './e2e/global-setup.js',
  globalTeardown: './e2e/global-teardown.js',
});

/**
 * REQUIRED ENVIRONMENT VARIABLES (.env.test)
 * 
 * TEST_BASE_URL=http://localhost:3000
 * TEST_ADMIN_EMAIL=admin@example.com
 * TEST_ADMIN_PASSWORD=test-admin-password
 * TEST_CUSTOMER_EMAIL=customer@example.com
 * TEST_CUSTOMER_PASSWORD=test-customer-password
 * TEST_CARRIER_EMAIL=carrier@example.com
 * TEST_CARRIER_PASSWORD=test-carrier-password
 * 
 * FOR CI/CD:
 * TEST_BASE_URL=https://staging.tms.ai
 * (store credentials in CI secrets)
 */