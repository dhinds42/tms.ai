# GITHUB ACTIONS CI/CD PIPELINE
# TMS.AI Critical Path Tests
#
# SETUP INSTRUCTIONS:
# 1. Create .github/workflows/e2e-tests.yml in your repository
# 2. Copy this content there
# 3. Set repository secrets (Settings → Secrets → Actions):
#    - TEST_ADMIN_EMAIL
#    - TEST_ADMIN_PASSWORD
#    - TEST_CUSTOMER_EMAIL
#    - TEST_CUSTOMER_PASSWORD
#    - TEST_CARRIER_EMAIL
#    - TEST_CARRIER_PASSWORD
#    - STAGING_URL (if testing against staging)

name: E2E Critical Path Tests

on:
  # Run on pull requests
  pull_request:
    branches: [main, develop]
  
  # Run on push to main
  push:
    branches: [main]
  
  # Allow manual trigger
  workflow_dispatch:

jobs:
  e2e-tests:
    name: Playwright Critical Path Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      # 1. Checkout code
      - name: Checkout repository
        uses: actions/checkout@v4
      
      # 2. Setup Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      # 3. Install dependencies
      - name: Install dependencies
        run: npm ci
      
      # 4. Install Playwright browsers
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      # 5. Build application (if needed)
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
      
      # 6. Start application server (background)
      - name: Start application
        run: npm run start &
        env:
          NODE_ENV: test
          PORT: 3000
      
      # 7. Wait for server to be ready
      - name: Wait for server
        run: npx wait-on http://localhost:3000 -t 60000
      
      # 8. Run Playwright tests
      - name: Run critical path tests
        run: npx playwright test --project=chromium
        env:
          CI: true
          TEST_BASE_URL: http://localhost:3000
          TEST_ADMIN_EMAIL: ${{ secrets.TEST_ADMIN_EMAIL }}
          TEST_ADMIN_PASSWORD: ${{ secrets.TEST_ADMIN_PASSWORD }}
          TEST_CUSTOMER_EMAIL: ${{ secrets.TEST_CUSTOMER_EMAIL }}
          TEST_CUSTOMER_PASSWORD: ${{ secrets.TEST_CUSTOMER_PASSWORD }}
          TEST_CARRIER_EMAIL: ${{ secrets.TEST_CARRIER_EMAIL }}
          TEST_CARRIER_PASSWORD: ${{ secrets.TEST_CARRIER_PASSWORD }}
      
      # 9. Upload test results (always, even on failure)
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
      
      # 10. Upload screenshots on failure
      - name: Upload failure screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: failure-screenshots
          path: test-results/*.png
          retention-days: 30
      
      # 11. Upload video recordings on failure
      - name: Upload failure videos
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: failure-videos
          path: test-results/**/*.webm
          retention-days: 30
      
      # 12. Comment test results on PR
      - name: Comment test results
        if: github.event_name == 'pull_request'
        uses: daun/playwright-report-comment@v3
        with:
          report-path: playwright-report/
          
      # 13. Fail build if tests failed
      - name: Check test results
        if: failure()
        run: |
          echo "❌ CRITICAL PATH TESTS FAILED!"
          echo "Review artifacts for details."
          exit 1

  # Optional: Run on staging environment
  e2e-staging:
    name: Staging Environment Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Run tests against staging
        run: npx playwright test --project=chromium
        env:
          CI: true
          TEST_BASE_URL: ${{ secrets.STAGING_URL }}
          TEST_ADMIN_EMAIL: ${{ secrets.TEST_ADMIN_EMAIL }}
          TEST_ADMIN_PASSWORD: ${{ secrets.TEST_ADMIN_PASSWORD }}
          TEST_CUSTOMER_EMAIL: ${{ secrets.TEST_CUSTOMER_EMAIL }}
          TEST_CUSTOMER_PASSWORD: ${{ secrets.TEST_CUSTOMER_PASSWORD }}
          TEST_CARRIER_EMAIL: ${{ secrets.TEST_CARRIER_EMAIL }}
          TEST_CARRIER_PASSWORD: ${{ secrets.TEST_CARRIER_PASSWORD }}
      
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: staging-test-report
          path: playwright-report/
          retention-days: 30

# ALTERNATIVE: GITLAB CI/CD
# 
# Save as .gitlab-ci.yml:
#
# stages:
#   - test
# 
# e2e-tests:
#   stage: test
#   image: mcr.microsoft.com/playwright:v1.40.0-focal
#   script:
#     - npm ci
#     - npm run build
#     - npm start &
#     - npx wait-on http://localhost:3000
#     - npx playwright test
#   artifacts:
#     when: always
#     paths:
#       - playwright-report/
#       - test-results/
#     expire_in: 30 days
#   variables:
#     TEST_BASE_URL: "http://localhost:3000"
#     TEST_ADMIN_EMAIL: $TEST_ADMIN_EMAIL
#     TEST_ADMIN_PASSWORD: $TEST_ADMIN_PASSWORD
#   only:
#     - merge_requests
#     - main