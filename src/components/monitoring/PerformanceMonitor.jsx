/**
 * Performance Monitoring Dashboard
 * Tracks API response times, query performance, error rates, and system metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: [],
      errors: [],
      queries: [],
      systemMetrics: []
    };
    this.maxHistorySize = 1000;
    this.alertThresholds = {
      apiResponseTime: 1000, // ms
      queryTime: 500, // ms
      errorRate: 5, // percent
      cpuUsage: 80, // percent
      memoryUsage: 85 // percent
    };
    this.alerts = [];
  }

  /**
   * Track API call
   */
  trackAPICall(endpoint, duration, statusCode) {
    const metric = {
      endpoint,
      duration,
      statusCode,
      timestamp: Date.now(),
      success: statusCode >= 200 && statusCode < 300
    };

    this.metrics.apiCalls.push(metric);
    this.trimHistory('apiCalls');

    // Check threshold
    if (duration > this.alertThresholds.apiResponseTime) {
      this.createAlert('api_slow', `Slow API: ${endpoint} took ${duration}ms`);
    }

    return metric;
  }

  /**
   * Track database query
   */
  trackQuery(queryKey, duration, cached = false) {
    const metric = {
      queryKey,
      duration,
      cached,
      timestamp: Date.now()
    };

    this.metrics.queries.push(metric);
    this.trimHistory('queries');

    // Flag slow queries
    if (!cached && duration > this.alertThresholds.queryTime) {
      this.createAlert('query_slow', `Slow Query: ${queryKey} took ${duration}ms`);
    }

    return metric;
  }

  /**
   * Track error
   */
  trackError(error, context = {}) {
    const metric = {
      message: error.message || error,
      stack: error.stack,
      context,
      timestamp: Date.now()
    };

    this.metrics.errors.push(metric);
    this.trimHistory('errors');

    // Check error rate
    const recentErrors = this.getRecentMetrics('errors', 60000); // Last minute
    const totalCalls = this.getRecentMetrics('apiCalls', 60000).length;
    const errorRate = totalCalls > 0 ? (recentErrors.length / totalCalls) * 100 : 0;

    if (errorRate > this.alertThresholds.errorRate) {
      this.createAlert('error_rate', `High error rate: ${errorRate.toFixed(1)}%`);
    }

    return metric;
  }

  /**
   * Track system metrics (CPU, Memory)
   */
  trackSystemMetrics(cpuUsage, memoryUsage) {
    const metric = {
      cpuUsage,
      memoryUsage,
      timestamp: Date.now()
    };

    this.metrics.systemMetrics.push(metric);
    this.trimHistory('systemMetrics');

    // Check thresholds
    if (cpuUsage > this.alertThresholds.cpuUsage) {
      this.createAlert('cpu_high', `High CPU usage: ${cpuUsage}%`);
    }
    if (memoryUsage > this.alertThresholds.memoryUsage) {
      this.createAlert('memory_high', `High memory usage: ${memoryUsage}%`);
    }

    return metric;
  }

  /**
   * Create alert
   */
  createAlert(type, message) {
    const alert = {
      type,
      message,
      timestamp: Date.now(),
      id: `alert_${Date.now()}_${Math.random()}`
    };

    this.alerts.push(alert);
    console.warn(`[PERFORMANCE ALERT] ${message}`);

    return alert;
  }

  /**
   * Get endpoint statistics
   */
  getEndpointStats(timeWindow = 300000) { // 5 minutes
    const recentCalls = this.getRecentMetrics('apiCalls', timeWindow);
    const endpointStats = {};

    recentCalls.forEach(call => {
      if (!endpointStats[call.endpoint]) {
        endpointStats[call.endpoint] = {
          endpoint: call.endpoint,
          count: 0,
          totalDuration: 0,
          errors: 0,
          successRate: 0
        };
      }

      const stats = endpointStats[call.endpoint];
      stats.count++;
      stats.totalDuration += call.duration;
      if (!call.success) stats.errors++;
    });

    // Calculate averages
    Object.values(endpointStats).forEach(stats => {
      stats.avgDuration = stats.count > 0 ? stats.totalDuration / stats.count : 0;
      stats.successRate = stats.count > 0 ? ((stats.count - stats.errors) / stats.count) * 100 : 0;
    });

    return Object.values(endpointStats).sort((a, b) => b.avgDuration - a.avgDuration);
  }

  /**
   * Get query statistics
   */
  getQueryStats(timeWindow = 300000) {
    const recentQueries = this.getRecentMetrics('queries', timeWindow);
    const queryStats = {};

    recentQueries.forEach(query => {
      if (!queryStats[query.queryKey]) {
        queryStats[query.queryKey] = {
          queryKey: query.queryKey,
          count: 0,
          totalDuration: 0,
          cached: 0
        };
      }

      const stats = queryStats[query.queryKey];
      stats.count++;
      stats.totalDuration += query.duration;
      if (query.cached) stats.cached++;
    });

    // Calculate averages
    Object.values(queryStats).forEach(stats => {
      stats.avgDuration = stats.count > 0 ? stats.totalDuration / stats.count : 0;
      stats.cacheRate = stats.count > 0 ? (stats.cached / stats.count) * 100 : 0;
    });

    return Object.values(queryStats).sort((a, b) => b.avgDuration - a.avgDuration);
  }

  /**
   * Get error summary
   */
  getErrorSummary(timeWindow = 300000) {
    const recentErrors = this.getRecentMetrics('errors', timeWindow);
    const totalCalls = this.getRecentMetrics('apiCalls', timeWindow).length;
    
    return {
      totalErrors: recentErrors.length,
      errorRate: totalCalls > 0 ? (recentErrors.length / totalCalls) * 100 : 0,
      recentErrors: recentErrors.slice(-10)
    };
  }

  /**
   * Get system health
   */
  getSystemHealth() {
    const recentMetrics = this.getRecentMetrics('systemMetrics', 60000);
    if (recentMetrics.length === 0) return null;

    const latest = recentMetrics[recentMetrics.length - 1];
    const avg = {
      cpu: recentMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / recentMetrics.length,
      memory: recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / recentMetrics.length
    };

    return {
      current: latest,
      average: avg,
      trend: recentMetrics
    };
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(type, timeWindow) {
    const now = Date.now();
    return this.metrics[type].filter(m => now - m.timestamp < timeWindow);
  }

  /**
   * Trim history
   */
  trimHistory(type) {
    if (this.metrics[type].length > this.maxHistorySize) {
      this.metrics[type] = this.metrics[type].slice(-this.maxHistorySize);
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(maxAge = 300000) { // 5 minutes
    const now = Date.now();
    return this.alerts.filter(a => now - a.timestamp < maxAge);
  }

  /**
   * Clear alerts
   */
  clearAlerts() {
    this.alerts = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;