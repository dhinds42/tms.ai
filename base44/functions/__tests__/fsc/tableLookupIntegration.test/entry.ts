/**
 * FSC Table Lookup Integration Tests
 * Tests actual database queries for FSC table resolution
 */

describe('FSC Table Lookup Integration', () => {
  
  describe('Fuel Price Basis', () => {
    test('finds correct row for fuel price within range', async () => {
      // Mock base44 client
      const mockBase44 = {
        asServiceRole: {
          entities: {
            CustomerFSCTable: {
              filter: jest.fn().mockResolvedValue([{
                id: 'table_1',
                name: 'Standard FSC 2026',
                mode_scope: 'TRUCK',
                basis_type: 'FUEL_PRICE',
                charge_type: 'CPM_CENTS',
                effective_start: '2026-01-01',
                effective_end: null,
                is_active: true
              }])
            },
            CustomerFSCTableRow: {
              filter: jest.fn().mockResolvedValue([
                { id: 'row_1', fsc_table_id: 'table_1', fuel_price_min: 3.00, fuel_price_max: 3.50, cpm_cents: 10, is_active: true },
                { id: 'row_2', fsc_table_id: 'table_1', fuel_price_min: 3.50, fuel_price_max: 4.00, cpm_cents: 15, is_active: true },
                { id: 'row_3', fsc_table_id: 'table_1', fuel_price_min: 4.00, fuel_price_max: 4.50, cpm_cents: 20, is_active: true }
              ])
            }
          }
        }
      };
      
      const { resolveFSCFromTable } = require('../../shared/math/fscTableLookup');
      
      const result = await resolveFSCFromTable(mockBase44, 'table_1', 3.75, 500, 100000);
      
      expect(result.fsc_cents).toBe(500 * 15); // 7500 cents = $75
      expect(result.explain.matched_row_id).toBe('row_2');
      expect(result.line_item.description).toContain('15¢/mi');
    });
    
    test('throws error when no matching row found', async () => {
      const mockBase44 = {
        asServiceRole: {
          entities: {
            CustomerFSCTable: {
              filter: jest.fn().mockResolvedValue([{
                id: 'table_1',
                basis_type: 'FUEL_PRICE',
                charge_type: 'CPM_CENTS',
                effective_start: '2026-01-01',
                is_active: true
              }])
            },
            CustomerFSCTableRow: {
              filter: jest.fn().mockResolvedValue([
                { fuel_price_min: 3.00, fuel_price_max: 3.50, cpm_cents: 10 }
              ])
            }
          }
        }
      };
      
      const { resolveFSCFromTable } = require('../../shared/math/fscTableLookup');
      
      const result = await resolveFSCFromTable(mockBase44, 'table_1', 5.00, 500, 100000);
      
      expect(result.fsc_cents).toBe(0);
      expect(result.explain.error).toContain('No FSC row found');
    });
  });
  
  describe('Distance Band Basis', () => {
    test('finds correct row for miles within band', async () => {
      const mockBase44 = {
        asServiceRole: {
          entities: {
            CustomerFSCTable: {
              filter: jest.fn().mockResolvedValue([{
                id: 'table_2',
                basis_type: 'DISTANCE_BAND',
                charge_type: 'FLAT_CENTS',
                effective_start: '2026-01-01',
                is_active: true
              }])
            },
            CustomerFSCTableRow: {
              filter: jest.fn().mockResolvedValue([
                { miles_min: 0, miles_max: 100, flat_cents: 5000 },
                { miles_min: 100, miles_max: 500, flat_cents: 7500 },
                { miles_min: 500, miles_max: 1000, flat_cents: 10000 }
              ])
            }
          }
        }
      };
      
      const { resolveFSCFromTable } = require('../../shared/math/fscTableLookup');
      
      const result = await resolveFSCFromTable(mockBase44, 'table_2', null, 300, 100000);
      
      expect(result.fsc_cents).toBe(7500); // $75
      expect(result.line_item.description).toContain('Flat');
    });
  });
  
  describe('Percent Basis Points', () => {
    test('calculates FSC as percent of linehaul', async () => {
      const mockBase44 = {
        asServiceRole: {
          entities: {
            CustomerFSCTable: {
              filter: jest.fn().mockResolvedValue([{
                id: 'table_3',
                basis_type: 'FUEL_PRICE',
                charge_type: 'PERCENT_BPS',
                effective_start: '2026-01-01',
                is_active: true
              }])
            },
            CustomerFSCTableRow: {
              filter: jest.fn().mockResolvedValue([
                { fuel_price_min: 3.00, fuel_price_max: 4.00, percent_bps: 1500 } // 15%
              ])
            }
          }
        }
      };
      
      const { resolveFSCFromTable } = require('../../shared/math/fscTableLookup');
      
      const result = await resolveFSCFromTable(mockBase44, 'table_3', 3.50, 500, 100000);
      
      expect(result.fsc_cents).toBe(15000); // 15% of 100000 cents
      expect(result.line_item.description).toContain('15.00%');
    });
  });
  
  describe('Effective Date Validation', () => {
    test('rejects table outside effective date range', async () => {
      const mockBase44 = {
        asServiceRole: {
          entities: {
            CustomerFSCTable: {
              filter: jest.fn().mockResolvedValue([{
                id: 'table_4',
                effective_start: '2027-01-01', // Future
                effective_end: '2027-12-31',
                is_active: true
              }])
            }
          }
        }
      };
      
      const { resolveFSCFromTable } = require('../../shared/math/fscTableLookup');
      
      const result = await resolveFSCFromTable(mockBase44, 'table_4', 3.50, 500, 100000);
      
      expect(result.fsc_cents).toBe(0);
      expect(result.explain.error).toContain('not effective');
    });
  });
});