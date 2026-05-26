/**
 * Accessorial Calculations Tests
 */

import { 
  calcDetention, 
  isDetentionEligible,
  calcLayover,
  calcTONU,
  validateLumper,
  detectDuplicateAccessorial
} from '../../shared/math/accessorials';
import { dollarsToCents } from '../../shared/math/money';

describe('Accessorial Calculations', () => {
  
  describe('Detention', () => {
    test('calculates detention within free time', () => {
      const charge = calcDetention({
        arrivalTime: new Date('2025-01-01T10:00:00'),
        departureTime: new Date('2025-01-01T11:00:00'), // 60 minutes
        freeTimeMinutes: 120,
        ratePerHour: dollarsToCents(75),
        incrementMinutes: 15
      });
      
      expect(charge).toBe(0); // Within 2 hour free time
    });
    
    test('calculates detention after free time', () => {
      const charge = calcDetention({
        arrivalTime: new Date('2025-01-01T10:00:00'),
        departureTime: new Date('2025-01-01T13:00:00'), // 180 minutes
        freeTimeMinutes: 120, // 2 hours free
        ratePerHour: dollarsToCents(75), // $75/hour
        incrementMinutes: 15
      });
      
      // 180 - 120 = 60 minutes chargeable
      // 60 / 15 = 4 increments
      // $75/hour = $18.75 per 15min increment
      // 4 * $18.75 = $75
      expect(charge).toBe(7500); // $75 in cents
    });
    
    test('checks detention eligibility', () => {
      const eligible = isDetentionEligible({
        actual_pickup_datetime: '2025-01-01T10:00:00',
        actual_delivery_datetime: '2025-01-01T13:00:00',
        status: 'delivered'
      });
      
      expect(eligible).toBe(true);
      
      const notEligible = isDetentionEligible({
        status: 'cancelled'
      });
      
      expect(notEligible).toBe(false);
    });
  });
  
  describe('TONU', () => {
    test('calculates TONU as 50% of base rate', () => {
      const charge = calcTONU(dollarsToCents(1000), 0.50);
      expect(charge).toBe(50000); // $500
    });
  });
  
  describe('Lumper', () => {
    test('validates lumper with receipt', () => {
      const result = validateLumper(
        dollarsToCents(200),
        'https://receipt.url'
      );
      
      expect(result.valid).toBe(true);
    });
    
    test('rejects lumper without receipt', () => {
      const result = validateLumper(
        dollarsToCents(200),
        null
      );
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('receipt required');
    });
    
    test('rejects lumper over limit', () => {
      const result = validateLumper(
        dollarsToCents(600),
        'https://receipt.url'
      );
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds $500 limit');
    });
  });
  
  describe('Duplicate Detection', () => {
    test('detects duplicate accessorial', () => {
      const existing = [
        { type: 'detention', load_id: 'load_1' },
        { type: 'lumper', load_id: 'load_1' }
      ];
      
      const isDupe = detectDuplicateAccessorial(existing, {
        type: 'detention',
        load_id: 'load_1'
      });
      
      expect(isDupe).toBe(true);
    });
    
    test('allows different accessorial types', () => {
      const existing = [
        { type: 'detention', load_id: 'load_1' }
      ];
      
      const isDupe = detectDuplicateAccessorial(existing, {
        type: 'lumper',
        load_id: 'load_1'
      });
      
      expect(isDupe).toBe(false);
    });
  });
});