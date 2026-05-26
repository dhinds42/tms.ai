/**
 * Compliance Timing Tests
 */

import { 
  daysUntil, 
  isExpiring, 
  isExpired,
  calcComplianceRiskScore,
  getComplianceActionLevel
} from '../../shared/math/compliance';

describe('Compliance Timing', () => {
  
  test('calculates days until future date', () => {
    const from = new Date('2025-01-01');
    const to = new Date('2025-01-31');
    const days = daysUntil(to, from);
    expect(days).toBe(30);
  });
  
  test('detects expiring documents', () => {
    const expiryDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000); // 20 days
    expect(isExpiring(expiryDate, 30)).toBe(true);
    expect(isExpiring(expiryDate, 10)).toBe(false);
  });
  
  test('detects expired documents', () => {
    const pastDate = new Date('2024-01-01');
    expect(isExpired(pastDate)).toBe(true);
    
    const futureDate = new Date('2026-01-01');
    expect(isExpired(futureDate)).toBe(false);
  });
  
  test('calculates compliance risk score', () => {
    const expired = new Date(Date.now() - 1000);
    expect(calcComplianceRiskScore(expired)).toBe(100);
    
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    expect(calcComplianceRiskScore(in7Days)).toBe(90);
    
    const in100Days = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);
    expect(calcComplianceRiskScore(in100Days)).toBe(0);
  });
  
  test('determines compliance action level', () => {
    expect(getComplianceActionLevel(-5).level).toBe('block');
    expect(getComplianceActionLevel(25).level).toBe('suspend');
    expect(getComplianceActionLevel(50).level).toBe('escalate');
    expect(getComplianceActionLevel(85).level).toBe('alert');
    expect(getComplianceActionLevel(120).level).toBe('ok');
  });
});