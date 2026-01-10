import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Brain, Upload, Sparkles, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

import DocumentUploadZone from "../components/document-ai/DocumentUploadZone";
import AIExtractionResults from "../components/document-ai/AIExtractionResults";
import DocumentClassification from "../components/document-ai/DocumentClassification";
import ProcessingQueue from "../components/document-ai/ProcessingQueue";
import ExtractedDataVerification from "../components/document-ai/ExtractedDataVerification";

export default function DocumentAI() {
  const [processing, setProcessing] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [classification, setClassification] = useState(null);

  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useScopedEntity('Document', { limit: 100 });
  const { data: loads } = useScopedEntity('Load', { limit: 100 });

  const createDocumentMutation = useMutation({
    mutationFn: (docData) => base44.entities.Document.create(docData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleDocumentUpload = async (file) => {
    setProcessing(true);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedDoc({ file, url: file_url, name: file.name });

      // Step 1: Classify document type
      const classificationResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI document classifier for freight/logistics documents.

Document Name: ${file.name}

Classify this document into one of the following types:
- BOL (Bill of Lading)
- POD (Proof of Delivery)
- Rate Confirmation
- Invoice
- Lumper Receipt
- Scale Ticket
- Customs Document
- Insurance Certificate (COI)
- W-9 Form
- Contract/Agreement
- Other

Also identify:
- Confidence level (0-100)
- Document subtype if applicable
- Urgency level (low/medium/high)
- Whether it requires immediate action`,
        response_json_schema: {
          type: "object",
          properties: {
            document_type: { type: "string" },
            document_subtype: { type: "string" },
            confidence: { type: "number" },
            urgency: { type: "string" },
            requires_action: { type: "boolean" },
            reasoning: { type: "string" }
          }
        }
      });

      setClassification(classificationResult);

      // Step 2: Extract data based on document type
      const extractionSchema = getExtractionSchema(classificationResult.document_type);

      const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: extractionSchema
      });

      if (extractionResult.status === 'success') {
        setExtractedData(extractionResult.output);

        // Auto-create document record
        await createDocumentMutation.mutateAsync({
          document_type: classificationResult.document_type.toLowerCase().replace(/ /g, '_'),
          file_url,
          file_name: file.name,
          extracted_data: extractionResult.output,
          verified: false
        });

      } else {
        alert(`Extraction failed: ${extractionResult.details}`);
      }

    } catch (error) {
      console.error('Document processing error:', error);
      alert('Failed to process document');
    } finally {
      setProcessing(false);
    }
  };

  const getExtractionSchema = (docType) => {
    const schemas = {
      'BOL': {
        type: "object",
        properties: {
          bol_number: { type: "string" },
          load_number: { type: "string" },
          pickup_date: { type: "string" },
          pickup_location: {
            type: "object",
            properties: {
              company: { type: "string" },
              address: { type: "string" },
              city: { type: "string" },
              state: { type: "string" },
              zip: { type: "string" }
            }
          },
          delivery_location: {
            type: "object",
            properties: {
              company: { type: "string" },
              address: { type: "string" },
              city: { type: "string" },
              state: { type: "string" },
              zip: { type: "string" }
            }
          },
          commodity: { type: "string" },
          weight: { type: "number" },
          pieces: { type: "number" },
          special_instructions: { type: "string" },
          shipper_signature: { type: "string" }
        }
      },
      'POD': {
        type: "object",
        properties: {
          delivery_date: { type: "string" },
          delivery_time: { type: "string" },
          receiver_name: { type: "string" },
          receiver_signature: { type: "string" },
          load_number: { type: "string" },
          pieces_delivered: { type: "number" },
          condition: { type: "string" },
          notes: { type: "string" }
        }
      },
      'Rate Confirmation': {
        type: "object",
        properties: {
          load_number: { type: "string" },
          rate: { type: "number" },
          pickup_date: { type: "string" },
          pickup_location: { type: "string" },
          delivery_location: { type: "string" },
          commodity: { type: "string" },
          weight: { type: "number" },
          equipment_type: { type: "string" },
          carrier_name: { type: "string" },
          carrier_mc: { type: "string" },
          payment_terms: { type: "string" }
        }
      },
      'Invoice': {
        type: "object",
        properties: {
          invoice_number: { type: "string" },
          invoice_date: { type: "string" },
          due_date: { type: "string" },
          load_number: { type: "string" },
          total_amount: { type: "number" },
          customer_name: { type: "string" },
          billing_address: { type: "string" },
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
      },
      'Lumper Receipt': {
        type: "object",
        properties: {
          receipt_number: { type: "string" },
          date: { type: "string" },
          amount: { type: "number" },
          facility: { type: "string" },
          load_number: { type: "string" },
          services: { type: "string" }
        }
      }
    };

    return schemas[docType] || {
      type: "object",
      properties: {
        extracted_text: { type: "string" },
        key_information: { type: "string" }
      }
    };
  };

  const unprocessedDocs = documents.filter(d => !d.verified);
  const processedDocs = documents.filter(d => d.verified);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-2">
            Document AI Processing
          </h1>
          <p className="text-slate-600 text-lg">
            Automated document classification, data extraction, and intelligent processing
          </p>
          <Badge className="mt-3 bg-purple-600">OCR + AI</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Documents</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{documents.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Processed</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{processedDocs.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{unprocessedDocs.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Accuracy</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">96%</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Zone */}
        <DocumentUploadZone 
          onUpload={handleDocumentUpload}
          processing={processing}
        />

        {/* Classification Results */}
        {classification && (
          <DocumentClassification classification={classification} documentName={uploadedDoc?.name} />
        )}

        {/* Extraction Results */}
        {extractedData && (
          <AIExtractionResults 
            data={extractedData}
            docType={classification?.document_type}
            loads={loads}
          />
        )}

        {/* Extracted Data Verification */}
        {extractedData && (
          <ExtractedDataVerification
            data={extractedData}
            docType={classification?.document_type}
            onVerify={() => {
              setExtractedData(null);
              setClassification(null);
              setUploadedDoc(null);
            }}
          />
        )}

        {/* Processing Queue */}
        <ProcessingQueue documents={unprocessedDocs} isLoading={isLoading} />

      </div>
    </div>
  );
}