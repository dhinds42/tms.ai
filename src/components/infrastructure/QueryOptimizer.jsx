/**
 * Database Query Optimization Engine
 * Identifies N+1 problems, caching, and query performance monitoring
 */

class QueryOptimizer {
  constructor() {
    this.cache = new Map();
    this.queryLog = [];
    this.maxQueryLogSize = 1000;
    this.slowQueryThreshold = 500; // ms
    this.cacheConfig = {
      defaultTTL: 300000, // 5 minutes
      maxSize: 500
    };
  }

  /**
   * Execute query with caching
   */
  async executeWithCache(queryKey, queryFn, options = {}) {
    const ttl = options.ttl || this.cacheConfig.defaultTTL;
    const forceRefresh = options.forceRefresh || false;

    // Check cache
    if (!forceRefresh && this.cache.has(queryKey)) {
      const cached = this.cache.get(queryKey);
      
      if (Date.now() - cached.timestamp < ttl) {
        this.logQuery(queryKey, 'CACHE_HIT', 0);
        return cached.data;
      } else {
        // Expired - remove from cache
        this.cache.delete(queryKey);
      }
    }

    // Execute query
    const startTime = performance.now();
    
    try {
      const data = await queryFn();
      const duration = performance.now() - startTime;
      
      // Store in cache
      this.cache.set(queryKey, {
        data,
        timestamp: Date.now()
      });

      // Manage cache size
      if (this.cache.size > this.cacheConfig.maxSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      this.logQuery(queryKey, 'CACHE_MISS', duration);

      return data;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.logQuery(queryKey, 'ERROR', duration, error.message);
      throw error;
    }
  }

  /**
   * Invalidate cache
   */
  invalidateCache(pattern) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Pattern-based invalidation
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    
    console.log(`Invalidated ${keysToDelete.length} cache entries for pattern: ${pattern}`);
  }

  /**
   * Log query performance
   */
  logQuery(queryKey, status, duration, error = null) {
    const logEntry = {
      queryKey,
      status,
      duration,
      timestamp: new Date().toISOString(),
      error
    };

    this.queryLog.push(logEntry);

    // Trim log
    if (this.queryLog.length > this.maxQueryLogSize) {
      this.queryLog.shift();
    }

    // Warn on slow queries
    if (duration > this.slowQueryThreshold) {
      console.warn(`SLOW QUERY [${duration.toFixed(0)}ms]: ${queryKey}`);
    }
  }

  /**
   * Detect N+1 query problems
   */
  detectN1Problems(timeWindowMs = 5000) {
    const now = Date.now();
    const recentQueries = this.queryLog.filter(q => 
      Date.now() - new Date(q.timestamp).getTime() < timeWindowMs
    );

    // Group by query pattern
    const queryPatterns = new Map();
    
    recentQueries.forEach(query => {
      // Extract pattern (e.g., "loads.list" or "carriers.get")
      const pattern = query.queryKey.split(':')[0];
      
      if (!queryPatterns.has(pattern)) {
        queryPatterns.set(pattern, []);
      }
      
      queryPatterns.get(pattern).push(query);
    });

    // Detect potential N+1
    const problems = [];
    
    for (const [pattern, queries] of queryPatterns.entries()) {
      if (queries.length > 10) {
        const avgDuration = queries.reduce((sum, q) => sum + q.duration, 0) / queries.length;
        
        problems.push({
          pattern,
          count: queries.length,
          avgDuration: avgDuration.toFixed(2),
          totalDuration: queries.reduce((sum, q) => sum + q.duration, 0).toFixed(2),
          severity: queries.length > 50 ? 'critical' : queries.length > 20 ? 'high' : 'medium'
        });
      }
    }

    return problems;
  }

  /**
   * Get slow query report
   */
  getSlowQueries(limit = 20) {
    return this.queryLog
      .filter(q => q.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get query performance stats
   */
  getStats() {
    const totalQueries = this.queryLog.length;
    const cacheHits = this.queryLog.filter(q => q.status === 'CACHE_HIT').length;
    const cacheMisses = this.queryLog.filter(q => q.status === 'CACHE_MISS').length;
    const errors = this.queryLog.filter(q => q.status === 'ERROR').length;
    
    const avgDuration = cacheMisses > 0
      ? this.queryLog
          .filter(q => q.status === 'CACHE_MISS')
          .reduce((sum, q) => sum + q.duration, 0) / cacheMisses
      : 0;

    const cacheHitRate = totalQueries > 0 
      ? (cacheHits / totalQueries) * 100 
      : 0;

    return {
      totalQueries,
      cacheHits,
      cacheMisses,
      cacheHitRate: cacheHitRate.toFixed(1) + '%',
      errors,
      avgQueryDuration: avgDuration.toFixed(2) + 'ms',
      slowQueries: this.queryLog.filter(q => q.duration > this.slowQueryThreshold).length,
      cacheSize: this.cache.size
    };
  }

  /**
   * Batch query execution
   */
  async batchExecute(queries) {
    const results = new Map();
    
    // Execute all queries in parallel
    const promises = queries.map(async ({ key, fn, options }) => {
      try {
        const result = await this.executeWithCache(key, fn, options);
        results.set(key, { success: true, data: result });
      } catch (error) {
        results.set(key, { success: false, error: error.message });
      }
    });

    await Promise.all(promises);
    
    return results;
  }
}

// Export singleton
export const queryOptimizer = new QueryOptimizer();

/**
 * React Hook for optimized queries
 */
export function useOptimizedQuery(queryKey, queryFn, options = {}) {
  const execute = () => queryOptimizer.executeWithCache(queryKey, queryFn, options);
  const invalidate = () => queryOptimizer.invalidateCache(queryKey);
  
  return { execute, invalidate };
}

/**
 * Smart invalidation helper
 */
export const INVALIDATION_PATTERNS = {
  LOADS: 'loads',
  CARRIERS: 'carriers',
  DRIVERS: 'drivers',
  DOCUMENTS: 'documents',
  COMPLIANCE: 'compliance',
  ALL: null
};

export function invalidateRelated(entityType) {
  const patterns = {
    load: ['loads', 'analytics', 'carriers', 'drivers'],
    carrier: ['carriers', 'loads', 'compliance'],
    driver: ['drivers', 'loads', 'hos'],
    document: ['documents', 'loads', 'carriers']
  };

  const toInvalidate = patterns[entityType] || [];
  
  toInvalidate.forEach(pattern => {
    queryOptimizer.invalidateCache(pattern);
  });

  console.log(`Invalidated caches for: ${toInvalidate.join(', ')}`);
}