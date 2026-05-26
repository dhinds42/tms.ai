/**
 * Import Validation & Normalization
 * Strict parsing with row-level error tracking
 */

import { parseCurrency, parseMiles, parseWeight, parseNumber } from './parsing';
import { dollarsToCents, Cents } from './money';

export interface RowError {
  row: number;
  field: string;
  code: string;
  message: string;
  value?: any;
}

/**
 * Parse number strictly (rejects invalid, never coerces to 0)
 */
export function parseNumberStrict(
  value: any,
  fieldName: string,
  rowNumber: number
): { value: number; error?: RowError } {
  try {
    const parsed = parseNumber(value);
    return { value: parsed };
  } catch (error) {
    return {
      value: 0,
      error: {
        row: rowNumber,
        field: fieldName,
        code: 'INVALID_NUMBER',
        message: error.message,
        value
      }
    };
  }
}

/**
 * Normalize units (lbs/kg, mi/km conversion)
 */
export function normalizeUnits(
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  // Weight conversions
  if (fromUnit === 'kg' && toUnit === 'lbs') {
    return value * 2.20462;
  }
  if (fromUnit === 'lbs' && toUnit === 'kg') {
    return value / 2.20462;
  }
  
  // Distance conversions
  if (fromUnit === 'km' && toUnit === 'mi') {
    return value * 0.621371;
  }
  if (fromUnit === 'mi' && toUnit === 'km') {
    return value / 0.621371;
  }
  
  // Same unit
  if (fromUnit === toUnit) {
    return value;
  }
  
  throw new Error(`Unsupported unit conversion: ${fromUnit} → ${toUnit}`);
}

/**
 * Validate numeric value is within bounds
 */
export function validateNumericBounds(
  value: number,
  min: number,
  max: number,
  fieldName: string
): { valid: boolean; error?: string } {
  if (value < min) {
    return {
      valid: false,
      error: `${fieldName} (${value}) is below minimum ${min}`
    };
  }
  
  if (value > max) {
    return {
      valid: false,
      error: `${fieldName} (${value}) exceeds maximum ${max}`
    };
  }
  
  return { valid: true };
}

/**
 * Validate rate sanity (outlier detection)
 * Flags rates outside typical ranges
 */
export function validateRateSanity(
  ratePerMile: number,
  miles: number,
  totalRate: number
): { sane: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // RPM sanity checks
  if (ratePerMile < 0.50) {
    warnings.push(`Rate per mile $${ratePerMile.toFixed(2)} is unusually low (< $0.50/mi)`);
  }
  
  if (ratePerMile > 10.00) {
    warnings.push(`Rate per mile $${ratePerMile.toFixed(2)} is unusually high (> $10.00/mi)`);
  }
  
  // Total rate sanity
  if (totalRate < 50) {
    warnings.push(`Total rate $${totalRate} is unusually low (< $50)`);
  }
  
  if (totalRate > 50000) {
    warnings.push(`Total rate $${totalRate} is unusually high (> $50,000)`);
  }
  
  // Distance sanity
  if (miles < 1) {
    warnings.push(`Distance ${miles} miles is unusually short`);
  }
  
  if (miles > 3000) {
    warnings.push(`Distance ${miles} miles is unusually long (> 3,000 mi)`);
  }
  
  return {
    sane: warnings.length === 0,
    warnings
  };
}

/**
 * Create structured row error
 */
export function createRowError(
  row: number,
  field: string,
  code: string,
  message: string,
  value?: any
): RowError {
  return { row, field, code, message, value };
}

/**
 * Batch validate import rows
 */
export function validateImportRows(
  rows: any[],
  schema: {
    field: string;
    type: 'currency' | 'number' | 'miles' | 'weight';
    required?: boolean;
    min?: number;
    max?: number;
  }[]
): {
  validRows: any[];
  invalidRows: any[];
  errors: RowError[];
} {
  const validRows: any[] = [];
  const invalidRows: any[] = [];
  const errors: RowError[] = [];
  
  rows.forEach((row, index) => {
    const rowNumber = index + 2; // Account for header row
    let hasError = false;
    
    schema.forEach(fieldDef => {
      const value = row[fieldDef.field];
      
      // Check required
      if (fieldDef.required && (value === null || value === undefined || value === '')) {
        errors.push(createRowError(
          rowNumber,
          fieldDef.field,
          'REQUIRED',
          `${fieldDef.field} is required`,
          value
        ));
        hasError = true;
        return;
      }
      
      // Skip validation if empty and not required
      if (!value && !fieldDef.required) return;
      
      // Parse based on type
      try {
        let parsed: number;
        
        switch (fieldDef.type) {
          case 'currency':
            parsed = dollarsToCents(parseCurrency(value)) / 100; // Back to dollars
            break;
          case 'miles':
            parsed = parseMiles(value);
            break;
          case 'weight':
            parsed = parseWeight(value);
            break;
          case 'number':
          default:
            parsed = parseNumber(value);
        }
        
        // Validate bounds
        if (fieldDef.min !== undefined && parsed < fieldDef.min) {
          errors.push(createRowError(
            rowNumber,
            fieldDef.field,
            'OUT_OF_RANGE',
            `${fieldDef.field} (${parsed}) is below minimum ${fieldDef.min}`,
            value
          ));
          hasError = true;
        }
        
        if (fieldDef.max !== undefined && parsed > fieldDef.max) {
          errors.push(createRowError(
            rowNumber,
            fieldDef.field,
            'OUT_OF_RANGE',
            `${fieldDef.field} (${parsed}) exceeds maximum ${fieldDef.max}`,
            value
          ));
          hasError = true;
        }
        
        // Update row with parsed value
        row[fieldDef.field] = parsed;
        
      } catch (error) {
        errors.push(createRowError(
          rowNumber,
          fieldDef.field,
          'PARSE_ERROR',
          error.message,
          value
        ));
        hasError = true;
      }
    });
    
    if (hasError) {
      invalidRows.push(row);
    } else {
      validRows.push(row);
    }
  });
  
  return { validRows, invalidRows, errors };
}