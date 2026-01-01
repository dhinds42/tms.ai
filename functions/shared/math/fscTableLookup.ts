/**
 * FSC Table Lookup - Async Resolution
 * Queries CustomerFSCTable and rows to resolve FSC charge
 */

/**
 * Resolve FSC from customer table (async version)
 * @param {object} base44 - Base44 client
 * @param {string} tableId - CustomerFSCTable ID
 * @param {number} fuelPrice - Current fuel price (for FUEL_PRICE basis)
 * @param {number} miles - Distance in miles (for DISTANCE_BAND basis)
 * @param {number} linehaulCents - Linehaul amount for percent calculations
 * @returns {Promise<{fsc_cents: number, line_item: object, explain: object}>}
 */
export async function resolveFSCFromTable(base44, tableId, fuelPrice, miles, linehaulCents) {
  try {
    // Load FSC table
    const tables = await base44.asServiceRole.entities.CustomerFSCTable.filter({ 
      id: tableId,
      is_active: true 
    });
    
    if (tables.length === 0) {
      throw new Error(`FSC Table ${tableId} not found`);
    }
    
    const table = tables[0];
    
    // Check if table is currently effective
    const now = new Date();
    const effectiveStart = new Date(table.effective_start);
    const effectiveEnd = table.effective_end ? new Date(table.effective_end) : null;
    
    if (now < effectiveStart || (effectiveEnd && now > effectiveEnd)) {
      throw new Error(`FSC Table not effective for current date`);
    }
    
    // Load all active rows for this table
    const rows = await base44.asServiceRole.entities.CustomerFSCTableRow.filter({
      fsc_table_id: tableId,
      is_active: true
    });
    
    if (rows.length === 0) {
      throw new Error(`No active rows found in FSC Table ${tableId}`);
    }
    
    // Find matching row based on basis_type
    let matchingRow = null;
    
    if (table.basis_type === 'FUEL_PRICE') {
      if (!fuelPrice) {
        throw new Error('Fuel price required for FUEL_PRICE basis table');
      }
      
      matchingRow = rows.find(row => 
        fuelPrice >= row.fuel_price_min && fuelPrice < row.fuel_price_max
      );
      
      if (!matchingRow) {
        throw new Error(`No FSC row found for fuel price $${fuelPrice}`);
      }
      
    } else if (table.basis_type === 'DISTANCE_BAND') {
      if (!miles) {
        throw new Error('Miles required for DISTANCE_BAND basis table');
      }
      
      matchingRow = rows.find(row => 
        miles >= row.miles_min && miles < row.miles_max
      );
      
      if (!matchingRow) {
        throw new Error(`No FSC row found for distance ${miles} miles`);
      }
    } else {
      throw new Error(`Unsupported basis_type: ${table.basis_type}`);
    }
    
    // Calculate FSC based on charge_type
    let fsc_cents = 0;
    let description = '';
    let quantity = 1;
    let unit_type = 'load';
    let rate_cents = 0;
    
    if (table.charge_type === 'CPM_CENTS') {
      fsc_cents = (matchingRow.cpm_cents || 0) * (miles || 0);
      description = `FSC (${matchingRow.cpm_cents}¢/mi)`;
      quantity = miles;
      unit_type = 'miles';
      rate_cents = matchingRow.cpm_cents;
      
    } else if (table.charge_type === 'PERCENT_BPS') {
      fsc_cents = Math.round((linehaulCents * (matchingRow.percent_bps || 0)) / 10000);
      description = `FSC (${((matchingRow.percent_bps || 0) / 100).toFixed(2)}% of linehaul)`;
      rate_cents = fsc_cents;
      
    } else if (table.charge_type === 'FLAT_CENTS') {
      fsc_cents = matchingRow.flat_cents || 0;
      description = `FSC (Flat)`;
      rate_cents = fsc_cents;
      
    } else {
      throw new Error(`Unsupported charge_type: ${table.charge_type}`);
    }
    
    return {
      fsc_cents,
      line_item: {
        line_type: 'fuel_surcharge',
        description,
        quantity,
        unit_type,
        rate_cents,
        amount_cents: fsc_cents
      },
      explain: {
        table_id: tableId,
        table_name: table.name,
        basis_type: table.basis_type,
        charge_type: table.charge_type,
        matched_row_id: matchingRow.id,
        basis_value: table.basis_type === 'FUEL_PRICE' ? fuelPrice : miles,
        computed_fsc_cents: fsc_cents
      }
    };
    
  } catch (error) {
    return {
      fsc_cents: 0,
      line_item: {
        line_type: 'fuel_surcharge',
        description: `FSC Error: ${error.message}`,
        quantity: 1,
        unit_type: 'load',
        rate_cents: 0,
        amount_cents: 0
      },
      explain: {
        error: error.message
      }
    };
  }
}

/**
 * Get current DOE fuel price (simplified - would integrate with DOEFuelPrice entity)
 */
export async function getCurrentFuelPrice(base44) {
  try {
    const prices = await base44.asServiceRole.entities.DOEFuelPrice.list('-week_of', 1);
    if (prices.length > 0) {
      return prices[0].us_avg;
    }
    return 3.50; // Fallback default
  } catch (error) {
    return 3.50; // Fallback default
  }
}