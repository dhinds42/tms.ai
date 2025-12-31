/**
 * Import Strict Parsing Tests
 */

import { validateImportRows } from '../../shared/math/imports';

describe('Import Strict Parsing', () => {
  
  test('validates all rows correctly', () => {
    const rows = [
      { customer_rate: '$1,000.00', miles: '500' },
      { customer_rate: '850.50', miles: '450' }
    ];
    
    const schema = [
      { field: 'customer_rate', type: 'currency', required: true, min: 0 },
      { field: 'miles', type: 'miles', required: true, min: 1 }
    ];
    
    const result = validateImportRows(rows, schema);
    
    expect(result.validRows.length).toBe(2);
    expect(result.invalidRows.length).toBe(0);
    expect(result.errors.length).toBe(0);
  });
  
  test('rejects invalid currency', () => {
    const rows = [
      { customer_rate: 'invalid', miles: '500' }
    ];
    
    const schema = [
      { field: 'customer_rate', type: 'currency', required: true }
    ];
    
    const result = validateImportRows(rows, schema);
    
    expect(result.validRows.length).toBe(0);
    expect(result.invalidRows.length).toBe(1);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].code).toBe('PARSE_ERROR');
  });
  
  test('enforces required fields', () => {
    const rows = [
      { customer_rate: '', miles: '500' }
    ];
    
    const schema = [
      { field: 'customer_rate', type: 'currency', required: true }
    ];
    
    const result = validateImportRows(rows, schema);
    
    expect(result.errors[0].code).toBe('REQUIRED');
  });
  
  test('enforces numeric bounds', () => {
    const rows = [
      { customer_rate: '50000', miles: '500' }
    ];
    
    const schema = [
      { field: 'customer_rate', type: 'currency', max: 10000 }
    ];
    
    const result = validateImportRows(rows, schema);
    
    expect(result.errors[0].code).toBe('OUT_OF_RANGE');
  });
});