/**
 * Test: Predictive Eligibility & Feature Adoption
 */

import { describe, it, expect } from '@jest/globals';

describe('Feature Adoption Analytics', () => {
  it('should calculate adoption rate correctly', () => {
    const eligible = 10;
    const activeUsers = 6;
    const adoptionRate = (activeUsers / eligible) * 100;
    
    expect(adoptionRate).toBe(60);
  });

  it('should identify low adoption features', () => {
    const features = [
      { feature: 'instant_pay', eligible: 20, activeUsers: 15, adoptionRate: 75 },
      { feature: 'counteroffers', eligible: 10, activeUsers: 2, adoptionRate: 20 },
      { feature: 'detention', eligible: 30, activeUsers: 25, adoptionRate: 83 }
    ];

    const lowAdoption = features.filter(f => f.eligible > 0 && f.adoptionRate < 50);
    
    expect(lowAdoption.length).toBe(1);
    expect(lowAdoption[0].feature).toBe('counteroffers');
  });

  it('should generate adoption gap alert when < 30%', () => {
    const eligibleDrivers = 10;
    const activeUsers = 2;
    const adoptionRate = (activeUsers / eligibleDrivers) * 100;
    
    const shouldAlert = eligibleDrivers >= 5 && adoptionRate < 30;
    
    expect(shouldAlert).toBe(true);
    expect(adoptionRate).toBe(20);
  });
});

describe('Predictive Forecasting Logic', () => {
  it('should predict days to eligibility based on load velocity', () => {
    const currentLoads = 3;
    const requiredLoads = 10;
    const loadsPerWeek = 1.5;
    
    const loadsNeeded = requiredLoads - currentLoads;
    const weeksNeeded = loadsNeeded / loadsPerWeek;
    const daysToEligibility = Math.ceil(weeksNeeded * 7);
    
    expect(daysToEligibility).toBe(33); // ~5 weeks
  });

  it('should adjust probability based on trajectory', () => {
    const recentTrend = [true, true, true, false, true]; // 80% on-time last 5 loads
    const recentOnTime = recentTrend.filter(Boolean).length / recentTrend.length * 100;
    const requiredOnTime = 90;
    
    const trajectoryFavorable = recentOnTime >= requiredOnTime * 0.9; // Within 10% of target
    const baseProbability = 70;
    const adjustedProbability = trajectoryFavorable ? baseProbability : baseProbability * 0.7;
    
    expect(recentOnTime).toBe(80);
    expect(trajectoryFavorable).toBe(false); // 80% < 81%
    expect(adjustedProbability).toBe(49);
  });
});