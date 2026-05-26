/**
 * LoadDocumentChecklist - Before Create Hook
 * Initialize billing readiness calculations
 */

export default async function beforeCreate({ data, base44 }) {
  const requiredDocs = data.required_docs || [];
  const receivedDocs = data.received_docs || [];

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

  return { ok: true, data };
}