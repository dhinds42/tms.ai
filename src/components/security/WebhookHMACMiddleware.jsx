/**
 * Webhook HMAC Signature Validation Middleware
 * 
 * Validates incoming webhook requests using HMAC-SHA256 signatures.
 * Supports configurable shared secrets per webhook source.
 */

// Webhook source configurations
export const WEBHOOK_SOURCES = {
  ELD_KEEPTRUCKIN: 'eld_keeptruckin',
  ELD_SAMSARA: 'eld_samsara',
  LOADBOARD_DAT: 'loadboard_dat',
  LOADBOARD_TRUCKSTOP: 'loadboard_truckstop',
  PAYMENT_TRIUMPHPAY: 'payment_triumphpay',
  PAYMENT_ROADSYNC: 'payment_roadsync',
  ACCOUNTING_QUICKBOOKS: 'accounting_quickbooks',
  TRACKING_MACROPOINT: 'tracking_macropoint',
  CUSTOM: 'custom'
};

// Signature header names per source
const SIGNATURE_HEADERS = {
  [WEBHOOK_SOURCES.ELD_KEEPTRUCKIN]: 'X-KT-Signature',
  [WEBHOOK_SOURCES.ELD_SAMSARA]: 'X-Samsara-Signature',
  [WEBHOOK_SOURCES.LOADBOARD_DAT]: 'X-DAT-Signature',
  [WEBHOOK_SOURCES.LOADBOARD_TRUCKSTOP]: 'X-Truckstop-Signature',
  [WEBHOOK_SOURCES.PAYMENT_TRIUMPHPAY]: 'X-TriumphPay-Signature',
  [WEBHOOK_SOURCES.PAYMENT_ROADSYNC]: 'X-RoadSync-Signature',
  [WEBHOOK_SOURCES.ACCOUNTING_QUICKBOOKS]: 'intuit-signature',
  [WEBHOOK_SOURCES.TRACKING_MACROPOINT]: 'X-Macropoint-Signature',
  [WEBHOOK_SOURCES.CUSTOM]: 'X-Webhook-Signature'
};

/**
 * WebhookHMACValidator Class
 */
export class WebhookHMACValidator {
  constructor(config = {}) {
    this.secrets = config.secrets || {};
    this.toleranceSeconds = config.toleranceSeconds || 300; // 5 min default
    this.algorithm = config.algorithm || 'SHA-256';
  }

  /**
   * Set secret for a webhook source
   */
  setSecret(source, secret) {
    this.secrets[source] = secret;
  }

  /**
   * Get secret for a webhook source
   */
  getSecret(source) {
    return this.secrets[source];
  }

  /**
   * Validate webhook signature
   */
  async validateSignature(source, payload, signature, timestamp = null) {
    const secret = this.getSecret(source);
    
    if (!secret) {
      return {
        valid: false,
        error: 'NO_SECRET_CONFIGURED',
        message: `No secret configured for source: ${source}`
      };
    }

    if (!signature) {
      return {
        valid: false,
        error: 'MISSING_SIGNATURE',
        message: 'Webhook signature header is missing'
      };
    }

    // Check timestamp if provided (replay attack prevention)
    if (timestamp) {
      const requestTime = parseInt(timestamp, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (Math.abs(currentTime - requestTime) > this.toleranceSeconds) {
        return {
          valid: false,
          error: 'TIMESTAMP_EXPIRED',
          message: `Request timestamp outside tolerance window (${this.toleranceSeconds}s)`
        };
      }
    }

    // Compute expected signature
    const expectedSignature = await this.computeHMAC(payload, secret, timestamp);
    
    // Constant-time comparison to prevent timing attacks
    const isValid = this.secureCompare(signature, expectedSignature);

    return {
      valid: isValid,
      error: isValid ? null : 'INVALID_SIGNATURE',
      message: isValid ? 'Signature valid' : 'Signature verification failed'
    };
  }

  /**
   * Compute HMAC signature
   */
  async computeHMAC(payload, secret, timestamp = null) {
    const data = timestamp ? `${timestamp}.${payload}` : payload;
    const payloadString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Use Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payloadString);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: this.algorithm },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }

  /**
   * Constant-time string comparison (prevents timing attacks)
   */
  secureCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    
    const aLower = a.toLowerCase().replace(/^(sha256=|v1=)/, '');
    const bLower = b.toLowerCase().replace(/^(sha256=|v1=)/, '');
    
    if (aLower.length !== bLower.length) return false;
    
    let result = 0;
    for (let i = 0; i < aLower.length; i++) {
      result |= aLower.charCodeAt(i) ^ bLower.charCodeAt(i);
    }
    return result === 0;
  }

  /**
   * Express-style middleware function
   */
  middleware(source) {
    return async (req, res, next) => {
      const headerName = SIGNATURE_HEADERS[source] || SIGNATURE_HEADERS[WEBHOOK_SOURCES.CUSTOM];
      const signature = req.headers[headerName.toLowerCase()];
      const timestamp = req.headers['x-webhook-timestamp'];
      const payload = req.rawBody || JSON.stringify(req.body);

      const result = await this.validateSignature(source, payload, signature, timestamp);

      if (!result.valid) {
        console.error(`[WebhookHMAC] Validation failed for ${source}:`, result);
        return res.status(401).json({
          error: result.error,
          message: result.message
        });
      }

      req.webhookValidated = true;
      req.webhookSource = source;
      next();
    };
  }
}

/**
 * Webhook request handler with HMAC validation
 */
export async function handleWebhookRequest(source, headers, body, secrets) {
  const validator = new WebhookHMACValidator({ secrets });
  
  const headerName = SIGNATURE_HEADERS[source] || 'x-webhook-signature';
  const signature = headers[headerName] || headers[headerName.toLowerCase()];
  const timestamp = headers['x-webhook-timestamp'] || headers['X-Webhook-Timestamp'];
  const payload = typeof body === 'string' ? body : JSON.stringify(body);

  const result = await validator.validateSignature(source, payload, signature, timestamp);

  if (!result.valid) {
    throw new WebhookValidationError(result.error, result.message);
  }

  return { validated: true, source, payload: body };
}

/**
 * Custom error class for webhook validation
 */
export class WebhookValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'WebhookValidationError';
    this.code = code;
  }
}

/**
 * Generate a signing secret
 */
export function generateWebhookSecret(length = 32) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export default WebhookHMACValidator;