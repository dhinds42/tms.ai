/**
 * Fuel Surcharge Tests
 */

import { calcFSC, calcFSCFromIndex, getEffectiveFSC } from '../../shared/math/fsc';

describe('Fuel Surcharge Calculations', () => {
  
  const fscSchedule = [
    { minPrice: 3.00, maxPrice: 3.50, centsPerMile: 35 },
    { minPrice: 3.50, maxPrice: 4.00, centsPerMile: 40 },
    { minPrice: 4.00, maxPrice: 4.50, centsPerMile: 45 }
  ];
  
  test('calculates FSC from DOE price', () => {
    const fsc = calcFSC(100, 3.75, fscSchedule); // 100 miles @ $3.75/gal
    // Falls in 3.50-4.00 bracket = 40 cents/mile
    // 100 * 0.40 = $40
    expect(fsc).toBe(4000);
  });
  
  test('returns 0 if price not in any bracket', () => {
    const fsc = calcFSC(100, 5.00, fscSchedule);
    expect(fsc).toBe(0);
  });
  
  test('calculates FSC from index ratio', () => {
    const baseFSC = 3000; // $30
    const fsc = calcFSCFromIndex(100, 100, 120, baseFSC); // 20% increase
    expect(fsc).toBe(3600); // $36
  });
  
  test('gets effective FSC for date', () => {
    const indices = [
      { effectiveDate: new Date('2025-01-01'), doePrice: 3.50 },
      { effectiveDate: new Date('2025-01-15'), doePrice: 3.75 },
      { effectiveDate: new Date('2025-02-01'), doePrice: 4.00 }
    ];
    
    const effective = getEffectiveFSC(new Date('2025-01-20'), indices);
    expect(effective?.doePrice).toBe(3.75); // Most recent before 1/20
  });
});