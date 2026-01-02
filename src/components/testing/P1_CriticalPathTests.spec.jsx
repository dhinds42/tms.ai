/**
 * P1 CRITICAL PATH FRONTEND TESTS
 * TMS.ai - High-Risk Workflow Validation
 * 
 * IMPLEMENTATION NOTE:
 * This file must be placed in a Playwright test directory outside the Base44 app structure.
 * Example: /e2e/critical-path.spec.js or /tests/critical-path.spec.js
 * 
 * CRITICAL: These tests validate BOTH UI behavior AND server-side enforcement.
 * DO NOT mock authorization, approvals, or financial controls.
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;
const CUSTOMER_EMAIL = process.env.TEST_CUSTOMER_EMAIL;
const CUSTOMER_PASSWORD = process.env.TEST_CUSTOMER_PASSWORD;
const CARRIER_EMAIL = process.env.TEST_CARRIER_EMAIL;
const CARRIER_PASSWORD = process.env.TEST_CARRIER_PASSWORD;

/**
 * HELPER FUNCTIONS
 */

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/**`, { timeout: 10000 });
}

async function createTestLoad(page, customerName = 'Test Customer') {
  // Navigate to Load Board
  await page.goto(`${BASE_URL}/load-board`);
  
  // Click create load button
  await page.click('button:has-text("Create Load")');
  
  // Fill load form
  await page.fill('input[name="load_number"]', `TEST-${Date.now()}`);
  await page.selectOption('select[name="customer"]', { label: customerName });
  await page.fill('input[name="pickup_city"]', 'Chicago');
  await page.fill('input[name="pickup_state"]', 'IL');
  await page.fill('input[name="delivery_city"]', 'Dallas');
  await page.fill('input[name="delivery_state"]', 'TX');
  await page.fill('input[name="customer_rate"]', '2500');
  
  // Submit
  await page.click('button[type="submit"]:has-text("Create")');
  await page.waitForTimeout(1000);
  
  // Return load number
  const loadCard = page.locator('.load-card').first();
  const loadNumber = await loadCard.locator('.load-number').textContent();
  return loadNumber.trim();
}

/**
 * TEST SUITE 1: DISPATCH BOARD DRAG & DROP
 * Validates kanban transitions with server-side state machine
 */

test.describe('Dispatch Board - Drag & Drop Security', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test('T1.1 - Allowed transition: New → Tendered', async ({ page }) => {
    // Tag for CI
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Drag & Drop - Valid Transition' });

    // Create a load in "available" status
    const loadNumber = await createTestLoad(page);
    
    // Navigate to Kanban dispatch board
    await page.goto(`${BASE_URL}/kanban-dispatch-board`);
    await page.waitForSelector('.kanban-column');

    // Find the load card
    const loadCard = page.locator(`.load-card:has-text("${loadNumber}")`);
    await expect(loadCard).toBeVisible();

    // Verify it's in "New" column
    const newColumn = page.locator('.kanban-column[data-status="available"]');
    await expect(newColumn.locator(`.load-card:has-text("${loadNumber}")`)).toBeVisible();

    // Drag to "Tendered" column
    const tenderedColumn = page.locator('.kanban-column[data-status="tendered"]');
    await loadCard.dragTo(tenderedColumn);

    // Wait for server response
    await page.waitForTimeout(1500);

    // Assert UI updated
    await expect(tenderedColumn.locator(`.load-card:has-text("${loadNumber}")`)).toBeVisible();
    await expect(newColumn.locator(`.load-card:has-text("${loadNumber}")`)).not.toBeVisible();

    // Assert no error message
    await expect(page.locator('.error-toast, .error-alert')).not.toBeVisible();

    // Verify backend state (via API check or database)
    const response = await page.request.get(`${BASE_URL}/api/loads?load_number=${loadNumber}`);
    const loadData = await response.json();
    expect(loadData.status).toBe('tendered');
  });

  test('T1.2 - Illegal transition: Invoiced → Dispatched (MUST FAIL)', async ({ page }) => {
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Drag & Drop - Invalid Transition' });

    // Create load and advance to "invoiced" status
    await page.goto(`${BASE_URL}/load-board`);
    await page.click('button:has-text("Create Load")');
    await page.fill('input[name="load_number"]', `INV-${Date.now()}`);
    await page.selectOption('select[name="status"]', 'invoiced'); // Force status
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    const loadNumber = await page.locator('.load-card').first().locator('.load-number').textContent();

    // Navigate to Kanban
    await page.goto(`${BASE_URL}/kanban-dispatch-board`);

    // Find load in "Invoiced" column
    const invoicedColumn = page.locator('.kanban-column[data-status="invoiced"]');
    const loadCard = invoicedColumn.locator(`.load-card:has-text("${loadNumber.trim()}")`);
    await expect(loadCard).toBeVisible();

    // Attempt to drag to "Dispatched" (illegal backward transition)
    const dispatchedColumn = page.locator('.kanban-column[data-status="dispatched"]');
    await loadCard.dragTo(dispatchedColumn);

    // Wait for server rejection
    await page.waitForTimeout(1500);

    // Assert load STAYED in Invoiced column
    await expect(invoicedColumn.locator(`.load-card:has-text("${loadNumber.trim()}")`)).toBeVisible();
    await expect(dispatchedColumn.locator(`.load-card:has-text("${loadNumber.trim()}")`)).not.toBeVisible();

    // Assert error message displayed
    await expect(page.locator('.error-toast, .error-alert')).toBeVisible();
    await expect(page.locator('text=/illegal transition|cannot move|invalid status/i')).toBeVisible();

    // Screenshot on expected failure
    await page.screenshot({ path: 'test-results/illegal-transition-blocked.png' });
  });

  test('T1.3 - Exception column requires reason modal', async ({ page }) => {
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Drag & Drop - Exception Reason' });

    const loadNumber = await createTestLoad(page);
    await page.goto(`${BASE_URL}/kanban-dispatch-board`);

    const loadCard = page.locator(`.load-card:has-text("${loadNumber}")`);
    const exceptionColumn = page.locator('.kanban-column[data-status="exception"]');

    await loadCard.dragTo(exceptionColumn);
    await page.waitForTimeout(500);

    // Assert modal appeared
    await expect(page.locator('.modal-title:has-text("Exception Reason")')).toBeVisible();
    await expect(page.locator('textarea[name="exception_reason"]')).toBeVisible();

    // Submit without reason
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=/reason is required/i')).toBeVisible();

    // Provide reason and submit
    await page.fill('textarea[name="exception_reason"]', 'Customer requested delay');
    await page.click('button:has-text("Submit")');
    await page.waitForTimeout(1500);

    // Assert move succeeded
    await expect(exceptionColumn.locator(`.load-card:has-text("${loadNumber}")`)).toBeVisible();
  });
});

/**
 * TEST SUITE 2: APPROVAL WORKFLOW
 * Validates dual-control for privileged actions
 */

test.describe('Approval Workflow - Dual Control', () => {
  test('T2.1 - Bank account change requires approval', async ({ page }) => {
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Approval - Bank Change' });

    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto(`${BASE_URL}/settings`);

    // Navigate to carrier settings
    await page.click('a:has-text("Carriers")');
    const carrierRow = page.locator('tr').filter({ hasText: 'ABC Trucking' }).first();
    await carrierRow.click();

    // Click edit bank account
    await page.click('button:has-text("Edit Bank Account")');
    await page.fill('input[name="bank_account_number"]', '9876543210');
    await page.fill('input[name="bank_routing_number"]', '021000021');
    await page.click('button[type="submit"]');

    // Assert approval request created
    await expect(page.locator('text=/approval requested|pending approval/i')).toBeVisible();
    await expect(page.locator('.status-badge:has-text("Pending")')).toBeVisible();

    // Verify bank account NOT changed yet
    const accountDisplay = page.locator('.bank-account-display');
    await expect(accountDisplay).not.toContainText('9876543210');

    // Screenshot pending state
    await page.screenshot({ path: 'test-results/bank-change-pending.png' });
  });

  test('T2.2 - User cannot self-approve', async ({ page }) => {
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Approval - No Self-Approve' });

    // User creates approval request (rate change)
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto(`${BASE_URL}/lane-rate-management`);
    
    // Edit a lane rate
    await page.click('.lane-rate-card').first();
    await page.click('button:has-text("Edit Rate")');
    await page.fill('input[name="customer_rate"]', '5000');
    await page.click('button:has-text("Save Changes")');

    // Navigate to approvals page
    await page.goto(`${BASE_URL}/approvals`);
    const approvalCard = page.locator('.approval-card').first();
    await expect(approvalCard).toBeVisible();

    // Attempt to approve own request
    await approvalCard.click();
    const approveButton = page.locator('button:has-text("Approve")');
    
    // Assert button is disabled OR shows warning
    const isDisabled = await approveButton.isDisabled();
    if (!isDisabled) {
      // If button enabled, clicking should show error
      await approveButton.click();
      await expect(page.locator('text=/cannot approve your own|self-approval not allowed/i')).toBeVisible();
    } else {
      // Button should be disabled with tooltip
      await approveButton.hover();
      await expect(page.locator('.tooltip:has-text("self-approve")')).toBeVisible();
    }

    await page.screenshot({ path: 'test-results/no-self-approve.png' });
  });

  test('T2.3 - Approval requires MFA for privileged roles', async ({ page }) => {
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Approval - MFA Enforcement' });

    // Login as user with privileged role
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    
    // Another user creates approval request (simulate via API or second session)
    // For test purposes, assume approval exists
    await page.goto(`${BASE_URL}/approvals`);
    const approvalCard = page.locator('.approval-card').first();
    await approvalCard.click();

    // Click approve
    await page.click('button:has-text("Approve")');
    await page.waitForTimeout(500);

    // Assert MFA prompt appears
    await expect(page.locator('.mfa-prompt, .modal-title:has-text("Verify Identity")')).toBeVisible();
    await expect(page.locator('input[name="mfa_code"]')).toBeVisible();

    // Attempt to submit without MFA
    await page.click('button:has-text("Confirm")');
    await expect(page.locator('text=/mfa code required|verification required/i')).toBeVisible();

    await page.screenshot({ path: 'test-results/mfa-required.png' });
  });
});

/**
 * TEST SUITE 3: CREDIT HOLD ENFORCEMENT
 * Validates financial risk controls
 */

test.describe('Credit Hold - Financial Controls', () => {
  test('T3.1 - HARD_HOLD blocks load creation', async ({ page }) => {
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Credit Hold - Block Load' });

    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    // Set customer to HARD_HOLD
    await page.goto(`${BASE_URL}/customers`);
    const customerRow = page.locator('tr').filter({ hasText: 'Acme Corp' }).first();
    await customerRow.click();
    await page.click('button:has-text("Credit Hold")');
    await page.selectOption('select[name="credit_hold_status"]', 'HARD_HOLD');
    await page.fill('textarea[name="credit_hold_reason"]', 'Payment overdue 90+ days');
    await page.click('button:has-text("Apply Hold")');
    await expect(page.locator('.status-badge:has-text("HARD HOLD")')).toBeVisible();

    // Attempt to create load for this customer
    await page.goto(`${BASE_URL}/load-board`);
    await page.click('button:has-text("Create Load")');
    await page.selectOption('select[name="customer"]', { label: 'Acme Corp' });
    await page.fill('input[name="pickup_city"]', 'Atlanta');
    await page.fill('input[name="pickup_state"]', 'GA');
    await page.fill('input[name="delivery_city"]', 'Miami');
    await page.fill('input[name="delivery_state"]', 'FL');
    await page.fill('input[name="customer_rate"]', '1800');

    // Submit form
    await page.click('button[type="submit"]:has-text("Create")');
    await page.waitForTimeout(1000);

    // Assert load creation blocked
    await expect(page.locator('.error-alert, .error-toast')).toBeVisible();
    await expect(page.locator('text=/credit hold|hard hold|customer on hold/i')).toBeVisible();

    // Assert load NOT created (check load board)
    await page.goto(`${BASE_URL}/load-board`);
    await expect(page.locator('.load-card:has-text("Acme Corp")')).not.toBeVisible();

    await page.screenshot({ path: 'test-results/hard-hold-blocked.png' });
  });

  test('T3.2 - SOFT_HOLD shows warning but allows creation', async ({ page }) => {
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Credit Hold - Soft Warning' });

    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    // Set customer to SOFT_HOLD
    await page.goto(`${BASE_URL}/customers`);
    const customerRow = page.locator('tr').filter({ hasText: 'Beta LLC' }).first();
    await customerRow.click();
    await page.click('button:has-text("Credit Hold")');
    await page.selectOption('select[name="credit_hold_status"]', 'SOFT_HOLD');
    await page.fill('textarea[name="credit_hold_reason"]', 'Review needed');
    await page.click('button:has-text("Apply Hold")');

    // Create load for SOFT_HOLD customer
    await page.goto(`${BASE_URL}/load-board`);
    await page.click('button:has-text("Create Load")');
    await page.selectOption('select[name="customer"]', { label: 'Beta LLC' });
    await page.fill('input[name="customer_rate"]', '2200');
    // ... fill other fields ...

    // Submit - should show warning
    await page.click('button[type="submit"]:has-text("Create")');
    await page.waitForTimeout(500);

    // Assert warning modal appears
    await expect(page.locator('.modal-title:has-text("Credit Hold Warning")')).toBeVisible();
    await expect(page.locator('text=/customer is on soft hold|proceed with caution/i')).toBeVisible();

    // Confirm creation
    await page.click('button:has-text("Create Anyway")');
    await page.waitForTimeout(1500);

    // Assert load WAS created
    await expect(page.locator('.success-toast:has-text("Load created")')).toBeVisible();

    await page.screenshot({ path: 'test-results/soft-hold-warning.png' });
  });
});

/**
 * TEST SUITE 4: FIELD REDACTION
 * Validates role-based data visibility
 */

test.describe('Field Redaction - Data Privacy', () => {
  test('T4.1 - Customer cannot see carrier pay or margin', async ({ page }) => {
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Redaction - Customer View' });

    // Login as customer user
    await login(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD);

    // Navigate to customer portal loads
    await page.goto(`${BASE_URL}/customer-portal`);
    await page.click('a:has-text("My Loads")');

    // Find a completed load
    const loadCard = page.locator('.load-card[data-status="delivered"]').first();
    await loadCard.click();

    // Assert customer_rate is VISIBLE
    await expect(page.locator('.field-label:has-text("Customer Rate")')).toBeVisible();
    const customerRate = page.locator('.field-value[data-field="customer_rate"]');
    await expect(customerRate).toBeVisible();
    const rateText = await customerRate.textContent();
    expect(rateText).toMatch(/\$[\d,]+/);

    // Assert carrier_pay is HIDDEN (field not rendered)
    await expect(page.locator('.field-label:has-text("Carrier Pay")')).not.toBeVisible();
    await expect(page.locator('.field-value[data-field="carrier_pay"]')).not.toBeVisible();

    // Assert margin is HIDDEN
    await expect(page.locator('.field-label:has-text("Margin")')).not.toBeVisible();
    await expect(page.locator('.field-value[data-field="margin"]')).not.toBeVisible();

    // Verify via devtools that data is not in DOM
    const htmlContent = await page.content();
    expect(htmlContent).not.toContain('carrier_pay');
    expect(htmlContent).not.toContain('margin');

    await page.screenshot({ path: 'test-results/customer-redaction.png' });
  });

  test('T4.2 - Carrier cannot see customer rate', async ({ page }) => {
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Redaction - Carrier View' });

    await login(page, CARRIER_EMAIL, CARRIER_PASSWORD);

    await page.goto(`${BASE_URL}/carrier-portal`);
    await page.click('a:has-text("My Loads")');

    const loadCard = page.locator('.load-card').first();
    await loadCard.click();

    // Assert carrier_pay is VISIBLE
    await expect(page.locator('.field-label:has-text("Carrier Pay")')).toBeVisible();
    const carrierPay = page.locator('.field-value[data-field="carrier_pay"]');
    await expect(carrierPay).toBeVisible();

    // Assert customer_rate is HIDDEN
    await expect(page.locator('.field-label:has-text("Customer Rate")')).not.toBeVisible();
    await expect(page.locator('.field-value[data-field="customer_rate"]')).not.toBeVisible();

    // Assert margin is HIDDEN
    await expect(page.locator('.field-label:has-text("Margin")')).not.toBeVisible();

    const htmlContent = await page.content();
    expect(htmlContent).not.toContain('customer_rate');
    expect(htmlContent).not.toContain('margin');

    await page.screenshot({ path: 'test-results/carrier-redaction.png' });
  });

  test('T4.3 - Broker admin can see all financial fields', async ({ page }) => {
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Redaction - Admin Full View' });

    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.goto(`${BASE_URL}/load-board`);
    const loadCard = page.locator('.load-card').first();
    await loadCard.click();

    // Assert ALL fields visible
    await expect(page.locator('.field-label:has-text("Customer Rate")')).toBeVisible();
    await expect(page.locator('.field-label:has-text("Carrier Pay")')).toBeVisible();
    await expect(page.locator('.field-label:has-text("Margin")')).toBeVisible();

    // Verify values are present
    const customerRate = await page.locator('.field-value[data-field="customer_rate"]').textContent();
    const carrierPay = await page.locator('.field-value[data-field="carrier_pay"]').textContent();
    const margin = await page.locator('.field-value[data-field="margin"]').textContent();

    expect(customerRate).toMatch(/\$[\d,]+/);
    expect(carrierPay).toMatch(/\$[\d,]+/);
    expect(margin).toMatch(/\$[\d,]+/);

    await page.screenshot({ path: 'test-results/admin-full-view.png' });
  });
});

/**
 * TEST SUITE 5: DRIVER WORKFLOW
 * Validates document requirements and status progression
 */

test.describe('Driver Workflow - Document Requirements', () => {
  test('T5.1 - Driver cannot mark Delivered without POD', async ({ page }) => {
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Driver - POD Required' });

    await login(page, CARRIER_EMAIL, CARRIER_PASSWORD); // Driver login would be similar

    // Navigate to driver portal
    await page.goto(`${BASE_URL}/driver-portal`);
    
    // Find an in-transit load
    const loadCard = page.locator('.load-card[data-status="in_transit"]').first();
    await loadCard.click();

    // Click "Mark Delivered" button
    await page.click('button:has-text("Mark Delivered")');
    await page.waitForTimeout(500);

    // Assert document checklist modal appears
    await expect(page.locator('.modal-title:has-text("Required Documents")')).toBeVisible();
    await expect(page.locator('text=/proof of delivery|POD required/i')).toBeVisible();

    // Attempt to submit without POD
    await page.click('button:has-text("Submit")');
    await page.waitForTimeout(500);

    // Assert error shown
    await expect(page.locator('.error-message:has-text("POD")')).toBeVisible();

    // Upload POD
    const podInput = page.locator('input[type="file"][name="pod"]');
    await podInput.setInputFiles('test-fixtures/sample-pod.pdf');
    await page.waitForTimeout(1000);

    // Assert upload confirmed
    await expect(page.locator('.file-uploaded:has-text("sample-pod.pdf")')).toBeVisible();

    // Submit again
    await page.click('button:has-text("Submit")');
    await page.waitForTimeout(2000);

    // Assert status changed to delivered
    await expect(page.locator('.status-badge:has-text("Delivered")')).toBeVisible();

    await page.screenshot({ path: 'test-results/pod-required.png' });
  });

  test('T5.2 - Driver must complete check calls', async ({ page }) => {
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Driver - Check Calls' });

    await login(page, CARRIER_EMAIL, CARRIER_PASSWORD);

    await page.goto(`${BASE_URL}/driver-portal`);
    const loadCard = page.locator('.load-card[data-status="in_transit"]').first();
    await loadCard.click();

    // Verify check call reminders
    await expect(page.locator('.alert:has-text("Check call required")')).toBeVisible();

    // Click log check call
    await page.click('button:has-text("Log Check Call")');
    await page.fill('textarea[name="notes"]', 'En route, ETA 2 hours');
    await page.click('button:has-text("Submit Call")');

    // Assert check call logged
    await expect(page.locator('.success-toast:has-text("Check call logged")')).toBeVisible();
    await expect(page.locator('.check-call-history')).toContainText('En route, ETA 2 hours');

    await page.screenshot({ path: 'test-results/check-call-logged.png' });
  });
});

/**
 * ADDITIONAL CRITICAL TESTS
 */

test.describe('Additional Critical Paths', () => {
  test('T6.1 - Rate variance requires approval when exceeds threshold', async ({ page }) => {
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Variance - Approval Trigger' });

    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    // Create load with quote
    await page.goto(`${BASE_URL}/quote-management`);
    await page.click('button:has-text("New Quote")');
    await page.fill('input[name="customer_rate"]', '3000');
    await page.click('button:has-text("Save Quote")');

    // Create load from quote
    await page.click('button:has-text("Convert to Load")');
    await page.fill('input[name="carrier_pay"]', '2200'); // 800 margin = 26.7%

    // Attempt to increase carrier pay significantly (variance > 10%)
    await page.fill('input[name="carrier_pay"]', '2700'); // 300 margin = 10%, triggers approval

    await page.click('button:has-text("Create Load")');
    await page.waitForTimeout(1500);

    // Assert approval request created
    await expect(page.locator('text=/variance exceeds|approval required/i')).toBeVisible();
    await expect(page.locator('.status-badge:has-text("Pending Approval")')).toBeVisible();

    await page.screenshot({ path: 'test-results/variance-approval.png' });
  });

  test('T6.2 - Duplicate load prevention', async ({ page }) => {
    test.info().annotations.push({ type: 'CRITICAL_PATH', description: 'Duplicate - Prevention' });

    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    // Create load
    const loadNumber = `DUP-${Date.now()}`;
    await page.goto(`${BASE_URL}/load-board`);
    await page.click('button:has-text("Create Load")');
    await page.fill('input[name="load_number"]', loadNumber);
    // ... fill other fields ...
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(1500);
    await expect(page.locator('.success-toast')).toBeVisible();

    // Attempt to create duplicate
    await page.click('button:has-text("Create Load")');
    await page.fill('input[name="load_number"]', loadNumber);
    // ... fill same fields ...
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(1000);

    // Assert duplicate blocked
    await expect(page.locator('.error-alert:has-text("already exists")')).toBeVisible();

    await page.screenshot({ path: 'test-results/duplicate-blocked.png' });
  });
});