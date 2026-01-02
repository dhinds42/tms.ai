/**
 * PLAYWRIGHT GLOBAL SETUP
 * Runs once before all tests
 * 
 * PURPOSE:
 * - Seed test data
 * - Authenticate test users
 * - Set up test environment
 */

import { chromium } from '@playwright/test';

export default async function globalSetup(config) {
  console.log('🚀 Setting up test environment...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Check if app is accessible
    const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';
    console.log(`📡 Checking app availability at ${baseURL}...`);
    
    const response = await page.goto(baseURL, { timeout: 30000 });
    if (!response || !response.ok()) {
      throw new Error(`App not accessible at ${baseURL}`);
    }
    console.log('✅ App is accessible');
    
    // 2. Authenticate admin user (for subsequent tests)
    console.log('🔐 Pre-authenticating admin user...');
    await page.goto(`${baseURL}/login`);
    await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL);
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${baseURL}/**`, { timeout: 10000 });
    
    // Save auth state
    await context.storageState({ path: 'playwright/.auth/admin.json' });
    console.log('✅ Admin auth saved');
    
    // 3. Seed critical test data (if needed)
    console.log('📦 Checking test data...');
    
    // Verify test customer exists
    await page.goto(`${baseURL}/customers`);
    const testCustomer = page.locator('tr:has-text("Test Customer")');
    if (await testCustomer.count() === 0) {
      console.log('⚠️  Test customer not found. Creating...');
      await page.click('button:has-text("Add Customer")');
      await page.fill('input[name="company_name"]', 'Test Customer');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.click('button[type="submit"]');
      console.log('✅ Test customer created');
    } else {
      console.log('✅ Test customer exists');
    }
    
    // 4. Clean up any stale test data from previous runs
    console.log('🧹 Cleaning stale test data...');
    await page.goto(`${baseURL}/load-board`);
    
    // Delete loads starting with TEST-, DUP-, INV-
    const testLoads = page.locator('.load-card .load-number').filter({ hasText: /^(TEST-|DUP-|INV-)/ });
    const count = await testLoads.count();
    if (count > 0) {
      console.log(`Found ${count} stale test loads, deleting...`);
      for (let i = 0; i < Math.min(count, 10); i++) {
        try {
          await testLoads.nth(0).click();
          await page.click('button:has-text("Delete")');
          await page.click('button:has-text("Confirm")');
          await page.waitForTimeout(500);
        } catch (e) {
          console.log('Could not delete load:', e.message);
        }
      }
      console.log('✅ Stale data cleaned');
    }
    
    console.log('✅ Global setup complete');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}