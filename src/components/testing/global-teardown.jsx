/**
 * PLAYWRIGHT GLOBAL TEARDOWN
 * Runs once after all tests complete
 * 
 * PURPOSE:
 * - Clean up test data
 * - Generate final reports
 * - Archive artifacts
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export default async function globalTeardown(config) {
  console.log('🧹 Running global teardown...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: 'playwright/.auth/admin.json'
  });
  const page = await context.newPage();
  
  try {
    const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';
    
    // 1. Clean up test data created during tests
    console.log('🗑️  Cleaning up test data...');
    await page.goto(`${baseURL}/load-board`);
    
    // Delete all test loads
    const testLoads = page.locator('.load-card .load-number').filter({ hasText: /^(TEST-|DUP-|INV-)/ });
    let count = await testLoads.count();
    let deleted = 0;
    
    while (count > 0 && deleted < 50) {
      try {
        await testLoads.nth(0).click({ timeout: 2000 });
        await page.click('button:has-text("Delete")', { timeout: 2000 });
        await page.click('button:has-text("Confirm")', { timeout: 2000 });
        await page.waitForTimeout(500);
        deleted++;
        count = await testLoads.count();
      } catch (e) {
        break;
      }
    }
    console.log(`✅ Deleted ${deleted} test loads`);
    
    // 2. Remove HARD_HOLD status from test customers
    console.log('🔓 Resetting customer credit holds...');
    await page.goto(`${baseURL}/customers`);
    const heldCustomers = page.locator('.status-badge:has-text("HARD HOLD")');
    const holdCount = await heldCustomers.count();
    
    for (let i = 0; i < Math.min(holdCount, 5); i++) {
      try {
        const customerRow = page.locator('tr').filter({ has: page.locator('.status-badge:has-text("HARD HOLD")') }).first();
        await customerRow.click();
        await page.click('button:has-text("Credit Hold")');
        await page.selectOption('select[name="credit_hold_status"]', 'OFF');
        await page.click('button:has-text("Remove Hold")');
        await page.waitForTimeout(500);
      } catch (e) {
        console.log('Could not reset hold:', e.message);
      }
    }
    console.log('✅ Credit holds reset');
    
    // 3. Generate test summary report
    console.log('📊 Generating test summary...');
    const resultsDir = 'test-results';
    const summaryPath = path.join(resultsDir, 'summary.txt');
    
    let summary = 'TMS.AI CRITICAL PATH TEST SUMMARY\n';
    summary += '='.repeat(50) + '\n\n';
    summary += `Test Run: ${new Date().toISOString()}\n`;
    summary += `Environment: ${baseURL}\n\n`;
    
    // Count test results
    try {
      const junitPath = path.join(resultsDir, 'junit.xml');
      if (fs.existsSync(junitPath)) {
        const junitContent = fs.readFileSync(junitPath, 'utf8');
        const testsMatch = junitContent.match(/tests="(\d+)"/);
        const failuresMatch = junitContent.match(/failures="(\d+)"/);
        const errorsMatch = junitContent.match(/errors="(\d+)"/);
        
        const total = testsMatch ? parseInt(testsMatch[1]) : 0;
        const failures = failuresMatch ? parseInt(failuresMatch[1]) : 0;
        const errors = errorsMatch ? parseInt(errorsMatch[1]) : 0;
        const passed = total - failures - errors;
        
        summary += `Total Tests: ${total}\n`;
        summary += `✅ Passed: ${passed}\n`;
        summary += `❌ Failed: ${failures}\n`;
        summary += `⚠️  Errors: ${errors}\n\n`;
        
        if (failures === 0 && errors === 0) {
          summary += '🎉 ALL CRITICAL PATH TESTS PASSED!\n';
        } else {
          summary += '🚨 CRITICAL PATH FAILURES DETECTED!\n';
          summary += 'Review test-results/ for details.\n';
        }
      }
    } catch (e) {
      summary += 'Could not parse test results.\n';
    }
    
    fs.writeFileSync(summaryPath, summary);
    console.log(summary);
    console.log(`✅ Summary saved to ${summaryPath}`);
    
    // 4. Archive screenshots
    const screenshotsDir = path.join(resultsDir);
    if (fs.existsSync(screenshotsDir)) {
      const screenshots = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));
      console.log(`📸 ${screenshots.length} screenshots captured`);
    }
    
    console.log('✅ Global teardown complete');
    
  } catch (error) {
    console.error('❌ Global teardown error:', error);
    // Don't throw - teardown errors shouldn't fail the build
  } finally {
    await browser.close();
  }
}