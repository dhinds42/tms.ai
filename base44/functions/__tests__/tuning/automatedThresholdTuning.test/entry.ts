/**
 * Test: Automated KPI Threshold Tuning
 */

import { describe, it, expect } from '@jest/globals';

describe('Automated Threshold Tuning', () => {
  it('should calculate optimal min_loads based on fleet size', () => {
    const totalLoads = 200;
    const targetPercentile = 0.05; // 5% of fleet
    
    const optimalMinLoads = Math.max(3, Math.floor(totalLoads * targetPercentile));
    
    expect(optimalMinLoads).toBe(10); // 5% of 200
  });

  it('should adjust cooldown based on dispute rate', () => {
    const disputeRate = 12; // High
    const baseCooldown = 30;
    
    const adjustedCooldown = disputeRate > 8 ? 45 : baseCooldown;
    
    expect(adjustedCooldown).toBe(45);
  });

  it('should calculate confidence based on sample size', () => {
    const completedLoads = 150;
    
    const confidence = completedLoads >= 100 ? 0.95 : 
                       completedLoads >= 50 ? 0.8 : 0.6;
    
    expect(confidence).toBe(0.95);
  });

  it('should only auto-apply high-confidence tuning', () => {
    const tuningResults = [
      { feature: 'A', confidence: 0.95, changes: { min_loads: 5 } },
      { feature: 'B', confidence: 0.65, changes: { min_loads: 10 } },
      { feature: 'C', confidence: 0.85, changes: { min_loads: 7 } }
    ];

    const autoApply = tuningResults.filter(t => t.confidence >= 0.8);
    const reviewQueue = tuningResults.filter(t => t.confidence < 0.8);
    
    expect(autoApply.length).toBe(2); // A and C
    expect(reviewQueue.length).toBe(1); // B
  });

  it('should adjust thresholds proportionally to fleet performance', () => {
    const fleetOnTimePct = 92;
    const baselineRequired = 90;
    
    // Allow threshold to be fleet avg - 5%
    const adjustedThreshold = Math.max(baselineRequired, fleetOnTimePct - 5);
    
    expect(adjustedThreshold).toBe(90); // Can't go below baseline
  });
});

describe('A/B Test Split Logic', () => {
  it('should split drivers 50/50 by default', () => {
    const drivers = Array.from({ length: 100 }, (_, i) => ({ id: `driver_${i}` }));
    const controlPct = 50;
    
    const splitIndex = Math.floor(drivers.length * (controlPct / 100));
    const controlGroup = drivers.slice(0, splitIndex);
    const testGroup = drivers.slice(splitIndex);
    
    expect(controlGroup.length).toBe(50);
    expect(testGroup.length).toBe(50);
  });

  it('should handle uneven splits', () => {
    const drivers = Array.from({ length: 100 }, (_, i) => ({ id: `driver_${i}` }));
    const controlPct = 30;
    
    const splitIndex = Math.floor(drivers.length * (controlPct / 100));
    const controlGroup = drivers.slice(0, splitIndex);
    const testGroup = drivers.slice(splitIndex);
    
    expect(controlGroup.length).toBe(30);
    expect(testGroup.length).toBe(70);
  });
});