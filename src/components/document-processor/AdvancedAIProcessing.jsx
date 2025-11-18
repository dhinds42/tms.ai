import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Sparkles, CheckCircle, AlertTriangle, Target, Zap } from "lucide-react";

export default function AdvancedAIProcessing({ document, onProcessComplete }) {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const processWithAI = async () => {
    setProcessing(true);
    
    try {
      // Step 1: Auto-classify document type
      const classificationPrompt = `Analyze this document and classify it as one of: bol, pod, rate_confirmation, invoice, lumper_receipt, scale_ticket, or other. Return only the classification type.`;
      
      const classification = await base44.integrations.Core.InvokeLLM({
        prompt: `${classificationPrompt}\n\nDocument: ${document.file_name}`,
        file_urls: [document.file_url]
      });

      // Step 2: Extract data with enhanced schema
      const enhancedSchema = {
        type: "object",
        properties: {
          // Basic info
          document_number: { type: "string", description: "Primary reference number (BOL, PRO, Invoice #)" },
          document_date: { type: "string", description: "Document issue date" },
          
          // Parties
          shipper: {
            type: "object",
            properties: {
              name: { type: "string" },
              address: { type: "string" },
              city: { type: "string" },
              state: { type: "string" },
              zip: { type: "string" },
              phone: { type: "string" },
              contact: { type: "string" }
            }
          },
          consignee: {
            type: "object",
            properties: {
              name: { type: "string" },
              address: { type: "string" },
              city: { type: "string" },
              state: { type: "string" },
              zip: { type: "string" },
              phone: { type: "string" },
              contact: { type: "string" }
            }
          },
          
          // Shipment details
          pickup_date: { type: "string" },
          delivery_date: { type: "string" },
          commodity: { type: "string" },
          weight: { type: "number", description: "Total weight in lbs" },
          pieces: { type: "number", description: "Number of pieces/pallets" },
          
          // Financial
          total_charges: { type: "number" },
          freight_charges: { type: "number" },
          fuel_surcharge: { type: "number" },
          accessorial_charges: { type: "number" },
          
          // Reference numbers
          po_number: { type: "string" },
          pro_number: { type: "string" },
          load_number: { type: "string" },
          
          // Special instructions
          special_instructions: { type: "string" },
          delivery_instructions: { type: "string" },
          
          // Confidence scoring
          data_quality_score: { type: "number", description: "Confidence score 0-100" }
        }
      };

      const extraction = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: document.file_url,
        json_schema: enhancedSchema
      });

      if (extraction.status === 'success') {
        // Step 3: Validate extracted data
        const validationPrompt = `Review this extracted data for accuracy and completeness. Identify any missing critical fields, suspicious values, or data quality issues. Return a JSON with: { "is_valid": boolean, "confidence_score": number (0-100), "issues": ["issue1", "issue2"], "recommendations": ["rec1", "rec2"] }`;
        
        const validation = await base44.integrations.Core.InvokeLLM({
          prompt: `${validationPrompt}\n\nExtracted Data: ${JSON.stringify(extraction.output)}`,
          response_json_schema: {
            type: "object",
            properties: {
              is_valid: { type: "boolean" },
              confidence_score: { type: "number" },
              issues: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } }
            }
          }
        });

        setResult({
          classification: classification.toLowerCase().trim(),
          extracted_data: extraction.output,
          validation: validation,
          processing_time: new Date().toISOString()
        });

        onProcessComplete({
          document_type: classification.toLowerCase().trim(),
          extracted_data: extraction.output,
          ai_validation: validation,
          confidence_score: validation.confidence_score || 85
        });
      }
    } catch (error) {
      console.error('AI processing error:', error);
      setResult({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const getConfidenceBadge = (score) => {
    if (score >= 90) return <Badge className="bg-emerald-600">High Confidence</Badge>;
    if (score >= 70) return <Badge className="bg-amber-600">Medium Confidence</Badge>;
    return <Badge className="bg-red-600">Low Confidence</Badge>;
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader className="border-b border-purple-100">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Advanced AI Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        
        {!processing && !result && (
          <div>
            <div className="p-4 bg-white rounded-lg border border-purple-200 mb-4">
              <h4 className="font-semibold text-purple-900 mb-2">🤖 AI Capabilities:</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• <strong>Auto-Classification:</strong> Detects document type automatically</li>
                <li>• <strong>Enhanced Extraction:</strong> 25+ data fields with context awareness</li>
                <li>• <strong>Smart Validation:</strong> AI validates accuracy and completeness</li>
                <li>• <strong>Confidence Scoring:</strong> Reliability metrics for each extraction</li>
                <li>• <strong>Quality Checks:</strong> Identifies missing or suspicious data</li>
              </ul>
            </div>
            
            <Button
              onClick={processWithAI}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Process with Advanced AI
            </Button>
          </div>
        )}

        {processing && (
          <div className="text-center py-8">
            <Brain className="w-16 h-16 text-purple-600 animate-pulse mx-auto mb-4" />
            <p className="font-semibold text-purple-900 mb-2">AI Processing in Progress...</p>
            <div className="space-y-2 text-sm text-purple-700">
              <p>⚡ Classifying document type...</p>
              <p>🔍 Extracting structured data...</p>
              <p>✅ Validating accuracy...</p>
            </div>
          </div>
        )}

        {result && !result.error && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900">Processing Complete</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-800">Document Type:</span>
                  <Badge className="bg-emerald-600">{result.classification?.toUpperCase()}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-800">Confidence Score:</span>
                  {getConfidenceBadge(result.validation?.confidence_score || 0)}
                </div>
                
                {result.validation?.issues?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-200">
                    <p className="text-xs font-semibold text-emerald-900 mb-2">⚠️ Data Quality Issues:</p>
                    <ul className="text-xs text-emerald-800 space-y-1">
                      {result.validation.issues.map((issue, idx) => (
                        <li key={idx}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={() => setResult(null)}
              variant="outline"
              className="w-full"
            >
              Process Another Document
            </Button>
          </div>
        )}

        {result?.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-900">Processing Error</span>
            </div>
            <p className="text-sm text-red-800 mt-2">{result.error}</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}