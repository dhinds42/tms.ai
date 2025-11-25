/**
 * Unit Tests for Consent-Based Analytics
 * 
 * Tests that analytics events are NOT sent when consent is absent or revoked.
 * Tests that analytics events ARE sent when consent is granted.
 */

import { ConsentRepository, canSendAnalytics, canSendMarketing, canTrackLocation } from '../ConsentManager';

// Mock the base44 client
jest.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      UserConsent: {
        filter: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      }
    }
  }
}));

import { base44 } from '@/api/base44Client';

// Mock analytics service
const mockAnalyticsService = {
  events: [],
  track: function(eventName, data) {
    this.events.push({ eventName, data, timestamp: new Date() });
  },
  reset: function() {
    this.events = [];
  }
};

// Analytics wrapper that checks consent
async function trackAnalyticsEvent(entityType, entityId, eventName, data) {
  const hasConsent = await canSendAnalytics(entityType, entityId);
  
  if (!hasConsent) {
    console.log(`[Analytics] Event blocked - no consent: ${eventName}`);
    return { sent: false, reason: 'no_consent' };
  }
  
  mockAnalyticsService.track(eventName, { ...data, entityType, entityId });
  return { sent: true };
}

// Marketing wrapper that checks consent
async function sendMarketingEmail(entityType, entityId, emailData) {
  const hasConsent = await canSendMarketing(entityType, entityId);
  
  if (!hasConsent) {
    console.log(`[Marketing] Email blocked - no consent`);
    return { sent: false, reason: 'no_consent' };
  }
  
  // Mock email send
  return { sent: true, emailId: `email_${Date.now()}` };
}

// Location tracking wrapper
async function recordLocationUpdate(entityType, entityId, locationData) {
  const hasConsent = await canTrackLocation(entityType, entityId);
  
  if (!hasConsent) {
    console.log(`[Location] Tracking blocked - no consent`);
    return { recorded: false, reason: 'no_consent' };
  }
  
  return { recorded: true, location: locationData };
}

describe('Consent-Based Analytics', () => {
  
  beforeEach(() => {
    mockAnalyticsService.reset();
    jest.clearAllMocks();
  });

  // ==========================================
  // Analytics Consent Tests
  // ==========================================

  describe('Analytics Events', () => {
    
    test('should NOT send analytics when consent is absent', async () => {
      // Mock: No consent records exist
      base44.entities.UserConsent.filter.mockResolvedValue([]);

      const result = await trackAnalyticsEvent(
        'driver',
        'driver_123',
        'load_completed',
        { loadId: 'load_456' }
      );

      expect(result.sent).toBe(false);
      expect(result.reason).toBe('no_consent');
      expect(mockAnalyticsService.events).toHaveLength(0);
    });

    test('should NOT send analytics when consent is revoked', async () => {
      // Mock: Consent exists but is revoked
      base44.entities.UserConsent.filter.mockResolvedValue([{
        id: 'consent_1',
        entity_type: 'driver',
        entity_id: 'driver_123',
        purpose: 'analytics',
        status: 'revoked',
        revoked_at: '2025-11-20T10:00:00Z'
      }]);

      const result = await trackAnalyticsEvent(
        'driver',
        'driver_123',
        'app_opened',
        { screen: 'dashboard' }
      );

      expect(result.sent).toBe(false);
      expect(result.reason).toBe('no_consent');
      expect(mockAnalyticsService.events).toHaveLength(0);
    });

    test('should NOT send analytics when consent is denied', async () => {
      // Mock: Consent was explicitly denied
      base44.entities.UserConsent.filter.mockResolvedValue([{
        id: 'consent_1',
        entity_type: 'driver',
        entity_id: 'driver_123',
        purpose: 'analytics',
        status: 'denied'
      }]);

      const result = await trackAnalyticsEvent(
        'driver',
        'driver_123',
        'feature_used',
        { feature: 'route_optimizer' }
      );

      expect(result.sent).toBe(false);
      expect(result.reason).toBe('no_consent');
      expect(mockAnalyticsService.events).toHaveLength(0);
    });

    test('should NOT send analytics when consent is expired', async () => {
      // Mock: Consent has expired
      base44.entities.UserConsent.filter.mockResolvedValue([{
        id: 'consent_1',
        entity_type: 'driver',
        entity_id: 'driver_123',
        purpose: 'analytics',
        status: 'expired',
        expires_at: '2025-01-01T00:00:00Z'
      }]);

      const result = await trackAnalyticsEvent(
        'driver',
        'driver_123',
        'session_start',
        {}
      );

      expect(result.sent).toBe(false);
      expect(result.reason).toBe('no_consent');
    });

    test('should send analytics when consent is granted', async () => {
      // Mock: Consent is granted
      base44.entities.UserConsent.filter.mockResolvedValue([{
        id: 'consent_1',
        entity_type: 'driver',
        entity_id: 'driver_123',
        purpose: 'analytics',
        status: 'granted',
        granted_at: '2025-11-01T10:00:00Z'
      }]);

      const result = await trackAnalyticsEvent(
        'driver',
        'driver_123',
        'load_completed',
        { loadId: 'load_456', duration: 120 }
      );

      expect(result.sent).toBe(true);
      expect(mockAnalyticsService.events).toHaveLength(1);
      expect(mockAnalyticsService.events[0].eventName).toBe('load_completed');
      expect(mockAnalyticsService.events[0].data.loadId).toBe('load_456');
    });

    test('should send multiple analytics events when consent is granted', async () => {
      base44.entities.UserConsent.filter.mockResolvedValue([{
        id: 'consent_1',
        entity_type: 'driver',
        entity_id: 'driver_123',
        purpose: 'analytics',
        status: 'granted'
      }]);

      await trackAnalyticsEvent('driver', 'driver_123', 'event_1', {});
      await trackAnalyticsEvent('driver', 'driver_123', 'event_2', {});
      await trackAnalyticsEvent('driver', 'driver_123', 'event_3', {});

      expect(mockAnalyticsService.events).toHaveLength(3);
    });
  });

  // ==========================================
  // Marketing Consent Tests
  // ==========================================

  describe('Marketing Communications', () => {
    
    test('should NOT send marketing email when consent is absent', async () => {
      base44.entities.UserConsent.filter.mockResolvedValue([]);

      const result = await sendMarketingEmail(
        'driver',
        'driver_123',
        { subject: 'New Feature!', body: 'Check out...' }
      );

      expect(result.sent).toBe(false);
      expect(result.reason).toBe('no_consent');
    });

    test('should NOT send marketing email when consent is revoked', async () => {
      base44.entities.UserConsent.filter.mockResolvedValue([{
        purpose: 'marketing',
        status: 'revoked'
      }]);

      const result = await sendMarketingEmail(
        'driver',
        'driver_123',
        { subject: 'Special Offer', body: 'Limited time...' }
      );

      expect(result.sent).toBe(false);
      expect(result.reason).toBe('no_consent');
    });

    test('should send marketing email when consent is granted', async () => {
      base44.entities.UserConsent.filter.mockResolvedValue([{
        purpose: 'marketing',
        status: 'granted'
      }]);

      const result = await sendMarketingEmail(
        'driver',
        'driver_123',
        { subject: 'Newsletter', body: 'This week...' }
      );

      expect(result.sent).toBe(true);
      expect(result.emailId).toBeDefined();
    });
  });

  // ==========================================
  // Location Tracking Consent Tests
  // ==========================================

  describe('Location Tracking', () => {
    
    test('should NOT record location when consent is absent', async () => {
      base44.entities.UserConsent.filter.mockResolvedValue([]);

      const result = await recordLocationUpdate(
        'driver',
        'driver_123',
        { lat: 41.8781, lng: -87.6298 }
      );

      expect(result.recorded).toBe(false);
      expect(result.reason).toBe('no_consent');
    });

    test('should NOT record location when consent is revoked', async () => {
      base44.entities.UserConsent.filter.mockResolvedValue([{
        purpose: 'location_tracking',
        status: 'revoked'
      }]);

      const result = await recordLocationUpdate(
        'driver',
        'driver_123',
        { lat: 34.0522, lng: -118.2437 }
      );

      expect(result.recorded).toBe(false);
    });

    test('should record location when consent is granted', async () => {
      base44.entities.UserConsent.filter.mockResolvedValue([{
        purpose: 'location_tracking',
        status: 'granted'
      }]);

      const result = await recordLocationUpdate(
        'driver',
        'driver_123',
        { lat: 40.7128, lng: -74.0060 }
      );

      expect(result.recorded).toBe(true);
      expect(result.location.lat).toBe(40.7128);
    });
  });

  // ==========================================
  // Consent State Transitions Tests
  // ==========================================

  describe('Consent State Transitions', () => {
    
    test('should block analytics after consent is revoked', async () => {
      // First: Consent granted
      base44.entities.UserConsent.filter.mockResolvedValueOnce([{
        purpose: 'analytics',
        status: 'granted'
      }]);

      const result1 = await trackAnalyticsEvent('driver', 'driver_123', 'event_1', {});
      expect(result1.sent).toBe(true);

      // Then: Consent revoked
      base44.entities.UserConsent.filter.mockResolvedValueOnce([{
        purpose: 'analytics',
        status: 'revoked'
      }]);

      const result2 = await trackAnalyticsEvent('driver', 'driver_123', 'event_2', {});
      expect(result2.sent).toBe(false);
    });

    test('should allow analytics after consent is re-granted', async () => {
      // Consent revoked
      base44.entities.UserConsent.filter.mockResolvedValueOnce([{
        purpose: 'analytics',
        status: 'revoked'
      }]);

      const result1 = await trackAnalyticsEvent('driver', 'driver_123', 'event_1', {});
      expect(result1.sent).toBe(false);

      // Consent re-granted
      base44.entities.UserConsent.filter.mockResolvedValueOnce([{
        purpose: 'analytics',
        status: 'granted'
      }]);

      const result2 = await trackAnalyticsEvent('driver', 'driver_123', 'event_2', {});
      expect(result2.sent).toBe(true);
    });
  });

  // ==========================================
  // Multiple Entity Types Tests
  // ==========================================

  describe('Multiple Entity Types', () => {
    
    test('should check consent for correct entity type', async () => {
      // Driver has consent
      base44.entities.UserConsent.filter.mockImplementation((query) => {
        if (query.entity_type === 'driver' && query.entity_id === 'driver_123') {
          return Promise.resolve([{ purpose: 'analytics', status: 'granted' }]);
        }
        return Promise.resolve([]);
      });

      const driverResult = await trackAnalyticsEvent('driver', 'driver_123', 'event', {});
      expect(driverResult.sent).toBe(true);

      // Carrier does NOT have consent
      const carrierResult = await trackAnalyticsEvent('carrier', 'carrier_456', 'event', {});
      expect(carrierResult.sent).toBe(false);
    });
  });

  // ==========================================
  // ConsentRepository Method Tests
  // ==========================================

  describe('ConsentRepository.hasConsent', () => {
    
    test('should return false when no consent exists', async () => {
      base44.entities.UserConsent.filter.mockResolvedValue([]);
      
      const result = await ConsentRepository.hasConsent('driver', 'driver_123', 'analytics');
      expect(result).toBe(false);
    });

    test('should return false when consent status is not granted', async () => {
      base44.entities.UserConsent.filter.mockResolvedValue([{
        purpose: 'analytics',
        status: 'pending'
      }]);
      
      const result = await ConsentRepository.hasConsent('driver', 'driver_123', 'analytics');
      expect(result).toBe(false);
    });

    test('should return true when consent is granted', async () => {
      base44.entities.UserConsent.filter.mockResolvedValue([{
        purpose: 'analytics',
        status: 'granted'
      }]);
      
      const result = await ConsentRepository.hasConsent('driver', 'driver_123', 'analytics');
      expect(result).toBe(true);
    });
  });

  describe('ConsentRepository.hasMandatoryConsents', () => {
    
    test('should return false when mandatory consents are missing', async () => {
      base44.entities.UserConsent.filter.mockResolvedValue([
        { purpose: 'location_tracking', status: 'granted' }
        // Missing: eld_integration, background_check, communication_email
      ]);
      
      const result = await ConsentRepository.hasMandatoryConsents('driver', 'driver_123');
      expect(result).toBe(false);
    });

    test('should return true when all mandatory consents are granted', async () => {
      base44.entities.UserConsent.filter.mockResolvedValue([
        { purpose: 'location_tracking', status: 'granted' },
        { purpose: 'eld_integration', status: 'granted' },
        { purpose: 'background_check', status: 'granted' },
        { purpose: 'communication_email', status: 'granted' }
      ]);
      
      const result = await ConsentRepository.hasMandatoryConsents('driver', 'driver_123');
      expect(result).toBe(true);
    });
  });
});