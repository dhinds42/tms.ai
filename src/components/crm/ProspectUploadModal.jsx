import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  Image,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Copy
} from "lucide-react";

export default function ProspectUploadModal({ onClose }) {
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const queryClient = useQueryClient();

  const createProspectMutation = useMutation({
    mutationFn: (data) => base44.entities.Prospect.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      alert('✅ Prospect created successfully!');
      onClose();
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadedFile(file);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Extract data using AI
      setExtracting(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a CRM data extraction AI for a Transportation Management System.

DOCUMENT TYPE: This may be a business card, intake form, vendor directory, RV park listing, supplier sheet, or handwritten notes.

EXTRACTION INSTRUCTIONS:
1. **OCR Scan**: Extract all text from the document, handling multi-column layouts and structured data
2. **Field Detection**: Identify and extract the following fields:
   - Prospect/Company Name
   - Contact Person Name (if different from company)
   - Location (City, State, ZIP, Full Address if available)
   - Phone Number(s) - normalize format to (XXX) XXX-XXXX
   - Email Address - validate format
   - Website URL
   - Services Offered (amenities, capabilities, specialties)
   - Industry/Type (RV Park, Vendor, Shipper, Carrier, etc.)
   - Any special notes or requirements

3. **Data Normalization**:
   - Format phone numbers consistently
   - Validate email addresses
   - Standardize location formats
   - Extract multiple services as array

4. **Auto-Tagging** based on keywords:
   - "shipper", "customer", "freight", "manufacturer" → shipper
   - "carrier", "trucking", "fleet", "hauling" → carrier
   - "vendor", "supplier", "parts", "equipment" → vendor
   - "partner", "agent", "3pl", "broker" → partner
   - "rv park", "campground", "resort" → vendor
   - Add service-specific tags (e.g., "full-hookup", "wifi", "palletized-goods")

5. **Data Quality Assessment**:
   - Complete: Has name AND location AND at least one contact method
   - Incomplete: Missing critical fields (flag for review)
   - Extraction confidence (0-100) based on document quality and text clarity

6. **Handle Unreadable Data**:
   - Flag fields that couldn't be extracted
   - Mark document as "requires_review" if confidence < 70%

7. **Structure Detection**: For directory-style documents with multiple entries, extract the FIRST entry only and note if multiple entries detected.

Provide structured output ready for CRM database entry.`,
        file_urls: file_url,
        response_json_schema: {
          type: "object",
          properties: {
            company_name: { type: "string" },
            contact_name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zip: { type: "string" },
                country: { type: "string" }
              }
            },
            website: { type: "string" },
            industry: { type: "string" },
            services_offered: {
              type: "array",
              items: { type: "string" }
            },
            notes: { type: "string" },
            prospect_type: { 
              type: "string",
              enum: ["shipper", "carrier", "vendor", "partner", "other"]
            },
            tags: {
              type: "array",
              items: { type: "string" }
            },
            data_complete: { type: "boolean" },
            requires_review: { type: "boolean" },
            extraction_confidence: { type: "number" },
            unreadable_fields: {
              type: "array",
              items: { type: "string" }
            },
            multiple_entries_detected: { type: "boolean" },
            extracted_insights: { type: "string" }
          }
        }
      });

      // Check for duplicates
      const existingProspects = await base44.entities.Prospect.list('-created_date', 1000);
      const duplicate = existingProspects.find(p => 
        (p.email && result.email && p.email.toLowerCase() === result.email.toLowerCase()) ||
        (p.phone && result.phone && p.phone === result.phone) ||
        (p.company_name && result.company_name && 
         p.company_name.toLowerCase() === result.company_name.toLowerCase())
      );

      if (duplicate) {
        result.is_duplicate = true;
        result.duplicate_of = duplicate.id;
        result.duplicate_warning = `Possible duplicate of ${duplicate.company_name || duplicate.contact_name}`;
      }

      setExtractedData(result);
      setEditedData(result); // Initialize editable copy

    } catch (error) {
      console.error('Upload/extraction error:', error);
      alert('Failed to process document');
      onClose();
    } finally {
      setUploading(false);
      setExtracting(false);
    }
  };

  const handleSaveProspect = async () => {
    const user = await base44.auth.me();

    const prospectData = {
      ...editedData, // Use edited data instead of original extraction
      source: 'document_upload',
      status: 'intake',
      uploaded_by: user.email,
      is_active: true
    };

    createProspectMutation.mutate(prospectData);
  };

  const handleFieldEdit = (field, value) => {
    setEditedData({
      ...editedData,
      [field]: value
    });
  };

  const handleAddressEdit = (addressField, value) => {
    setEditedData({
      ...editedData,
      address: {
        ...editedData.address,
        [addressField]: value
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            AI Prospect Intake - Document Upload
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          
          {/* Upload Section */}
          {!extractedData && (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={uploading || extracting}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {uploading || extracting ? (
                  <div className="space-y-4">
                    <Loader2 className="w-16 h-16 text-purple-600 mx-auto animate-spin" />
                    <p className="text-lg font-semibold text-slate-900">
                      {uploading ? 'Uploading document...' : 'Extracting prospect data with AI...'}
                    </p>
                    <p className="text-sm text-slate-600">
                      This may take a few moments
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 text-purple-600 mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-slate-900 mb-2">
                        Upload Prospect Document
                      </p>
                      <p className="text-sm text-slate-600">
                        Business cards, intake forms, handwritten notes, or scanned documents
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Supports PDF, JPG, PNG, DOC, DOCX
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          )}

          {/* Extracted Data Preview */}
          {extractedData && (
            <div className="space-y-6">
              
              {/* Header with Confidence */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-slate-900">Data Extracted Successfully</h3>
                    <p className="text-sm text-slate-600">AI confidence: {extractedData.extraction_confidence}%</p>
                  </div>
                </div>
                <Badge className={`${
                  extractedData.data_complete 
                    ? 'bg-emerald-600' 
                    : 'bg-amber-600'
                }`}>
                  {extractedData.data_complete ? 'Complete' : 'Needs Review'}
                </Badge>
              </div>

              {/* Duplicate Warning */}
              {extractedData.is_duplicate && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-3">
                  <Copy className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900">Possible Duplicate Detected</h4>
                    <p className="text-sm text-amber-800">{extractedData.duplicate_warning}</p>
                  </div>
                </div>
              )}

              {/* Extracted Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 mb-1">COMPANY NAME</p>
                  <p className="text-slate-900 font-medium">
                    {extractedData.company_name || 'Not found'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 mb-1">CONTACT NAME</p>
                  <p className="text-slate-900 font-medium">
                    {extractedData.contact_name || 'Not found'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 mb-1">EMAIL</p>
                  <p className="text-slate-900 font-medium">
                    {extractedData.email || 'Not found'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 mb-1">PHONE</p>
                  <p className="text-slate-900 font-medium">
                    {extractedData.phone || 'Not found'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 mb-1">PROSPECT TYPE</p>
                  <Badge className="mt-1 capitalize">
                    {extractedData.prospect_type}
                  </Badge>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 mb-1">INDUSTRY</p>
                  <p className="text-slate-900 font-medium">
                    {extractedData.industry || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Address */}
              {extractedData.address && (extractedData.address.street || extractedData.address.city) && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 mb-2">ADDRESS</p>
                  <p className="text-slate-900">
                    {extractedData.address.street && <>{extractedData.address.street}<br /></>}
                    {extractedData.address.city && <>{extractedData.address.city}, </>}
                    {extractedData.address.state} {extractedData.address.zip}
                  </p>
                </div>
              )}

              {/* Tags */}
              {extractedData.tags && extractedData.tags.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 mb-2">AUTO-TAGS</p>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.tags.map((tag, idx) => (
                      <Badge key={idx} className="bg-purple-100 text-purple-800">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {extractedData.notes && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 mb-2">EXTRACTED NOTES</p>
                  <p className="text-sm text-slate-900">{extractedData.notes}</p>
                </div>
              )}

              {/* Insights */}
              {extractedData.extracted_insights && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <p className="text-xs font-semibold text-purple-900">AI INSIGHTS</p>
                  </div>
                  <p className="text-sm text-purple-800">{extractedData.extracted_insights}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveProspect}
                  disabled={createProspectMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                >
                  {createProspectMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Prospect to Intake
                    </>
                  )}
                </Button>
                <Button onClick={onClose} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}