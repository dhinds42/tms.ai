/**
 * Test: Document Checklist Server-Side Computation
 * Verifies billing_ready_percent is calculated correctly
 */

describe('Document Checklist Tests', () => {
  test('Billing ready percent computed on create', async () => {
    const checklist = await base44.entities.LoadDocumentChecklist.create({
      load_id: 'test_load_id',
      required_docs: ['bol', 'pod', 'rate_confirmation'],
      received_docs: [
        { doc_type: 'bol', document_id: 'doc1', verified: true }
      ]
    });

    expect(checklist.billing_ready_percent).toBe(33); // 1/3 = 33%
    expect(checklist.billing_ready).toBe(false);
    expect(checklist.doc_status_by_type).toEqual({
      bol: 'received',
      pod: 'pending',
      rate_confirmation: 'pending'
    });
  });

  test('Billing ready true when 100% complete', async () => {
    const checklist = await base44.entities.LoadDocumentChecklist.create({
      load_id: 'test_load_id',
      required_docs: ['bol', 'pod'],
      received_docs: [
        { doc_type: 'bol', document_id: 'doc1', verified: true },
        { doc_type: 'pod', document_id: 'doc2', verified: true }
      ]
    });

    expect(checklist.billing_ready_percent).toBe(100);
    expect(checklist.billing_ready).toBe(true);
  });

  test('Billing ready percent recalculated on update', async () => {
    const checklist = await base44.entities.LoadDocumentChecklist.create({
      load_id: 'test_load_id',
      required_docs: ['bol', 'pod', 'lumper_receipt'],
      received_docs: []
    });

    expect(checklist.billing_ready_percent).toBe(0);

    // Add documents
    const updated = await base44.entities.LoadDocumentChecklist.update(
      checklist.id,
      {
        received_docs: [
          { doc_type: 'bol', document_id: 'doc1', verified: true },
          { doc_type: 'pod', document_id: 'doc2', verified: true }
        ]
      }
    );

    expect(updated.billing_ready_percent).toBe(67); // 2/3 = 67%
    expect(updated.billing_ready).toBe(false);
  });

  test('Unverified documents do not count as received', async () => {
    const checklist = await base44.entities.LoadDocumentChecklist.create({
      load_id: 'test_load_id',
      required_docs: ['bol', 'pod'],
      received_docs: [
        { doc_type: 'bol', document_id: 'doc1', verified: false },
        { doc_type: 'pod', document_id: 'doc2', verified: true }
      ]
    });

    expect(checklist.doc_status_by_type.bol).toBe('invalid');
    expect(checklist.doc_status_by_type.pod).toBe('received');
    expect(checklist.billing_ready_percent).toBe(50); // Only pod counts
  });

  test('Audit log created when percent changes', async () => {
    const checklist = await base44.entities.LoadDocumentChecklist.create({
      load_id: 'test_load_id',
      required_docs: ['bol'],
      received_docs: []
    });

    await base44.entities.LoadDocumentChecklist.update(checklist.id, {
      received_docs: [{ doc_type: 'bol', document_id: 'doc1', verified: true }]
    });

    const auditLogs = await base44.entities.AuditLog.filter({
      entity_type: 'LoadDocumentChecklist',
      entity_id: checklist.id
    });

    expect(auditLogs.length).toBeGreaterThan(0);
    const log = auditLogs[0];
    expect(log.changed_fields.billing_ready_percent.from).toBe(0);
    expect(log.changed_fields.billing_ready_percent.to).toBe(100);
  });
});