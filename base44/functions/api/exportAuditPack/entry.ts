/**
 * Export Audit Pack
 * Generates comprehensive audit bundle for compliance/procurement
 */

export default async function exportAuditPack({ data, user, base44 }) {
  try {
    const { org_id, date_range_start, date_range_end, entity_ids, pack_type, redaction_level } = data;
    
    if (!org_id || !date_range_start || !date_range_end) {
      return {
        ok: false,
        error: 'Missing required fields: org_id, date_range_start, date_range_end'
      };
    }
    
    const packNumber = `AUDIT-${Date.now()}`;
    
    // Create audit pack record
    const auditPack = await base44.asServiceRole.entities.AuditPack.create({
      org_id,
      pack_number: packNumber,
      pack_type: pack_type || 'INTERNAL_AUDIT',
      date_range_start,
      date_range_end,
      entity_filters: { entity_ids: entity_ids || [] },
      generated_by: user.email,
      generated_at: new Date().toISOString(),
      status: 'GENERATING',
      redaction_level: redaction_level || 'NONE',
      export_format: 'JSON',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    });
    
    const packData = {};
    const recordCounts = {};
    
    // 1. Approval Requests
    const approvals = await base44.asServiceRole.entities.ApprovalRequest.filter({
      org_id,
      requested_at: { $gte: date_range_start, $lte: date_range_end }
    });
    packData.approval_requests = approvals;
    recordCounts.approval_requests = approvals.length;
    
    // 2. Audit Logs
    const auditLogs = await base44.asServiceRole.entities.AuditLog.filter({
      created_date: { $gte: date_range_start, $lte: date_range_end }
    });
    packData.audit_logs = auditLogs.slice(0, 1000); // Limit to 1000 most recent
    recordCounts.audit_logs = auditLogs.length;
    
    // 3. Quotes with pricing snapshots
    const quotes = await base44.asServiceRole.entities.Quote.filter({
      created_date: { $gte: date_range_start, $lte: date_range_end }
    });
    packData.quotes = quotes.map(q => ({
      quote_number: q.quote_number,
      quote_id: q.id,
      computed_total_cents: q.computed_total_cents,
      itemized_charges_json: q.itemized_charges_json,
      explain_calculation_json: q.explain_calculation_json,
      pricing_snapshot_version: q.pricing_snapshot_version,
      created_date: q.created_date
    }));
    recordCounts.quotes = quotes.length;
    
    // 4. Invoices with pricing snapshots
    const invoices = await base44.asServiceRole.entities.Invoice.filter({
      invoice_date: { $gte: date_range_start, $lte: date_range_end }
    });
    packData.invoices = invoices.map(inv => ({
      invoice_number: inv.invoice_number,
      invoice_id: inv.id,
      quote_id: inv.quote_id,
      computed_total_cents: inv.computed_total_cents,
      itemized_charges_json: inv.itemized_charges_json,
      explain_calculation_json: inv.explain_calculation_json,
      variance_cents: inv.variance_cents,
      variance_reason: inv.variance_reason,
      invoice_date: inv.invoice_date,
      status: inv.status
    }));
    recordCounts.invoices = invoices.length;
    
    // 5. Variance Cases
    const varianceCases = await base44.asServiceRole.entities.VarianceCase.filter({
      created_date: { $gte: date_range_start, $lte: date_range_end }
    });
    packData.variance_cases = varianceCases;
    recordCounts.variance_cases = varianceCases.length;
    
    // 6. Chargebacks
    const chargebacks = await base44.asServiceRole.entities.Chargeback.filter({
      initiated_at: { $gte: date_range_start, $lte: date_range_end }
    });
    packData.chargebacks = chargebacks;
    recordCounts.chargebacks = chargebacks.length;
    
    // 7. Invoice Line Items
    const invoiceLineItems = await base44.asServiceRole.entities.InvoiceLineItem.filter({
      created_date: { $gte: date_range_start, $lte: date_range_end }
    });
    packData.invoice_line_items = invoiceLineItems;
    recordCounts.invoice_line_items = invoiceLineItems.length;
    
    // Generate JSON export
    const exportData = {
      audit_pack_number: packNumber,
      generated_at: new Date().toISOString(),
      generated_by: user.email,
      date_range: { start: date_range_start, end: date_range_end },
      org_id,
      record_counts: recordCounts,
      data: packData
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    
    // In production, upload to storage
    // For now, return as data URL
    const fileUrl = `data:application/json;base64,${Buffer.from(jsonContent).toString('base64')}`;
    
    // Update audit pack
    await base44.asServiceRole.entities.AuditPack.update(auditPack.id, {
      status: 'READY',
      file_url: fileUrl,
      file_size_bytes: jsonContent.length,
      record_counts: recordCounts
    });
    
    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'AuditPack',
      entity_id: auditPack.id,
      action: 'CREATE',
      actor_email: user.email,
      actor_role: user.role,
      metadata: {
        pack_number: packNumber,
        record_counts: recordCounts,
        date_range: { start: date_range_start, end: date_range_end }
      }
    });
    
    return {
      ok: true,
      audit_pack_id: auditPack.id,
      pack_number: packNumber,
      file_url: fileUrl,
      record_counts: recordCounts
    };
    
  } catch (error) {
    console.error('Audit pack export error:', error);
    return {
      ok: false,
      error: error.message
    };
  }
}