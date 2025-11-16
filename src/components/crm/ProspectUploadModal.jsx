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

Extract prospect information from the uploaded document (business card, intake form, notes, etc.).

EXTRACT:
1. Company name
2. Contact person name
3. Email
4. Phone number
5. Address (street, city, state, zip, country)
6. Website (if mentioned)
7. Industry or business type
8. Any notes or special requirements
9. Auto-tag based on keywords:
   - "shipper", "customer", "freight" → shipper
   - "carrier", "trucking", "fleet" → carrier
   - "vendor", "supplier", "parts" → vendor
   - "partner", "agent", "3pl" → partner

10. Determine data completeness:
    - Complete: Has name, company, and at least one contact method
    - Incomplete: Missing critical information

11. Extraction confidence (0-100) based on:
    - Document quality
    - Text clarity
    - Data completeness

Provide structured output for CRM database entry.`,
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
      ...extractedData,
      source: 'document_upload',
      status: 'intake',
      uploaded_by: user.email,
      is_active: true
    };

    createProspectMutation.mutate(prospectData);
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