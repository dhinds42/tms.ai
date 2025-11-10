
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Sparkles, CheckCircle, Loader2, Brain, Zap } from "lucide-react";
import { logDocumentAction } from "@/utils/documentFormatHandler.js";

import AIDocumentUpload from "../components/document-processor/AIDocumentUpload";
import ProcessingQueue from "../components/document-processor/ProcessingQueue";
import ExtractedDataReview from "../components/document-processor/ExtractedDataReview";
import DocumentInsights from "../components/document-processor/DocumentInsights";

export default function DocumentProcessor() {
  const [processingDoc, setProcessingDoc] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date', 100),
    initialData: [],
  });

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (documentData) => {
      const doc = await base44.entities.Document.create(documentData);
      
      // Log upload action
      const user = await base44.auth.me();
      await logDocumentAction({
        documentId: doc.id,
        documentName: documentData.file_name,
        documentType: documentData.document_type,
        actionType: 'uploaded',
        actionBy: user.email,
        fileSize: documentData.file_size,
        module: 'Document Processor',
        feature: 'AI Document Upload',
        notes: 'Document uploaded for AI processing'
      });
      
      return doc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const updated = await base44.entities.Document.update(id, data);
      
      // Log processing action
      const user = await base44.auth.me();
      await logDocumentAction({
        documentId: id,
        documentName: updated.file_name,
        documentType: updated.document_type,
        actionType: 'processed',
        actionBy: user.email,
        module: 'Document Processor',
        feature: 'AI Data Extraction',
        notes: 'Document processed with AI data extraction',
        loadId: updated.load_id
      });
      
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const processDocument = async (document) => {
    setProcessingDoc(document);
    
    try {
      // Define schema based on document type
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
            bol_number: { type: "string" },
            pro_number: { type: "string" }
          }
        },
        pod: {
          type: "object",
          properties: {
            delivery_date: { type: "string" },
            receiver_name: { type: "string" },
            receiver_signature: { type: "string" },
            delivery_notes: { type: "string" },
            pod_number: { type: "string" }
          }
        },
        rate_confirmation: {
          type: "object",
          properties: {
            broker_name: { type: "string" },
            carrier_name: { type: "string" },
            rate: { type: "number" },
            pickup_location: { type: "string" },
            delivery_location: { type: "string" },
            equipment_type: { type: "string" },
            pickup_date: { type: "string" },
            delivery_date: { type: "string" }
          }
        },
        invoice: {
          type: "object",
          properties: {
            invoice_number: { type: "string" },
            invoice_date: { type: "string" },
            due_date: { type: "string" },
            amount: { type: "number" },
            shipper_name: { type: "string" },
            load_number: { type: "string" }
          }
        }
      };

      const schema = schemas[document.document_type] || schemas.bol;

      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: document.file_url,
        json_schema: schema
      });

      if (result.status === 'success') {
        setExtractedData({
          document,
          data: result.output
        });
        
        // Auto-save extracted data (this will trigger history logging in mutation)
        updateDocumentMutation.mutate({
          id: document.id,
          data: {
            extracted_data: result.output,
            verified: false
          }
        });
      } else {
        alert(`Failed to process document: ${result.details}`);
      }

    } catch (error) {
      console.error('Document processing error:', error);
      alert('Failed to process document');
    } finally {
      setProcessingDoc(null);
    }
  };

  const unprocessedDocs = documents.filter(d => !d.extracted_data);
  const processedDocs = documents.filter(d => d.extracted_data && !d.verified);
  const verifiedDocs = documents.filter(d => d.verified);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            AI Document Processor
          </h1>
          <p className="text-slate-600 text-lg">
            Intelligent document processing with automatic data extraction
          </p>
          <Badge className="mt-3 bg-purple-600">AI-Powered OCR</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Documents</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{documents.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Unprocessed</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{unprocessedDocs.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Needs Review</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{processedDocs.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Verified</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{verifiedDocs.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Upload */}
        <AIDocumentUpload onUploadComplete={(doc) => createDocumentMutation.mutate(doc)} />

        {/* Processing Queue */}
        <ProcessingQueue 
          documents={unprocessedDocs} 
          onProcess={processDocument}
          isProcessing={!!processingDoc}
          processingId={processingDoc?.id}
        />

        {/* Extracted Data Review */}
        {extractedData && (
          <ExtractedDataReview 
            extractedData={extractedData}
            loads={loads}
            onVerify={(docId) => {
              updateDocumentMutation.mutate({
                id: docId,
                data: { verified: true }
              });
              setExtractedData(null);
            }}
            onClose={() => setExtractedData(null)}
          />
        )}

        {/* Document Insights */}
        <DocumentInsights documents={documents} />

      </div>
    </div>
  );
}
