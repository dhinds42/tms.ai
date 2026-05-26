/**
 * Claims & Penalties Tests
 */

import { calcLatePenalty, calcOTDBonus, calcClaimExposure } from '../../shared/math/claims';
import { dollarsToCents } from '../../shared/math/money';

describe('Claims Calculations', () => {
  
  test('calculates late penalty', () => {
    const penalty = calcLatePenalty(dollarsToCents(1000), 10); // 10% penalty
    expect(penalty).toBe(10000); // $100
  });
  
  test('applies max penalty cap', () => {
    const penalty = calcLatePenalty(
      dollarsToCents(10000), 
      10, 
      dollarsToCents(500)
    );
    expect(penalty).toBe(50000); // Capped at $500
  });
  
  test('calculates OTD bonus', () => {
    const bonus = calcOTDBonus(dollarsToCents(1000), 5); // 5% bonus
    expect(bonus).toBe(5000); // $50
  });
  
  test('calculates claim exposure', () => {
    const exposure = calcClaimExposure(dollarsToCents(50000), 100);
    expect(exposure).toBe(5000000); // Full cargo value
  });
});