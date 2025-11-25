/**
 * ELD Provider Client
 * 
 * Service for integrating with ELD/Telematics providers (KeepTruckin, Samsara, Omnitracs, etc.)
 * Provides authentication, HOS data fetching, and GPS position retrieval with retry logic.
 * 
 * NOTE: This is a client-side stub. Full implementation requires Backend Functions to be enabled
 * for secure API key storage and server-side HTTP requests.
 */

// Supported ELD Providers
export const ELD_PROVIDERS = {
  KEEPTRUCKIN: 'keeptruckin',
  SAMSARA: 'samsara',
  OMNITRACS: 'omnitracs',
  GEOTAB: 'geotab',
  PLATFORM_SCIENCE: 'platform_science',
  ISAAC: 'isaac',
  BIGROAD: 'bigroad'
};

// HOS Status Mapping (normalized across providers)
export const HOS_STATUS = {
  OFF_DUTY: 'off_duty',
  SLEEPER: 'sleeper',
  DRIVING: 'driving',
  ON_DUTY: 'on_duty',
  YARD_MOVE: 'yard_move',
  PERSONAL_CONVEYANCE: 'personal_conveyance'
};

// Retry configuration
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2
};

/**
 * ELD Provider Client Class
 */
export class ELDProviderClient {
  constructor(provider, config = {}) {
    this.provider = provider;
    this.apiKey = config.apiKey || null;
    this.apiSecret = config.apiSecret || null;
    this.baseUrl = this.getBaseUrl(provider);
    this.accessToken = null;
    this.tokenExpiry = null;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config.retryConfig };
  }

  /**
   * Get base URL for provider
   */
  getBaseUrl(provider) {
    const urls = {
      [ELD_PROVIDERS.KEEPTRUCKIN]: 'https://api.keeptruckin.com/v1',
      [ELD_PROVIDERS.SAMSARA]: 'https://api.samsara.com/v1',
      [ELD_PROVIDERS.OMNITRACS]: 'https://api.omnitracs.com/v1',
      [ELD_PROVIDERS.GEOTAB]: 'https://my.geotab.com/apiv1',
      [ELD_PROVIDERS.PLATFORM_SCIENCE]: 'https://api.platformscience.com/v1',
      [ELD_PROVIDERS.ISAAC]: 'https://api.isaac.com/v1',
      [ELD_PROVIDERS.BIGROAD]: 'https://api.bigroad.com/v1'
    };
    return urls[provider] || '';
  }

  /**
   * Authenticate with ELD provider
   * @returns {Promise<{accessToken: string, expiresIn: number}>}
   */
  async authenticate() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return { accessToken: this.accessToken, expiresIn: this.tokenExpiry - Date.now() };
    }

    const authEndpoints = {
      [ELD_PROVIDERS.KEEPTRUCKIN]: '/oauth/token',
      [ELD_PROVIDERS.SAMSARA]: '/oauth/token',
      [ELD_PROVIDERS.OMNITRACS]: '/auth/token',
      [ELD_PROVIDERS.GEOTAB]: '/authenticate',
      [ELD_PROVIDERS.PLATFORM_SCIENCE]: '/auth/token',
      [ELD_PROVIDERS.ISAAC]: '/oauth/token',
      [ELD_PROVIDERS.BIGROAD]: '/auth/token'
    };

    const endpoint = authEndpoints[this.provider];
    
    // Simulated authentication response (requires backend for real implementation)
    const mockResponse = {
      accessToken: `mock_token_${this.provider}_${Date.now()}`,
      expiresIn: 3600,
      tokenType: 'Bearer'
    };

    this.accessToken = mockResponse.accessToken;
    this.tokenExpiry = Date.now() + (mockResponse.expiresIn * 1000);

    console.log(`[ELDClient] Authenticated with ${this.provider}`);
    return mockResponse;
  }

  /**
   * Fetch current HOS data for a driver
   * @param {string} driverId - External driver ID from ELD provider
   * @returns {Promise<NormalizedHOSData>}
   */
  async fetchCurrentHOS(driverId) {
    await this.ensureAuthenticated();

    return this.withRetry(async () => {
      const hosEndpoints = {
        [ELD_PROVIDERS.KEEPTRUCKIN]: `/users/${driverId}/hos_logs/current`,
        [ELD_PROVIDERS.SAMSARA]: `/fleet/drivers/${driverId}/hos_daily_logs`,
        [ELD_PROVIDERS.OMNITRACS]: `/drivers/${driverId}/hos`,
        [ELD_PROVIDERS.GEOTAB]: `/Get?typeName=DutyStatusLog&search={"deviceSearch":{"id":"${driverId}"}}`,
        [ELD_PROVIDERS.PLATFORM_SCIENCE]: `/drivers/${driverId}/hos/current`,
        [ELD_PROVIDERS.ISAAC]: `/drivers/${driverId}/hours`,
        [ELD_PROVIDERS.BIGROAD]: `/drivers/${driverId}/logs/current`
      };

      const endpoint = hosEndpoints[this.provider];

      // Simulated HOS response (requires backend for real implementation)
      const mockRawResponse = this.getMockHOSResponse(driverId);
      
      // Normalize response to standard format
      return this.normalizeHOSData(mockRawResponse);
    });
  }

  /**
   * Fetch latest GPS position for a vehicle/driver
   * @param {string} vehicleId - External vehicle ID from ELD provider
   * @returns {Promise<NormalizedGPSData>}
   */
  async fetchLatestGPS(vehicleId) {
    await this.ensureAuthenticated();

    return this.withRetry(async () => {
      const gpsEndpoints = {
        [ELD_PROVIDERS.KEEPTRUCKIN]: `/vehicles/${vehicleId}/locations/current`,
        [ELD_PROVIDERS.SAMSARA]: `/fleet/vehicles/${vehicleId}/locations`,
        [ELD_PROVIDERS.OMNITRACS]: `/vehicles/${vehicleId}/position`,
        [ELD_PROVIDERS.GEOTAB]: `/Get?typeName=DeviceStatusInfo&search={"deviceSearch":{"id":"${vehicleId}"}}`,
        [ELD_PROVIDERS.PLATFORM_SCIENCE]: `/vehicles/${vehicleId}/location`,
        [ELD_PROVIDERS.ISAAC]: `/vehicles/${vehicleId}/gps`,
        [ELD_PROVIDERS.BIGROAD]: `/vehicles/${vehicleId}/location`
      };

      const endpoint = gpsEndpoints[this.provider];

      // Simulated GPS response (requires backend for real implementation)
      const mockRawResponse = this.getMockGPSResponse(vehicleId);
      
      // Normalize response to standard format
      return this.normalizeGPSData(mockRawResponse);
    });
  }

  /**
   * Fetch HOS violations for a driver
   * @param {string} driverId - External driver ID
   * @param {Date} startDate - Start of date range
   * @param {Date} endDate - End of date range
   * @returns {Promise<NormalizedViolation[]>}
   */
  async fetchHOSViolations(driverId, startDate, endDate) {
    await this.ensureAuthenticated();

    return this.withRetry(async () => {
      // Simulated violations response
      const mockViolations = [
        {
          type: '11_hour_driving',
          severity: 'warning',
          timestamp: new Date().toISOString(),
          description: 'Approaching 11-hour driving limit',
          remainingMinutes: 30
        }
      ];

      return mockViolations.map(v => this.normalizeViolation(v));
    });
  }

  /**
   * Ensure client is authenticated
   */
  async ensureAuthenticated() {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  /**
   * Execute function with retry logic
   */
  async withRetry(fn) {
    let lastError;
    let delay = this.retryConfig.baseDelayMs;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < this.retryConfig.maxRetries) {
          console.warn(`[ELDClient] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error.message);
          await this.sleep(delay);
          delay = Math.min(delay * this.retryConfig.backoffMultiplier, this.retryConfig.maxDelayMs);
        }
      }
    }

    throw new ELDClientError(`Failed after ${this.retryConfig.maxRetries + 1} attempts: ${lastError.message}`, lastError);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Normalize HOS data to standard format
   */
  normalizeHOSData(rawData) {
    return {
      driverId: rawData.driver_id || rawData.driverId,
      currentStatus: this.normalizeHOSStatus(rawData.status || rawData.duty_status),
      statusStartTime: new Date(rawData.status_start || rawData.startTime).toISOString(),
      drivingRemaining: rawData.driving_remaining || rawData.driveTimeRemaining || 0,
      dutyRemaining: rawData.duty_remaining || rawData.onDutyTimeRemaining || 0,
      cycleRemaining: rawData.cycle_remaining || rawData.cycleTimeRemaining || 0,
      breakRemaining: rawData.break_remaining || rawData.breakTimeRemaining || 0,
      lastUpdated: new Date().toISOString(),
      provider: this.provider,
      raw: rawData
    };
  }

  /**
   * Normalize GPS data to standard format
   */
  normalizeGPSData(rawData) {
    return {
      vehicleId: rawData.vehicle_id || rawData.vehicleId,
      latitude: rawData.lat || rawData.latitude,
      longitude: rawData.lng || rawData.longitude,
      heading: rawData.heading || rawData.bearing || 0,
      speed: rawData.speed || rawData.speedMph || 0,
      odometer: rawData.odometer || rawData.odometerMiles || 0,
      engineHours: rawData.engine_hours || rawData.engineHours || 0,
      timestamp: new Date(rawData.timestamp || rawData.time).toISOString(),
      address: rawData.address || rawData.location || null,
      lastUpdated: new Date().toISOString(),
      provider: this.provider,
      raw: rawData
    };
  }

  /**
   * Normalize HOS status to standard enum
   */
  normalizeHOSStatus(status) {
    const statusMap = {
      'off': HOS_STATUS.OFF_DUTY,
      'off_duty': HOS_STATUS.OFF_DUTY,
      'OFF': HOS_STATUS.OFF_DUTY,
      'sb': HOS_STATUS.SLEEPER,
      'sleeper': HOS_STATUS.SLEEPER,
      'SB': HOS_STATUS.SLEEPER,
      'd': HOS_STATUS.DRIVING,
      'driving': HOS_STATUS.DRIVING,
      'D': HOS_STATUS.DRIVING,
      'on': HOS_STATUS.ON_DUTY,
      'on_duty': HOS_STATUS.ON_DUTY,
      'ON': HOS_STATUS.ON_DUTY,
      'ym': HOS_STATUS.YARD_MOVE,
      'yard_move': HOS_STATUS.YARD_MOVE,
      'pc': HOS_STATUS.PERSONAL_CONVEYANCE,
      'personal_conveyance': HOS_STATUS.PERSONAL_CONVEYANCE
    };
    return statusMap[status] || HOS_STATUS.OFF_DUTY;
  }

  /**
   * Normalize violation to standard format
   */
  normalizeViolation(rawViolation) {
    return {
      type: rawViolation.type,
      severity: rawViolation.severity,
      timestamp: rawViolation.timestamp,
      description: rawViolation.description,
      remainingMinutes: rawViolation.remainingMinutes,
      provider: this.provider
    };
  }

  /**
   * Mock HOS response for testing
   */
  getMockHOSResponse(driverId) {
    const statuses = ['driving', 'on_duty', 'off_duty', 'sleeper'];
    return {
      driver_id: driverId,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      status_start: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      driving_remaining: Math.floor(Math.random() * 660), // 0-11 hours in minutes
      duty_remaining: Math.floor(Math.random() * 840), // 0-14 hours in minutes
      cycle_remaining: Math.floor(Math.random() * 4200), // 0-70 hours in minutes
      break_remaining: Math.floor(Math.random() * 30)
    };
  }

  /**
   * Mock GPS response for testing
   */
  getMockGPSResponse(vehicleId) {
    return {
      vehicle_id: vehicleId,
      lat: 39.8283 + (Math.random() - 0.5) * 10,
      lng: -98.5795 + (Math.random() - 0.5) * 20,
      heading: Math.floor(Math.random() * 360),
      speed: Math.floor(Math.random() * 75),
      odometer: Math.floor(Math.random() * 500000),
      engine_hours: Math.floor(Math.random() * 10000),
      timestamp: new Date().toISOString(),
      address: 'US Highway 50, Kansas'
    };
  }
}

/**
 * Custom error class for ELD Client errors
 */
export class ELDClientError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'ELDClientError';
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Factory function to create ELD client
 */
export function createELDClient(provider, config) {
  if (!Object.values(ELD_PROVIDERS).includes(provider)) {
    throw new Error(`Unsupported ELD provider: ${provider}`);
  }
  return new ELDProviderClient(provider, config);
}

/**
 * React Hook for ELD data
 */
import { useState, useEffect, useCallback } from 'react';

export function useELDData(provider, driverId, vehicleId, config = {}) {
  const [hosData, setHosData] = useState(null);
  const [gpsData, setGpsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const client = new ELDProviderClient(provider, config);

  const fetchData = useCallback(async () => {
    if (!driverId && !vehicleId) return;
    
    setLoading(true);
    setError(null);

    try {
      const [hos, gps] = await Promise.all([
        driverId ? client.fetchCurrentHOS(driverId) : null,
        vehicleId ? client.fetchLatestGPS(vehicleId) : null
      ]);

      if (hos) setHosData(hos);
      if (gps) setGpsData(gps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [provider, driverId, vehicleId]);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh if configured
    if (config.refreshInterval) {
      const interval = setInterval(fetchData, config.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, config.refreshInterval]);

  return { hosData, gpsData, loading, error, refresh: fetchData };
}

export default ELDProviderClient;