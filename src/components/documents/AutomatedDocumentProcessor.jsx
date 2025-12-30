import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2, Brain } from "lucide-react";

export default function AutomatedDocumentProcessor({ loadId }) {
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const queryClient = useQueryClient();

  const createDocumentMutation = useMutation({
    mutationFn: (docData) => base44.entities.Document.create(docData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProcessing(true);
    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url });

      // Auto-classify and extract data
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this document and extract key information:

Document: ${file.name}

Determine:
1. Document type (BOL, POD, Rate Confirmation, Invoice, Insurance, etc.)
2. Extract all relevant data based on document type
3. Identify any issues or missing information
4. Confidence score (0-100)`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            document_type: { 
              type: "string",
              enum: ["bol", "pod", "rate_confirmation", "invoice", "insurance", "lumper_receipt", "scale_ticket", "other"]
            },
            confidence: { type: "number" },
            extracted_data: {
              type: "object",
              properties: {
                load_number: { type: "string" },
                shipper: { type: "string" },
                consignee: { type: "string" },
                pickup_date: { type: "string" },
                delivery_date: { type: "string" },
                amount: { type: "number" },
                weight: { type: "number" },
                pieces: { type: "number" }
              }
            },
            issues: { type: "array", items: { type: "string" } },
            next_actions: { type: "array", items: { type: "string" } }
          }
        }
      });

      setExtractedData(result);

      // Auto-save document
      await createDocumentMutation.mutateAsync({
        load_id: loadId,
        document_type: result.document_type,
        file_url,
        file_name: file.name,
        extracted_data: result.extracted_data,
        verified: result.confidence >= 90,
        uploaded_by: 'system'
      });

    } catch (error) {
      console.error('Document processing error:', error);
      alert('Failed to process document');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Document Processor
          <Badge className="ml-auto bg-purple-600">Auto</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Upload Zone */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="doc-upload"
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={processing}
          />
          <label htmlFor="doc-upload" className="cursor-pointer">
            {processing ? (
              <>
                <Loader2 className="w-12 h-12 text-purple-600 mx-auto mb-3 animate-spin" />
                <p className="text-sm font-medium text-slate-700">Processing document...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Drop file or click to upload</p>
                <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG supported</p>
              </>
            )}
          </label>
        </div>

        {/* Extracted Data */}
        {extractedData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">{uploadedFile.name}</span>
              </div>
              {extractedData.confidence >= 90 ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Document Type:</span>
                <span className="font-semibold text-slate-900 uppercase">{extractedData.document_type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Confidence:</span>
                <span className="font-semibold text-slate-900">{extractedData.confidence}%</span>
              </div>
            </div>

            {/* Extracted Fields */}
            {extractedData.extracted_data && Object.keys(extractedData.extracted_data).length > 0 && (
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-xs font-semibold text-emerald-900 uppercase mb-2">Extracted Data</p>
                <div className="space-y-1">
                  {Object.entries(extractedData.extracted_data).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-emerald-700">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-medium text-emerald-900">{value}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Issues */}
            {extractedData.issues?.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-xs font-semibold text-amber-900 uppercase mb-2">⚠ Issues Found</p>
                {extractedData.issues.map((issue, i) => (
                  <p key={i} className="text-xs text-amber-700">• {issue}</p>
                ))}
              </div>
            )}

            {/* Next Actions */}
            {extractedData.next_actions?.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 uppercase mb-2">Next Actions</p>
                {extractedData.next_actions.map((action, i) => (
                  <p key={i} className="text-xs text-blue-700">• {action}</p>
                ))}
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}