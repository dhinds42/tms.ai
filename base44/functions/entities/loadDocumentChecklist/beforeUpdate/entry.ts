/**
 * LoadDocumentChecklist - Before Update Hook
 * Server-side computation of billing_ready_percent
 */

export default async function beforeUpdate({ id, data, base44 }) {
  // Fetch existing checklist
  const existing = await base44.entities.LoadDocumentChecklist.filter({ id });
  if (existing.length === 0) {
    return { ok: false, error: 'Checklist not found' };
  }
  const existingChecklist = existing[0];

  // Use existing required_docs if not provided
  const requiredDocs = data.required_docs || existingChecklist.required_docs;
  const receivedDocs = data.received_docs || existingChecklist.received_docs || [];

  // Build doc_status_by_type
  const docStatusByType = {};
  for (const docType of requiredDocs) {
    docStatusByType[docType] = 'pending';
  }

  for (const received of receivedDocs) {
    if (docStatusByType.hasOwnProperty(received.doc_type)) {
      docStatusByType[received.doc_type] = received.verified ? 'received' : 'invalid';
    }
  }

  // Compute billing_ready_percent
  const totalRequired = requiredDocs.length;
  const receivedCount = Object.values(docStatusByType).filter(status => status === 'received').length;
  const billingReadyPercent = totalRequired > 0 ? Math.round((receivedCount / totalRequired) * 100) : 0;

  data.doc_status_by_type = docStatusByType;
  data.billing_ready_percent = billingReadyPercent;
  data.billing_ready = billingReadyPercent === 100;
  data.last_computed_at = new Date().toISOString();

  // Audit log
  if (billingReadyPercent !== existingChecklist.billing_ready_percent) {
    await base44.entities.AuditLog.create({
      entity_type: 'LoadDocumentChecklist',
      entity_id: id,
      action: 'UPDATE',
      actor_email: 'system',
      actor_role: 'system',
      before_values: { billing_ready_percent: existingChecklist.billing_ready_percent },
      after_values: { billing_ready_percent: billingReadyPercent },
      changed_fields: { billing_ready_percent: { from: existingChecklist.billing_ready_percent, to: billingReadyPercent } }
    });
  }

  return { ok: true, data };
}