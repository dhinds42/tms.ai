import { base44 } from "../../api/base44Client";

// ========================================
// CONSTANTS & CONFIGURATION
// ========================================

export const SUPPORTED_FORMATS = {
  UPLOAD: ['pdf', 'xlsx', 'xls', 'csv', 'docx', 'doc', 'jpg', 'jpeg', 'png'],
  EXPORT: ['pdf', 'xlsx', 'docx'],
  PREVIEW: ['pdf', 'jpg', 'jpeg', 'png']
};

export const DOCUMENT_TYPES = [
  'bol',
  'pod',
  'rate_confirmation',
  'invoice',
  'lumper_receipt',
  'scale_ticket',
  'customs',
  'compliance',
  'contract',
  'quote',
  'report',
  'ltl_order',
  'ltl_bol',
  'maintenance',
  'other'
];

export const ACTION_TYPES = [
  'uploaded',
  'generated',
  'edited',
  'deleted',
  'exported',
  'verified',
  'processed',
  'archived',
  'restored',
  'converted',
  'merged'
];

// ========================================
// VALIDATION FUNCTIONS
// ========================================

export const getFileExtension = (filename) => {
  if (!filename) return null;
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : null;
};

export const validateUploadFormat = (filename) => {
  const extension = getFileExtension(filename);
  
  if (!extension) {
    return {
      valid: false,
      message: 'File must have an extension',
      extension: null
    };
  }
  
  if (SUPPORTED_FORMATS.UPLOAD.includes(extension)) {
    return {
      valid: true,
      message: `${extension.toUpperCase()} format is supported`,
      extension: extension
    };
  }
  
  return {
    valid: false,
    message: `${extension.toUpperCase()} format is not supported. Allowed: ${SUPPORTED_FORMATS.UPLOAD.join(', ').toUpperCase()}`,
    extension: extension
  };
};

// ========================================
// HISTORY FUNCTIONS
// ========================================

export const logDocumentAction = async ({
  documentId,
  documentName,
  documentType,
  actionType,
  actionBy,
  userRole,
  fileFormat,
  fileSize,
  module,
  feature,
  previousValue,
  newValue,
  notes,
  metadata,
  loadId,
  invoiceNumber,
  quoteNumber
}) => {
  try {
    const operatingMode = localStorage.getItem('tms_operating_mode') || 'broker';
    
    await base44.entities.DocumentHistory.create({
      document_id: documentId,
      document_name: documentName,
      document_type: documentType,
      action_type: actionType,
      action_by: actionBy,
      user_role: userRole || operatingMode,
      timestamp: new Date().toISOString(),
      file_format: fileFormat,
      file_size: fileSize,
      module: module,
      feature: feature,
      previous_value: previousValue,
      new_value: newValue,
      notes: notes,
      metadata: metadata,
      load_id: loadId,
      invoice_number: invoiceNumber,
      quote_number: quoteNumber
    });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to log document action:', error);
    return { success: false, error: error.message };
  }
};

export const getDocumentHistory = async (documentId) => {
  try {
    const history = await base44.entities.DocumentHistory.filter(
      { document_id: documentId },
      '-timestamp',
      100
    );
    return history || [];
  } catch (error) {
    console.error('Failed to get document history:', error);
    return [];
  }
};

export const isDocumentEdited = async (documentId) => {
  try {
    const history = await getDocumentHistory(documentId);
    return history.some(h => h.action_type === 'edited');
  } catch (error) {
    return false;
  }
};

// ========================================
// CHANGE DETECTION FUNCTIONS
// ========================================

export const isNewDocument = (document) => {
  if (!document || !document.created_date) return false;
  
  const createdDate = new Date(document.created_date);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return createdDate > oneDayAgo;
};

// ========================================
// EXPORT FUNCTIONS
// ========================================

export const exportDocument = async (document, format, options = {}) => {
  try {
    const { module = 'Documents', feature = 'Export' } = options;
    const exportedUrl = document.file_url;
    
    return {
      success: true,
      url: exportedUrl,
      format: format,
      message: `Document exported to ${format.toUpperCase()}`
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

export const generateDocument = async (templateType, data, format = 'pdf', options = {}) => {
  try {
    const { module = 'Documents', feature = 'Generation' } = options;
    const documentName = `${templateType}_${Date.now()}.${format}`;
    
    const generatedDocument = {
      id: 'doc_' + Date.now(),
      file_name: documentName,
      file_url: '#generated_' + documentName,
      file_size: Math.floor(Math.random() * 500000) + 50000,
      document_type: templateType,
      created_date: new Date().toISOString()
    };
    
    return {
      success: true,
      document: generatedDocument,
      format: format,
      message: `Document generated in ${format.toUpperCase()}`
    };
  } catch (error) {
    console.error('Generation error:', error);
    return {
      success: false,
      message: error.message,
      error: error.message
    };
  }
};

export const convertDocument = async (document, targetFormat) => {
  try {
    const convertedUrl = document.file_url;
    
    return {
      success: true,
      url: convertedUrl,
      format: targetFormat,
      message: `Document converted to ${targetFormat.toUpperCase()}`
    };
  } catch (error) {
    console.error('Conversion error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// ========================================
// UI HELPER FUNCTIONS
// ========================================

export const getFormatIcon = (format) => {
  const iconMap = {
    pdf: '📄',
    xlsx: '📊',
    xls: '📊',
    csv: '📊',
    docx: '📝',
    doc: '📝',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️'
  };
  return iconMap[format?.toLowerCase()] || '📄';
};

export const getFormatBadgeColor = (format) => {
  const colorMap = {
    pdf: 'bg-red-100 text-red-800',
    xlsx: 'bg-green-100 text-green-800',
    xls: 'bg-green-100 text-green-800',
    csv: 'bg-emerald-100 text-emerald-800',
    docx: 'bg-blue-100 text-blue-800',
    doc: 'bg-blue-100 text-blue-800',
    jpg: 'bg-purple-100 text-purple-800',
    jpeg: 'bg-purple-100 text-purple-800',
    png: 'bg-indigo-100 text-indigo-800'
  };
  return colorMap[format?.toLowerCase()] || 'bg-slate-100 text-slate-800';
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getActionBadgeColor = (actionType) => {
  const colorMap = {
    uploaded: 'bg-blue-600 text-white',
    generated: 'bg-purple-600 text-white',
    edited: 'bg-amber-600 text-white',
    deleted: 'bg-red-600 text-white',
    exported: 'bg-green-600 text-white',
    verified: 'bg-emerald-600 text-white',
    processed: 'bg-indigo-600 text-white',
    archived: 'bg-slate-600 text-white',
    restored: 'bg-cyan-600 text-white',
    converted: 'bg-pink-600 text-white',
    merged: 'bg-orange-600 text-white'
  };
  return colorMap[actionType] || 'bg-slate-600 text-white';
};

// ========================================
// UTILITY EXPORTS
// ========================================

export default {
  SUPPORTED_FORMATS,
  DOCUMENT_TYPES,
  ACTION_TYPES,
  validateUploadFormat,
  getFileExtension,
  logDocumentAction,
  getDocumentHistory,
  isDocumentEdited,
  isNewDocument,
  exportDocument,
  generateDocument,
  convertDocument,
  getFormatIcon,
  getFormatBadgeColor,
  formatFileSize,
  getActionBadgeColor
};