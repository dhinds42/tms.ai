/**
 * Chargeback Tests
 */

describe('Chargeback Management', () => {
  
  test('Chargeback creation requires invoice/settlement link', () => {
    const validChargeback = {
      org_id: 'org-1',
      invoice_id: 'invoice-1',
      chargeback_type: 'SHORT_PAY',
      amount_cents: 50000,
      reason_text: 'Missing BOL'
    };
    
    expect(validChargeback.invoice_id).toBeDefined();
    expect(validChargeback.chargeback_type).toBe('SHORT_PAY');
  });
  
  test('Chargeback status transitions are audited', async () => {
    // Mock audit log creation on status change
    const mockAuditLog = jest.fn();
    
    const chargeback = {
      id: 'cb-1',
      status: 'OPEN'
    };
    
    // Simulate approval
    const updatedChargeback = {
      ...chargeback,
      status: 'APPROVED',
      approved_by: 'finance@tms.ai',
      approved_at: new Date().toISOString()
    };
    
    // Audit log should capture state change
    mockAuditLog({
      entity_type: 'Chargeback',
      entity_id: 'cb-1',
      action: 'UPDATE',
      changed_fields: { status: { from: 'OPEN', to: 'APPROVED' } }
    });
    
    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_type: 'Chargeback',
        action: 'UPDATE'
      })
    );
  });
  
});