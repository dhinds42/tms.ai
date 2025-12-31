/**
 * Smart Data Archival System
 * Auto-archive old loads, maintain retention policy, searchable archive
 */

export class DataArchivalSystem {
  constructor() {
    this.archiveThreshold = 365; // days
    this.retentionPeriod = 1095; // 3 years
    this.archiveStorage = new Map(); // In-memory archive (in production, use separate DB)
  }

  /**
   * Check if load should be archived
   */
  shouldArchive(load) {
    if (!load.created_date) return false;
    
    const createdDate = new Date(load.created_date);
    const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Archive if >1 year old and status is closed/delivered/cancelled
    return daysSinceCreation > this.archiveThreshold && 
           ['delivered', 'closed', 'cancelled'].includes(load.status);
  }

  /**
   * Check if load should be deleted (retention policy)
   */
  shouldDelete(load) {
    if (!load.created_date) return false;
    
    const createdDate = new Date(load.created_date);
    const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceCreation > this.retentionPeriod;
  }

  /**
   * Archive load
   */
  archiveLoad(load) {
    const archivedLoad = {
      ...load,
      archived: true,
      archived_at: new Date().toISOString(),
      searchable_text: this.generateSearchableText(load)
    };

    this.archiveStorage.set(load.id, archivedLoad);
    
    console.log(`Archived load ${load.id}`);
    return archivedLoad;
  }

  /**
   * Generate searchable text for full-text search
   */
  generateSearchableText(load) {
    const searchFields = [
      load.load_number,
      load.customer_reference,
      load.pickup_location?.city,
      load.pickup_location?.state,
      load.dropoff_location?.city,
      load.dropoff_location?.state,
      load.commodity,
      load.carrier_id,
      load.driver_id
    ];

    return searchFields.filter(Boolean).join(' ').toLowerCase();
  }

  /**
   * Search archived loads
   */
  searchArchive(query, filters = {}) {
    const searchTerm = query.toLowerCase();
    let results = Array.from(this.archiveStorage.values());

    // Text search
    if (searchTerm) {
      results = results.filter(load => 
        load.searchable_text?.includes(searchTerm)
      );
    }

    // Apply filters
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      results = results.filter(load => new Date(load.created_date) >= from);
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      results = results.filter(load => new Date(load.created_date) <= to);
    }

    if (filters.status) {
      results = results.filter(load => load.status === filters.status);
    }

    if (filters.customer_id) {
      results = results.filter(load => load.customer_id === filters.customer_id);
    }

    // Sort by date (newest first)
    results.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    return results;
  }

  /**
   * Get archival statistics
   */
  getStats(activeLoads = []) {
    const eligibleForArchival = activeLoads.filter(l => this.shouldArchive(l));
    const eligibleForDeletion = activeLoads.filter(l => this.shouldDelete(l));

    return {
      totalArchived: this.archiveStorage.size,
      eligibleForArchival: eligibleForArchival.length,
      eligibleForDeletion: eligibleForDeletion.length,
      potentialSpaceSaved: eligibleForArchival.length * 2, // KB per load estimate
      retentionPolicyDays: this.retentionPeriod
    };
  }

  /**
   * Batch archive loads
   */
  async batchArchive(loads, onProgress) {
    const archived = [];
    const eligibleLoads = loads.filter(l => this.shouldArchive(l));

    for (let i = 0; i < eligibleLoads.length; i++) {
      const load = eligibleLoads[i];
      const archivedLoad = this.archiveLoad(load);
      archived.push(archivedLoad);

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: eligibleLoads.length,
          percent: ((i + 1) / eligibleLoads.length) * 100
        });
      }

      // Simulate async delay
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return archived;
  }

  /**
   * Restore archived load
   */
  restoreLoad(loadId) {
    const archivedLoad = this.archiveStorage.get(loadId);
    if (!archivedLoad) return null;

    const restoredLoad = {
      ...archivedLoad,
      archived: false,
      restored_at: new Date().toISOString()
    };

    this.archiveStorage.delete(loadId);
    
    console.log(`Restored load ${loadId}`);
    return restoredLoad;
  }

  /**
   * Calculate storage optimization
   */
  calculateOptimization(activeLoads) {
    const totalLoads = activeLoads.length;
    const eligibleForArchival = activeLoads.filter(l => this.shouldArchive(l)).length;
    
    const currentQueryTime = totalLoads * 0.5; // ms estimate
    const optimizedQueryTime = (totalLoads - eligibleForArchival) * 0.5;
    const improvement = currentQueryTime > 0 
      ? ((currentQueryTime - optimizedQueryTime) / currentQueryTime) * 100 
      : 0;

    return {
      currentLoads: totalLoads,
      afterArchival: totalLoads - eligibleForArchival,
      queryTimeImprovement: improvement.toFixed(1),
      estimatedSpeedUp: `${improvement.toFixed(0)}% faster`
    };
  }
}

export const archivalSystem = new DataArchivalSystem();
export default archivalSystem;