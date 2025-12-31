/**
 * Load State Machine with Guards
 * Enforces valid state transitions and business rules
 */

// Valid state transitions
const STATE_TRANSITIONS = {
  quote: ['available', 'cancelled'],
  available: ['tendered', 'cancelled'],
  tendered: ['assigned', 'available', 'cancelled'],
  assigned: ['dispatched', 'tendered', 'cancelled'],
  dispatched: ['picked_up', 'cancelled'],
  picked_up: ['in_transit'],
  in_transit: ['delivered', 'picked_up'],
  delivered: ['invoiced'],
  invoiced: ['closed'],
  closed: [],
  cancelled: []
};

// Required fields for each status
const STATUS_REQUIREMENTS = {
  available: ['pickup_location', 'dropoff_location', 'equipment_type'],
  tendered: ['carrier_id', 'carrier_pay'],
  assigned: ['driver_id', 'carrier_pay'],
  dispatched: ['driver_id', 'carrier_pay', 'planned_pickup_datetime'],
  picked_up: ['actual_pickup_datetime'],
  delivered: ['actual_delivery_datetime', 'pod_url'],
  invoiced: ['invoice_number', 'customer_rate'],
};

export class LoadStateValidator {
  /**
   * Validate if status transition is allowed
   */
  static canTransition(currentStatus, newStatus) {
    const allowedTransitions = STATE_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Validate if load has required fields for status
   */
  static validateRequirements(load, targetStatus) {
    const required = STATUS_REQUIREMENTS[targetStatus] || [];
    const missing = [];

    for (const field of required) {
      const value = this.getNestedValue(load, field);
      if (!value || value === '') {
        missing.push(field);
      }
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Validate business rules for status
   */
  static validateBusinessRules(load, targetStatus) {
    const violations = [];

    // Can't dispatch without valid HOS
    if (targetStatus === 'dispatched' && load.driver_id) {
      // This would check driver HOS from driver entity
      // violations.push('Driver has insufficient HOS remaining');
    }

    // Can't deliver without pickup
    if (targetStatus === 'delivered' && !load.actual_pickup_datetime) {
      violations.push('Cannot mark delivered without pickup confirmation');
    }

    // Can't invoice without delivery
    if (targetStatus === 'invoiced' && load.status !== 'delivered') {
      violations.push('Cannot invoice load that is not delivered');
    }

    // Can't invoice if carrier pay > customer rate (negative margin)
    if (targetStatus === 'invoiced') {
      const revenue = parseFloat(load.customer_rate) || 0;
      const cost = parseFloat(load.carrier_pay) || 0;
      if (cost > revenue) {
        violations.push(`Cannot invoice: carrier pay ($${cost}) exceeds customer rate ($${revenue})`);
      }
    }

    // Can't close without payment received
    if (targetStatus === 'closed' && load.invoice_status !== 'paid') {
      violations.push('Cannot close load with unpaid invoice');
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  /**
   * Comprehensive validation
   */
  static validate(load, targetStatus) {
    // Check if transition is allowed
    if (!this.canTransition(load.status, targetStatus)) {
      return {
        valid: false,
        errors: [`Cannot transition from ${load.status} to ${targetStatus}`]
      };
    }

    // Check required fields
    const reqValidation = this.validateRequirements(load, targetStatus);
    if (!reqValidation.valid) {
      return {
        valid: false,
        errors: [`Missing required fields: ${reqValidation.missing.join(', ')}`]
      };
    }

    // Check business rules
    const ruleValidation = this.validateBusinessRules(load, targetStatus);
    if (!ruleValidation.valid) {
      return {
        valid: false,
        errors: ruleValidation.violations
      };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Get nested object value
   */
  static getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  /**
   * Get next valid statuses
   */
  static getNextStatuses(currentStatus) {
    return STATE_TRANSITIONS[currentStatus] || [];
  }
}

/**
 * Hook for load state validation
 */
export function useLoadStateValidation(load) {
  const canTransitionTo = (newStatus) => {
    return LoadStateValidator.validate(load, newStatus);
  };

  const getNextValidStatuses = () => {
    return LoadStateValidator.getNextStatuses(load.status);
  };

  return {
    canTransitionTo,
    getNextValidStatuses
  };
}