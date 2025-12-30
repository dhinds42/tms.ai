# TMS.ai Comprehensive Test Plan

**Version:** 1.0  
**Target Coverage:** 60% (up from current ~5%)  
**Priority:** P1 - Required before production

---

## Test Strategy

### Testing Pyramid
```
       /\
      /E2E\         10% - Critical user journeys
     /------\
    /Integration\   30% - API + workflow tests  
   /------------\
  /   Unit Tests  \ 60% - Component + validation tests
 /----------------\
```

---

## PHASE 1: Critical Unit Tests (P0 - Week 1)

### 1.1 Validation Rules Tests
**File:** `components/design-system/__tests__/ValidationRules.test.js`

```javascript
describe('ValidationRules', () => {
  describe('MC Number Validation', () => {
    test('accepts valid 6-digit MC', () => {
      expect(validateField('123456', ValidationRules.mcNumber).valid).toBe(true);
    });
    
    test('accepts MC prefix', () => {
      expect(validateField('MC123456', ValidationRules.mcNumber).valid).toBe(true);
    });
    
    test('rejects too short', () => {
      expect(validateField('1234', ValidationRules.mcNumber).valid).toBe(false);
    });
    
    test('rejects non-numeric', () => {
      expect(validateField('ABC123', ValidationRules.mcNumber).valid).toBe(false);
    });
  });

  describe('Email Validation', () => {
    test('accepts valid email', () => {
      expect(validateField('user@company.com', ValidationRules.email).valid).toBe(true);
    });
    
    test('rejects missing @', () => {
      expect(validateField('usercompany.com', ValidationRules.email).valid).toBe(false);
    });
  });

  describe('Future Date Validation', () => {
    test('accepts future date', () => {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      expect(validateField(future.toISOString().split('T')[0], ValidationRules.futureDate).valid).toBe(true);
    });
    
    test('rejects past date', () => {
      expect(validateField('2020-01-01', ValidationRules.futureDate).valid).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    test('accepts (555) 123-4567', () => {
      expect(validateField('(555) 123-4567', ValidationRules.phone).valid).toBe(true);
    });
    
    test('accepts 5551234567', () => {
      expect(validateField('5551234567', ValidationRules.phone).valid).toBe(true);
    });
    
    test('rejects too short', () => {
      expect(validateField('555123', ValidationRules.phone).valid).toBe(false);
    });
  });
});
```

**Priority:** P0 - Foundation for all validation

---

### 1.2 CSV Import Tests
**File:** `components/import/__tests__/CSVImportProcessor.test.js`

```javascript
describe('CSV Import Processor', () => {
  describe('CSV Parsing', () => {
    test('parses basic CSV', async () => {
      const csv = 'name,email\nJohn,john@test.com\n';
      const blob = new Blob([csv], { type: 'text/csv' });
      const file = new File([blob], 'test.csv');
      
      const { headers, rows } = await parseCSV(file);
      expect(headers).toEqual(['name', 'email']);
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe('John');
    });
    
    test('handles BOM', async () => {
      const csv = '\uFEFFname,email\nJohn,john@test.com\n';
      const blob = new Blob([csv], { type: 'text/csv' });
      const file = new File([blob], 'test.csv');
      
      const { rows } = await parseCSV(file);
      expect(rows[0].name).toBe('John'); // BOM should be stripped
    });
    
    test('handles quoted commas', async () => {
      const csv = 'name,address\n"Smith, John","123 Main St, Suite 200"\n';
      const blob = new Blob([csv], { type: 'text/csv' });
      const file = new File([blob], 'test.csv');
      
      const { rows } = await parseCSV(file);
      expect(rows[0].name).toBe('Smith, John');
      expect(rows[0].address).toBe('123 Main St, Suite 200');
    });
    
    test('rejects empty file', async () => {
      const blob = new Blob([''], { type: 'text/csv' });
      const file = new File([blob], 'empty.csv');
      
      await expect(parseCSV(file)).rejects.toThrow('must have a header row');
    });
  });

  describe('Row Validation - Carrier', () => {
    test('passes valid carrier row', () => {
      const row = {
        carrier_name: 'ABC Trucking',
        mc_number: '123456',
        dot_number: '1234567',
        primary_contact_email: 'test@abc.com',
        primary_contact_phone: '5551234567',
        insurance_expiry_date: '2026-12-31'
      };
      
      const { errors } = validateRow('Carrier', row);
      expect(errors).toHaveLength(0);
    });
    
    test('rejects missing mc_number', () => {
      const row = {
        carrier_name: 'ABC Trucking',
        primary_contact_email: 'test@abc.com'
      };
      
      const { errors } = validateRow('Carrier', row);
      expect(errors.some(e => e.field === 'mc_number')).toBe(true);
    });
    
    test('rejects invalid email', () => {
      const row = {
        carrier_name: 'ABC',
        mc_number: '123456',
        dot_number: '1234567',
        primary_contact_email: 'invalid-email',
        primary_contact_phone: '5551234567',
        insurance_expiry_date: '2026-12-31'
      };
      
      const { errors } = validateRow('Carrier', row);
      expect(errors.some(e => e.field === 'primary_contact_email')).toBe(true);
    });
  });

  describe('Row Validation - Load', () => {
    test('rejects delivery before pickup', () => {
      const row = {
        customer_name: 'ACME',
        origin_city: 'Chicago',
        origin_state: 'IL',
        destination_city: 'Detroit',
        destination_state: 'MI',
        pickup_date: '2025-12-20',
        delivery_date: '2025-12-19', // Before pickup!
        equipment_type: 'dry_van'
      };
      
      const { errors } = validateRow('Load', row);
      expect(errors.some(e => e.field === 'delivery_date')).toBe(true);
    });
    
    test('warns on negative margin', () => {
      const row = {
        customer_name: 'ACME',
        origin_city: 'Chicago',
        origin_state: 'IL',
        destination_city: 'Detroit',
        destination_state: 'MI',
        pickup_date: '2025-12-20',
        delivery_date: '2025-12-21',
        equipment_type: 'dry_van',
        customer_rate: '1000',
        carrier_pay: '1500' // Negative margin!
      };
      
      const { warnings } = validateRow('Load', row);
      expect(warnings.some(w => w.field === 'carrier_pay')).toBe(true);
    });
  });
});
```

**Priority:** P0 - Import feature unusable without tests

---

### 1.3 Field Permission Tests
**File:** `components/rbac/__tests__/FieldPermission.test.js`

```javascript
describe('FieldPermission RBAC', () => {
  test('admin can see all fields', () => {
    const user = { role: 'admin' };
    const { canView } = useFieldPermissions(user);
    expect(canView('customer_rate', ['broker'])).toBe(true);
  });
  
  test('carrier cannot see customer_rate', () => {
    localStorage.setItem('tms_operating_mode', 'carrier');
    const { canView } = useFieldPermissions({ role: 'user' });
    expect(canView('customer_rate', ['broker'])).toBe(false);
  });
  
  test('broker can see margin fields', () => {
    localStorage.setItem('tms_operating_mode', 'broker');
    const { canView } = useFieldPermissions({ role: 'user' });
    expect(canView('margin', ['broker'])).toBe(true);
  });
});
```

**Priority:** P1 - Security critical

---

## PHASE 2: Integration Tests (P1 - Week 2)

### 2.1 Load Workflow Tests
**File:** `__tests__/integration/load-workflow.test.js`

```javascript
describe('Load Workflow Integration', () => {
  test('complete broker workflow: create → tender → assign → deliver', async () => {
    // 1. Create customer
    const customer = await base44.entities.Shipper.create({
      company_name: 'Test Customer',
      email: 'test@customer.com'
    });
    
    // 2. Create load
    const load = await base44.entities.Load.create({
      customer_id: customer.id,
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Detroit', state: 'MI' },
      equipment_type: 'dry_van',
      status: 'available'
    });
    expect(load.status).toBe('available');
    
    // 3. Tender to carrier
    const carrier = await base44.entities.Carrier.create({
      company_name: 'Test Carrier',
      mc_number: '999999'
    });
    
    await base44.entities.Load.update(load.id, {
      carrier_id: carrier.id,
      status: 'tendered'
    });
    
    // 4. Assign driver
    const driver = await base44.entities.Driver.create({
      first_name: 'Test',
      last_name: 'Driver',
      party_id: carrier.id
    });
    
    await base44.entities.Load.update(load.id, {
      driver_id: driver.id,
      status: 'dispatched'
    });
    
    // 5. Deliver
    await base44.entities.Load.update(load.id, {
      status: 'delivered',
      actual_delivery_datetime: new Date().toISOString()
    });
    
    const finalLoad = await base44.entities.Load.filter({ id: load.id });
    expect(finalLoad[0].status).toBe('delivered');
  });
});
```

---

### 2.2 Carrier Onboarding Tests
**File:** `__tests__/integration/carrier-onboarding.test.js`

```javascript
describe('Carrier Onboarding', () => {
  test('prevents duplicate MC number', async () => {
    await base44.entities.Carrier.create({
      company_name: 'Carrier A',
      mc_number: '123456',
      email: 'a@carrier.com'
    });
    
    // Attempt duplicate
    const existing = await base44.entities.Carrier.filter({ mc_number: '123456' });
    expect(existing.length).toBe(1);
    
    // Should prevent or warn
  });
  
  test('requires insurance expiration', async () => {
    // Should fail if insurance_expiration missing or past
  });
});
```

---

## PHASE 3: E2E Tests (P2 - Week 3)

### 3.1 Playwright E2E Tests
**File:** `e2e/broker-workflows.spec.js`

```javascript
test('Broker can create load and assign carrier', async ({ page }) => {
  await page.goto('/load-board');
  await page.click('text=Create Load');
  
  await page.fill('[name="pickup_city"]', 'Chicago');
  await page.fill('[name="pickup_state"]', 'IL');
  await page.fill('[name="delivery_city"]', 'Detroit');
  await page.fill('[name="delivery_state"]', 'MI');
  await page.selectOption('[name="equipment_type"]', 'dry_van');
  
  await page.click('text=Save Load');
  await expect(page.locator('text=Load created')).toBeVisible();
});
```

---

## PHASE 4: Performance Tests (P3 - Week 4)

### 4.1 Load Testing
- Test 1000 concurrent users on LoadBoard
- Test bulk import of 10,000 loads
- Test real-time tracking with 500 active GPS pings

### 4.2 Response Time Targets
- Page load: < 2s
- API response: < 500ms
- Search results: < 1s
- Bulk import: < 30s for 1000 rows

---

## Test Execution Plan

### Week 1 (P0)
- [ ] Set up test framework (Jest + React Testing Library)
- [ ] Write ValidationRules tests (50 tests)
- [ ] Write CSVImportProcessor tests (30 tests)
- [ ] Write FieldPermission tests (20 tests)

### Week 2 (P1)
- [ ] Load workflow integration tests (10 tests)
- [ ] Carrier onboarding tests (10 tests)
- [ ] Document upload tests (10 tests)

### Week 3 (P2)
- [ ] E2E tests for broker workflows (5 tests)
- [ ] E2E tests for carrier workflows (5 tests)
- [ ] E2E tests for driver app (3 tests)

### Week 4 (P3)
- [ ] Performance tests
- [ ] Security penetration tests
- [ ] Accessibility tests (WCAG 2.1 AA)

---

## Success Criteria

- ✅ 60%+ code coverage
- ✅ All P0 tests passing
- ✅ CI/CD pipeline running tests automatically
- ✅ No critical bugs in production workflows

---

**Estimated Effort:** 4 weeks (1 QA engineer full-time)