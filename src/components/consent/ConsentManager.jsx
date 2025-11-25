/**
 * Consent Manager
 * Repository methods and utilities for managing user consent
 */

import { base44 } from '@/api/base44Client';

// Consent purposes with metadata
export const CONSENT_PURPOSES = {
  location_tracking: {
    id: 'location_tracking',
    label: 'Location Tracking',
    description: 'Allow real-time GPS tracking of your location while on duty',
    mandatory: true,
    jurisdiction: ['usa', 'california', 'eu_gdpr', 'canada']
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics & Performance',
    description: 'Allow collection of performance data to improve our services',
    mandatory: false,
    jurisdiction: ['usa', 'california', 'eu_gdpr', 'canada']
  },
  marketing: {
    id: 'marketing',
    label: 'Marketing Communications',
    description: 'Receive promotional offers and updates about new features',
    mandatory: false,
    jurisdiction: ['usa', 'california', 'eu_gdpr', 'canada']
  },
  data_sharing: {
    id: 'data_sharing',
    label: 'Data Sharing with Partners',
    description: 'Share data with trusted partners for load matching and services',
    mandatory: false,
    jurisdiction: ['usa', 'california', 'eu_gdpr', 'canada']
  },
  eld_integration: {
    id: 'eld_integration',
    label: 'ELD Data Integration',
    description: 'Connect and sync your ELD device data for HOS compliance',
    mandatory: true,
    jurisdiction: ['usa', 'canada']
  },
  background_check: {
    id: 'background_check',
    label: 'Background Check Authorization',
    description: 'Authorize background check as required by FMCSA regulations',
    mandatory: true,
    jurisdiction: ['usa']
  },
  communication_sms: {
    id: 'communication_sms',
    label: 'SMS Notifications',
    description: 'Receive load updates and alerts via SMS',
    mandatory: false,
    jurisdiction: ['usa', 'canada']
  },
  communication_email: {
    id: 'communication_email',
    label: 'Email Notifications',
    description: 'Receive updates and documents via email',
    mandatory: true,
    jurisdiction: ['usa', 'california', 'eu_gdpr', 'canada']
  }
};

// Driver-specific mandatory consents
export const DRIVER_MANDATORY_CONSENTS = [
  'location_tracking',
  'eld_integration',
  'background_check',
  'communication_email'
];

// Consent text templates by purpose
export const CONSENT_TEXTS = {
  location_tracking: `I consent to the collection and processing of my real-time location data while I am on duty. This data will be used for dispatch optimization, safety monitoring, and compliance with FMCSA regulations. I understand I can revoke this consent at any time, though it may affect my ability to receive load assignments.`,
  
  analytics: `I consent to the collection of anonymized performance and usage data to help improve TMS.ai services. This includes trip completion times, app usage patterns, and service quality metrics. This data is aggregated and does not personally identify me.`,
  
  marketing: `I consent to receive marketing communications including promotional offers, new feature announcements, and industry news. I can unsubscribe at any time by clicking the unsubscribe link in any email or updating my preferences.`,
  
  eld_integration: `I consent to the integration of my Electronic Logging Device (ELD) data with TMS.ai. This includes Hours of Service logs, duty status, and vehicle location data as required by FMCSA regulations (49 CFR Part 395).`,
  
  background_check: `I authorize TMS.ai and its designated consumer reporting agency to obtain my driving record, criminal background check, and employment verification as required by FMCSA regulations (49 CFR Part 391). I understand this is a requirement for employment.`
};

/**
 * Consent Repository Methods
 */
export const ConsentRepository = {
  /**
   * Get all consents for an entity
   */
  async getConsents(entityType, entityId) {
    return base44.entities.UserConsent.filter(
      { entity_type: entityType, entity_id: entityId, is_active: true },
      '-created_date'
    );
  },

  /**
   * Get consent by purpose
   */
  async getConsentByPurpose(entityType, entityId, purpose) {
    const consents = await base44.entities.UserConsent.filter(
      { entity_type: entityType, entity_id: entityId, purpose, is_active: true }
    );
    return consents[0] || null;
  },

  /**
   * Check if consent is granted for a purpose
   */
  async hasConsent(entityType, entityId, purpose) {
    const consent = await this.getConsentByPurpose(entityType, entityId, purpose);
    return consent?.status === 'granted';
  },

  /**
   * Check if all mandatory consents are granted
   */
  async hasMandatoryConsents(entityType, entityId, mandatoryPurposes = DRIVER_MANDATORY_CONSENTS) {
    const consents = await this.getConsents(entityType, entityId);
    const grantedPurposes = consents
      .filter(c => c.status === 'granted')
      .map(c => c.purpose);
    
    return mandatoryPurposes.every(p => grantedPurposes.includes(p));
  },

  /**
   * Grant consent
   */
  async grantConsent(entityType, entityId, purpose, options = {}) {
    const existing = await this.getConsentByPurpose(entityType, entityId, purpose);
    const purposeConfig = CONSENT_PURPOSES[purpose];
    
    const consentData = {
      entity_type: entityType,
      entity_id: entityId,
      purpose,
      status: 'granted',
      is_mandatory: purposeConfig?.mandatory || false,
      consent_version: options.version || '1.0',
      consent_text: CONSENT_TEXTS[purpose] || options.consentText,
      granted_at: new Date().toISOString(),
      jurisdiction: options.jurisdiction || 'usa',
      ip_address: options.ipAddress,
      user_agent: options.userAgent,
      collection_method: options.collectionMethod || 'web_form',
      audit_trail: [{
        action: 'granted',
        timestamp: new Date().toISOString(),
        previous_status: existing?.status || null,
        new_status: 'granted'
      }]
    };

    if (existing) {
      return base44.entities.UserConsent.update(existing.id, {
        ...consentData,
        audit_trail: [...(existing.audit_trail || []), ...consentData.audit_trail]
      });
    }
    
    return base44.entities.UserConsent.create(consentData);
  },

  /**
   * Revoke consent
   */
  async revokeConsent(entityType, entityId, purpose, reason = '') {
    const existing = await this.getConsentByPurpose(entityType, entityId, purpose);
    
    if (!existing) return null;

    return base44.entities.UserConsent.update(existing.id, {
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      audit_trail: [
        ...(existing.audit_trail || []),
        {
          action: 'revoked',
          timestamp: new Date().toISOString(),
          previous_status: existing.status,
          new_status: 'revoked',
          reason
        }
      ]
    });
  },

  /**
   * Bulk grant consents
   */
  async bulkGrantConsents(entityType, entityId, purposes, options = {}) {
    const results = await Promise.all(
      purposes.map(purpose => this.grantConsent(entityType, entityId, purpose, options))
    );
    return results;
  },

  /**
   * Get consent status summary
   */
  async getConsentSummary(entityType, entityId) {
    const consents = await this.getConsents(entityType, entityId);
    
    return {
      total: consents.length,
      granted: consents.filter(c => c.status === 'granted').length,
      denied: consents.filter(c => c.status === 'denied').length,
      revoked: consents.filter(c => c.status === 'revoked').length,
      pending: consents.filter(c => c.status === 'pending').length,
      mandatoryComplete: await this.hasMandatoryConsents(entityType, entityId),
      consents: consents.reduce((acc, c) => {
        acc[c.purpose] = c.status;
        return acc;
      }, {})
    };
  }
};

/**
 * Analytics consent check utility
 */
export async function canSendAnalytics(entityType, entityId) {
  return ConsentRepository.hasConsent(entityType, entityId, 'analytics');
}

/**
 * Marketing consent check utility
 */
export async function canSendMarketing(entityType, entityId) {
  return ConsentRepository.hasConsent(entityType, entityId, 'marketing');
}

/**
 * Location tracking consent check utility
 */
export async function canTrackLocation(entityType, entityId) {
  return ConsentRepository.hasConsent(entityType, entityId, 'location_tracking');
}

export default ConsentRepository;