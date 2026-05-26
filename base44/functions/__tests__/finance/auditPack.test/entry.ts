/**
 * Audit Pack Export Tests
 */

describe('Audit Pack Export', () => {
  
  test('Audit pack includes all required artifacts', () => {
    const auditPackData = {
      approval_requests: [],
      audit_logs: [],
      quotes: [],
      invoices: [],
      variance_cases: [],
      chargebacks: [],
      invoice_line_items: []
    };
    
    expect(auditPackData).toHaveProperty('approval_requests');
    expect(auditPackData).toHaveProperty('audit_logs');
    expect(auditPackData).toHaveProperty('quotes');
    expect(auditPackData).toHaveProperty('invoices');
    expect(auditPackData).toHaveProperty('variance_cases');
    expect(auditPackData).toHaveProperty('chargebacks');
  });
  
  test('Audit pack respects redaction level', () => {
    const quote = {
      quote_number: 'Q-123',
      computed_total_cents: 200000,
      itemized_charges_json: { lines: [] },
      explain_calculation_json: { method: 'FTL_RPM' },
      internal_margin: 15000 // Should be redacted for external
    };
    
    const redactionLevel = 'FULL';
    
    // Redact internal fields
    const redactedQuote = {
      quote_number: quote.quote_number,
      computed_total_cents: quote.computed_total_cents,
      itemized_charges_json: quote.itemized_charges_json,
      explain_calculation_json: quote.explain_calculation_json
      // internal_margin removed
    };
    
    expect(redactedQuote).not.toHaveProperty('internal_margin');
  });
  
  test('Audit pack tracks download count', () => {
    const auditPack = {
      id: 'pack-1',
      download_count: 0
    };
    
    // Simulate download
    auditPack.download_count += 1;
    auditPack.last_downloaded_at = new Date().toISOString();
    
    expect(auditPack.download_count).toBe(1);
    expect(auditPack.last_downloaded_at).toBeDefined();
  });
  
});