/**
 * Data Integrity & Validation Layer
 * Prevents invalid data from entering the system
 */

export class DataIntegrityValidator {
  /**
   * Validate Load data
   */
  static validateLoad(load) {
    const errors = [];
    const warnings = [];

    // Critical validations
    if (!load.pickup_location?.city || !load.pickup_location?.state) {
      errors.push('Pickup location city and state are required');
    }

    if (!load.dropoff_location?.city || !load.dropoff_location?.state) {
      errors.push('Delivery location city and state are required');
    }

    if (!load.equipment_type) {
      errors.push('Equipment type is required');
    }

    // Financial validations
    const customerRate = parseFloat(load.customer_rate) || 0;
    const carrierPay = parseFloat(load.carrier_pay) || 0;

    if (customerRate > 0 && carrierPay > customerRate) {
      errors.push(`Carrier pay ($${carrierPay}) cannot exceed customer rate ($${customerRate})`);
    }

    if (customerRate < 0) {
      errors.push('Customer rate cannot be negative');
    }

    if (carrierPay < 0) {
      errors.push('Carrier pay cannot be negative');
    }

    // Date validations
    if (load.planned_pickup_datetime && load.planned_delivery_datetime) {
      const pickup = new Date(load.planned_pickup_datetime);
      const delivery = new Date(load.planned_delivery_datetime);
      
      if (delivery <= pickup) {
        errors.push('Delivery date must be after pickup date');
      }
    }

    // Status-based validations
    if (['dispatched', 'picked_up', 'in_transit'].includes(load.status)) {
      if (!load.driver_id && !load.carrier_id) {
        errors.push('Load must have driver or carrier assigned when dispatched');
      }
    }

    // Warnings
    if (customerRate === 0 && !['quote', 'cancelled'].includes(load.status)) {
      warnings.push('Customer rate is $0');
    }

    if (!load.commodity || load.commodity === '') {
      warnings.push('Commodity description is missing');
    }

    if (!load.weight || load.weight === 0) {
      warnings.push('Load weight is not specified');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate Carrier data
   */
  static validateCarrier(carrier) {
    const errors = [];
    const warnings = [];

    // Critical validations
    if (!carrier.mc_number || carrier.mc_number === '') {
      errors.push('MC Number is required');
    }

    if (!carrier.dot_number || carrier.dot_number === '') {
      errors.push('DOT Number is required');
    }

    // Insurance validation
    const insuranceAmount = parseFloat(carrier.insurance_amount) || 0;
    if (insuranceAmount < 1000000) {
      errors.push('Insurance must be at least $1,000,000');
    }

    if (carrier.insurance_expiration) {
      const expDate = new Date(carrier.insurance_expiration);
      const today = new Date();
      
      if (expDate < today) {
        errors.push('Insurance is expired');
      } else if ((expDate - today) / (1000 * 60 * 60 * 24) < 30) {
        warnings.push('Insurance expires in less than 30 days');
      }
    }

    // Document warnings
    if (!carrier.w9_url) {
      warnings.push('W9 document not uploaded');
    }

    if (!carrier.coi_url) {
      warnings.push('Certificate of Insurance not uploaded');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate Driver data
   */
  static validateDriver(driver) {
    const errors = [];
    const warnings = [];

    // Critical validations
    if (!driver.cdl_number || driver.cdl_number === '') {
      errors.push('CDL Number is required');
    }

    if (!driver.cdl_class) {
      errors.push('CDL Class is required');
    }

    // CDL expiration
    if (driver.cdl_expiration) {
      const expDate = new Date(driver.cdl_expiration);
      const today = new Date();
      
      if (expDate < today) {
        errors.push('CDL is expired');
      } else if ((expDate - today) / (1000 * 60 * 60 * 24) < 30) {
        warnings.push('CDL expires in less than 30 days');
      }
    }

    // Medical card
    if (driver.medical_card_expiration) {
      const expDate = new Date(driver.medical_card_expiration);
      const today = new Date();
      
      if (expDate < today) {
        errors.push('Medical card is expired');
      } else if ((expDate - today) / (1000 * 60 * 60 * 24) < 30) {
        warnings.push('Medical card expires in less than 30 days');
      }
    }

    // HOS check
    const hosRemaining = parseFloat(driver.hos_remaining) || 0;
    if (hosRemaining < 2) {
      warnings.push('Driver has less than 2 hours HOS remaining');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check for duplicate entities
   */
  static checkDuplicates(entity, allEntities, uniqueFields) {
    const duplicates = [];

    for (const field of uniqueFields) {
      const value = entity[field];
      if (!value) continue;

      const existing = allEntities.find(e => 
        e.id !== entity.id && 
        e[field]?.toLowerCase() === value.toLowerCase()
      );

      if (existing) {
        duplicates.push({
          field,
          value,
          existingId: existing.id
        });
      }
    }

    return duplicates;
  }
}

/**
 * Hook for data validation
 */
export function useDataValidation() {
  const validateBeforeSave = (entityType, data, existingEntities = []) => {
    let result;

    switch (entityType) {
      case 'load':
        result = DataIntegrityValidator.validateLoad(data);
        break;
      case 'carrier':
        result = DataIntegrityValidator.validateCarrier(data);
        const carrierDupes = DataIntegrityValidator.checkDuplicates(
          data, 
          existingEntities, 
          ['mc_number', 'dot_number']
        );
        if (carrierDupes.length > 0) {
          result.warnings.push(...carrierDupes.map(d => `Duplicate ${d.field}: ${d.value}`));
        }
        break;
      case 'driver':
        result = DataIntegrityValidator.validateDriver(data);
        const driverDupes = DataIntegrityValidator.checkDuplicates(
          data,
          existingEntities,
          ['cdl_number', 'license_number']
        );
        if (driverDupes.length > 0) {
          result.warnings.push(...driverDupes.map(d => `Duplicate ${d.field}: ${d.value}`));
        }
        break;
      default:
        result = { valid: true, errors: [], warnings: [] };
    }

    return result;
  };

  return { validateBeforeSave };
}