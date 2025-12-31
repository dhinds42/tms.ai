# Testing Instructions
**TMS.ai Math & Finance Test Suite**

## Overview
Comprehensive test coverage for financial calculations, validation, RBAC, and security.

---

## Test Structure

```
functions/
├── __tests__/
│   ├── math/
│   │   ├── money.test.ts           ✅ Core money arithmetic
│   │   ├── parsing.test.ts         ✅ Currency parsing
│   │   ├── rates.test.ts           ✅ Load financials
│   │   ├── settlements.test.ts     ✅ Settlement calculations
│   │   ├── invoice.test.ts         ✅ Invoice calculations
│   │   ├── accessorials.test.ts    ✅ Accessorial charges
│   │   ├── rounding.test.ts        🔨 TODO
│   │   ├── allocation.test.ts      🔨 TODO
│   ├── rbac/
│   │   ├── loadRedaction.test.ts   ✅ Load field redaction
│   │   ├── invoiceRedaction.test.ts 🔨 TODO
│   │   ├── settlementRedaction.test.ts 🔨 TODO
│   ├── integration/
│   │   ├── load-workflow.test.ts   ✅ End-to-end load validation
│   │   ├── invoice-workflow.test.ts 🔨 TODO
│   │   ├── settlement-workflow.test.ts 🔨 TODO
│   ├── security/
│   │   ├── audit.test.ts           🔨 TODO
│   │   ├── locks.test.ts           🔨 TODO
│   │   ├── overrides.test.ts       🔨 TODO
```

---

## Running Tests

### All Tests
```bash
npm test functions/__tests__/
```

### By Category
```bash
# Math core
npm test functions/__tests__/math/

# RBAC security
npm test functions/__tests__/rbac/

# Integration tests
npm test functions/__tests__/integration/

# Specific file
npm test functions/__tests__/math/money.test.ts
```

### With Coverage
```bash
npm test -- --coverage
npm test -- --coverage --coverageReporters=html
open coverage/index.html
```

### Watch Mode (for development)
```bash
npm test -- --watch functions/__tests__/math/
```

---

## Test Coverage Goals

| Module | Target Coverage | Current | Status |
|--------|----------------|---------|--------|
| money.ts | 100% | 95% | ✅ PASS |
| parsing.ts | 100% | 85% | ⚠️ PARTIAL |
| rates.ts | 100% | 80% | ⚠️ PARTIAL |
| settlements.ts | 100% | 75% | ⚠️ PARTIAL |
| invoice.ts | 95% | 70% | 🔨 IN PROGRESS |
| accessorials.ts | 95% | 60% | 🔨 IN PROGRESS |
| RBAC redaction | 100% | 50% | 🔨 IN PROGRESS |
| Integration flows | 90% | 40% | 🔨 IN PROGRESS |

**Overall Target:** 95%+
**Current:** ~65%

---

## Critical Test Scenarios (Must Pass)

### 1. Floating-Point Safety
```typescript
test('0.1 + 0.2 precision issue handled', () => {
  const sum = 0.1 + 0.2; // = 0.30000000000000004
  expect(dollarsToCents(sum)).toBe(30); // ✅
});
```

### 2. Negative Margin Rejection
```typescript
test('negative margin rejected without override', async () => {
  const result = await beforeCreate({
    data: { customer_rate: 800, carrier_pay: 1000 },
    user: { role: 'broker' }
  });
  expect(result.ok).toBe(false);
});
```

### 3. RBAC Redaction
```typescript
test('carrier cannot see margin', async () => {
  const result = await afterRead({
    data: { customer_rate: 1000, margin: 200 },
    user: { role: 'carrier' }
  });
  expect(result.data.margin).toBeUndefined();
});
```

### 4. Penny-Perfect Allocation
```typescript
test('allocate $1.00 three ways = $0.33 + $0.33 + $0.34', () => {
  const result = allocate(100, [1, 1, 1]);
  expect(sum(result)).toBe(100); // No penny lost
});
```

### 5. Currency Parsing
```typescript
test('parses $1,234.56 correctly', () => {
  expect(parseCurrency('$1,234.56')).toBe(123456);
});
```

### 6. Invalid Input Rejection
```typescript
test('rejects invalid currency', () => {
  expect(() => parseCurrency('abc')).toThrow();
});
```

---

## CI/CD Integration

### Pre-Commit Hook
```bash
# Run tests before allowing commit
npm test functions/__tests__/ -- --bail
```

### CI Pipeline (GitHub Actions / CircleCI)
```yaml
- name: Run Math Tests
  run: npm test functions/__tests__/ -- --coverage --ci
  
- name: Enforce Coverage Threshold
  run: |
    if [ $(coverage) -lt 95 ]; then
      echo "Coverage below 95%"
      exit 1
    fi
```

### Pre-Deploy Validation
```bash
# Must pass before production deploy
npm test functions/__tests__/ -- --bail --verbose
```

---

## Test Data Management

### Mock Data Location
`functions/__tests__/fixtures/`
- `loads.json` - Sample load data
- `invoices.json` - Sample invoices
- `settlements.json` - Sample settlements

### Test Database
Use Base44 test environment or in-memory database for integration tests.

---

## Debugging Failed Tests

### View Detailed Output
```bash
npm test -- --verbose
```

### Run Single Test
```bash
npm test -- -t "calculates basic load financials"
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest functions/__tests__/math/money.test.ts
```

---

## Adding New Tests

### Template for Math Function Test
```typescript
import { functionName } from '../../shared/math/module';

describe('Function Name', () => {
  test('handles basic case', () => {
    const result = functionName(input);
    expect(result).toBe(expected);
  });
  
  test('handles edge case', () => {
    expect(() => functionName(badInput)).toThrow();
  });
});
```

### Template for Hook Test
```typescript
import hookFunction from '../../entities/entity/hookName';

describe('Entity Hook', () => {
  test('validates and calculates', async () => {
    const result = await hookFunction({
      data: { /* test data */ },
      user: { role: 'admin' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.calculated_field).toBe(expected);
  });
});
```

---

## Regression Testing

### Critical Regression Tests (Always Run)
1. Load margin calculation accuracy
2. RBAC redaction completeness
3. Currency parsing edge cases
4. Negative value handling
5. Division by zero safety

### Performance Benchmarks
```bash
# Measure calculation performance
npm run benchmark -- functions/shared/math/rates.ts
```

---

## Test Maintenance

### When to Update Tests
- ✅ When adding new math functions
- ✅ When changing business rules
- ✅ When modifying entity hooks
- ✅ After security policy changes
- ✅ Before major releases

### Test Review Process
1. Developer writes tests with code
2. Peer review includes test review
3. QA validates test coverage
4. Security review for RBAC tests

---

**Testing Strategy Owner:** Engineering Lead
**Last Updated:** 2025-12-31