import { defineConfig, devices } from '@playwright/test';

/**
 * SoloCompass QA Test Configuration
 * Supports 566+ test scenarios across 27 suites
 */
export default defineConfig({
  testDir: './e2e/suites',
  /* Run tests sequentially to avoid rate limiting */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on failure */
  retries: 1,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use - HTML for CI, list for local */
  reporter: process.env.CI ? 'html' : 'list',

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions */
    baseURL: 'http://localhost:5176',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',

    /* Ignore HTTPS errors in local dev */
    ignoreHTTPSErrors: true,

    /* Longer timeout for complex flows */
    actionTimeout: 60 * 1000,
    navigationTimeout: 90 * 1000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/*.spec.js',
    },
  ],

  /* Global setup - seeds database with test data (via Infisical or .env) */
  globalSetup: './e2e/utils/globalSetup.js',
});
