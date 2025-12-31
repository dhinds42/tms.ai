/**
 * Rate Limiting & API Throttling Layer
 * Prevents API abuse and implements circuit breaker pattern
 */

class RateLimiter {
  constructor(options = {}) {
    this.limits = new Map(); // Per-tenant rate limits
    this.defaultLimit = options.defaultLimit || 100; // requests per minute
    this.windowMs = options.windowMs || 60000; // 1 minute
  }

  /**
   * Check if request is allowed
   */
  checkLimit(tenantId, endpoint = 'global') {
    const key = `${tenantId}:${endpoint}`;
    const now = Date.now();

    if (!this.limits.has(key)) {
      this.limits.set(key, {
        requests: [],
        blocked: false,
        blockedUntil: null
      });
    }

    const limitData = this.limits.get(key);

    // Remove old requests outside window
    limitData.requests = limitData.requests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    // Check if blocked
    if (limitData.blocked && limitData.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(limitData.blockedUntil),
        reason: 'rate_limit_exceeded'
      };
    } else if (limitData.blocked && limitData.blockedUntil <= now) {
      // Unblock
      limitData.blocked = false;
      limitData.blockedUntil = null;
      limitData.requests = [];
    }

    // Check limit
    if (limitData.requests.length >= this.defaultLimit) {
      limitData.blocked = true;
      limitData.blockedUntil = now + this.windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(limitData.blockedUntil),
        reason: 'rate_limit_exceeded'
      };
    }

    // Allow request
    limitData.requests.push(now);

    return {
      allowed: true,
      remaining: this.defaultLimit - limitData.requests.length,
      resetAt: new Date(now + this.windowMs)
    };
  }

  /**
   * Set custom limit for tenant
   */
  setTenantLimit(tenantId, limit) {
    this.defaultLimit = limit;
  }

  /**
   * Reset limits for tenant
   */
  reset(tenantId, endpoint = 'global') {
    const key = `${tenantId}:${endpoint}`;
    this.limits.delete(key);
  }
}

/**
 * Circuit Breaker Pattern
 * Prevents cascading failures with external services
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.monitoringWindow = options.monitoringWindow || 120000; // 2 minutes
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = [];
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  /**
   * Execute function with circuit breaker
   */
  async execute(fn, fallback = null) {
    // Check circuit state
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        console.log('Circuit breaker entering HALF_OPEN state');
      } else {
        console.log('Circuit breaker OPEN - using fallback');
        return fallback ? fallback() : Promise.reject(new Error('Circuit breaker is OPEN'));
      }
    }

    try {
      const result = await fn();

      // Success - record it
      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= 3) {
          this.reset();
          console.log('Circuit breaker CLOSED after successful recovery');
        }
      }

      return result;
    } catch (error) {
      this.recordFailure();
      
      if (fallback) {
        console.log('Circuit breaker - executing fallback');
        return fallback();
      }
      
      throw error;
    }
  }

  /**
   * Record a failure
   */
  recordFailure() {
    const now = Date.now();
    this.failures.push(now);
    this.lastFailureTime = now;

    // Remove old failures
    this.failures = this.failures.filter(
      timestamp => now - timestamp < this.monitoringWindow
    );

    // Check if threshold exceeded
    if (this.failures.length >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log(`Circuit breaker OPEN - ${this.failures.length} failures in monitoring window`);
    }
  }

  /**
   * Reset circuit breaker
   */
  reset() {
    this.state = 'CLOSED';
    this.failures = [];
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      state: this.state,
      failures: this.failures.length,
      lastFailure: this.lastFailureTime
    };
  }
}

/**
 * Dynamic Throttling
 * Adjusts rate limits based on system load
 */
class DynamicThrottler {
  constructor(options = {}) {
    this.baseLimit = options.baseLimit || 100;
    this.currentLimit = this.baseLimit;
    this.cpuThreshold = options.cpuThreshold || 80; // 80% CPU
    this.adjustmentFactor = options.adjustmentFactor || 0.5;
  }

  /**
   * Adjust limits based on system metrics
   */
  adjustLimits(systemMetrics) {
    const { cpuUsage, memoryUsage, responseTime } = systemMetrics;

    if (cpuUsage > this.cpuThreshold || responseTime > 1000) {
      // Reduce limits
      this.currentLimit = Math.max(
        10,
        Math.floor(this.currentLimit * this.adjustmentFactor)
      );
      console.log(`Throttling: Reduced limit to ${this.currentLimit} req/min`);
    } else if (cpuUsage < 50 && this.currentLimit < this.baseLimit) {
      // Increase limits
      this.currentLimit = Math.min(
        this.baseLimit,
        Math.floor(this.currentLimit * 1.5)
      );
      console.log(`Throttling: Increased limit to ${this.currentLimit} req/min`);
    }

    return this.currentLimit;
  }

  getCurrentLimit() {
    return this.currentLimit;
  }
}

// Export instances
export const rateLimiter = new RateLimiter();
export const circuitBreaker = new CircuitBreaker();
export const dynamicThrottler = new DynamicThrottler();

// Circuit breaker instances for external services
export const fmcsaCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 30000
});

export const eldCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 30000
});

/**
 * React Hook for rate limiting
 */
export function useRateLimiter(tenantId) {
  const checkLimit = (endpoint) => {
    return rateLimiter.checkLimit(tenantId, endpoint);
  };

  return { checkLimit };
}

/**
 * Decorator for API calls with circuit breaker
 */
export function withCircuitBreaker(circuitBreaker) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      return circuitBreaker.execute(
        () => originalMethod.apply(this, args),
        () => {
          console.log(`Fallback for ${propertyKey}`);
          return null;
        }
      );
    };

    return descriptor;
  };
}