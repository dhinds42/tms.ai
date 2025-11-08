import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, AlertTriangle, Loader2, X } from "lucide-react";

export default function DataBotProcessor({ document, onProcessComplete, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    processDocument();
  }, [document]);

  const processDocument = async () => {
    setIsProcessing(true);
    setError(null);
    setExtractedData(null);

    try {
      // Determine the schema based on document type
      const schemas = {
        bol: {
          type: "object",
          properties: {
            shipper_name: { type: "string" },
            consignee_name: { type: "string" },
            pickup_address: { type: "string" },
            delivery_address: { type: "string" },
            pickup_date: { type: "string" },
            delivery_date: { type: "string" },
            commodity: { type: "string" },
            weight: { type: "number" },
            pieces: { type: "number" },
            bol_number: { type: "string" }
          }
        },
        pod: {
          type: "object",
          properties: {
            delivery_date: { type: "string" },
            delivery_time: { type: "string" },
            receiver_name: { type: "string" },
            receiver_signature: { type: "string" },
            condition_notes: { type: "string" },
            pieces_delivered: { type: "number" }
          }
        },
        rate_confirmation: {
          type: "object",
          properties: {
            carrier_name: { type: "string" },
            rate_amount: { type: "number" },
            pickup_location: { type: "string" },
            delivery_location: { type: "string" },
            equipment_type: { type: "string" },
            special_instructions: { type: "string" }
          }
        },
        invoice: {
          type: "object",
          properties: {
            invoice_number: { type: "string" },
            invoice_date: { type: "string" },
            due_date: { type: "string" },
            total_amount: { type: "number" },
            customer_name: { type: "string" },
            line_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  amount: { type: "number" }
                }
              }
            }
          }
        }
      };

      const schema = schemas[document.document_type] || {
        type: "object",
        properties: {
          extracted_text: { type: "string" },
          key_information: { type: "string" }
        }
      };

      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: document.file_url,
        json_schema: schema
      });

      if (result.status === 'success') {
        setExtractedData(result.output);
      } else {
        setError(result.details || 'Failed to extract data from document');
      }

    } catch (err) {
      setError(err.message || 'An error occurred while processing the document');
      console.error('DataBot processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (extractedData) {
      onProcessComplete(extractedData);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="border-b border-indigo-200 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                DataBot: AI Document Processor
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Automatically extracting data from {document.file_name}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        {isProcessing && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600 font-medium">
              DataBot is analyzing your document...
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Using AI to extract structured data
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Processing Error</h3>
                <p className="text-sm text-red-700">{error}</p>
                <Button
                  onClick={processDocument}
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-300 text-red-700"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {extractedData && !isProcessing && (
          <div className="space-y-4">
            
            {/* Success Message */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900 mb-1">
                    Data Extracted Successfully
                  </h3>
                  <p className="text-sm text-emerald-700">
                    Review the extracted data below and save to attach it to this document
                  </p>
                </div>
              </div>
            </div>

            {/* Extracted Data */}
            <div className="p-4 bg-white rounded-xl border border-indigo-200">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Extracted Information
              </h4>
              <div className="space-y-3">
                {Object.entries(extractedData).map(([key, value]) => (
                  <div key={key} className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-slate-900">
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Extracted Data
              </Button>
              <Button
                onClick={processDocument}
                variant="outline"
              >
                Re-process
              </Button>
            </div>

          </div>
        )}

      </CardContent>
    </Card>
  );
}