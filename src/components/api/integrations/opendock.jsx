// src/api/integrations/opendock.js
import { base44 } from "@/api/base44Client";

export async function opendockUploadDocument({ loadId, documentUrl, documentType }) {
  // Backend function:
  // - reads org-scoped secrets
  // - authenticates to Opendock server-side
  // - validates load belongs to org
  // - performs upload
  return base44.functions.opendockUploadDocument({
    load_id: loadId,
    document_url: documentUrl,
    document_type: documentType,
  });
}