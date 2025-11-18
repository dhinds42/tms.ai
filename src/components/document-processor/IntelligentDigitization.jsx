import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Sparkles, FileText, Database, CheckCircle, Zap } from "lucide-react";

export default function IntelligentDigitization({ document, loads, onDigitizationComplete }) {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const runIntelligentDigitization = async () => {
    setProcessing(true);
    
    try {
      // Step 1: Extract comprehensive data
      const extractionSchema = {
        type: "object",
        properties: {
          document_classification: { type: "string" },
          parties: {
            type: "object",
            properties: {
              shipper: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  address_full: { type: "string" },
                  contact_person: { type: "string" },
                  phone: { type: "string" },
                  email: { type: "string" }
                }
              },
              consignee: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  address_full: { type: "string" },
                  contact_person: { type: "string" },
                  phone: { type: "string" },
                  email: { type: "string" }
                }
              },
              carrier: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  mc_number: { type: "string" },
                  dot_number: { type: "string" }
                }
              }
            }
          },
          shipment_details: {
            type: "object",
            properties: {
              reference_numbers: {
                type: "object",
                properties: {
                  bol: { type: "string" },
                  pro: { type: "string" },
                  po: { type: "string" },
                  load: { type: "string" }
                }
              },
              dates: {
                type: "object",
                properties: {
                  pickup: { type: "string" },
                  delivery: { type: "string" },
                  document_date: { type: "string" }
                }
              },
              cargo: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  weight_lbs: { type: "number" },
                  pieces: { type: "number" },
                  pallets: { type: "number" },
                  hazmat: { type: "boolean" }
                }
              }
            }
          },
          financial: {
            type: "object",
            properties: {
              freight_charges: { type: "number" },
              fuel_surcharge: { type: "number" },
              accessorials: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    amount: { type: "number" }
                  }
                }
              },
              total_charges: { type: "number" }
            }
          }
        }
      };

      const extraction = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: document.file_url,
        json_schema: extractionSchema
      });

      if (extraction.status !== 'success') {
        throw new Error('Extraction failed');
      }

      // Step 2: Match to existing load
      const matchPrompt = `
        Given this extracted shipment data, find the best matching load from our database.
        
        EXTRACTED DATA:
        ${JSON.stringify(extraction.output, null, 2)}
        
        AVAILABLE LOADS:
        ${JSON.stringify(loads.slice(0, 20).map(l => ({
          id: l.id,
          load_number: l.load_number,
          shipper: l.shipper_name,
          origin: l.origin_city,
          destination: l.destination_city,
          pickup_date: l.pickup_date,
          references: l.reference_numbers
        })), null, 2)}
        
        Return the best matching load ID and confidence score (0-100).
        If no good match, return null for load_id and suggest creating new load.
      `;

      const loadMatch = await base44.integrations.Core.InvokeLLM({
        prompt: matchPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            matched_load_id: { type: "string" },
            confidence: { type: "number" },
            match_reason: { type: "string" },
            should_create_new: { type: "boolean" }
          }
        }
      });

      // Step 3: Entity extraction and enrichment
      const enrichmentPrompt = `
        Analyze this shipment data and extract actionable entities:
        
        ${JSON.stringify(extraction.output, null, 2)}
        
        Identify and structure:
        1. New contacts to add to CRM
        2. New locations to add to database
        3. Reference numbers for tracking
        4. Special instructions or requirements
        5. Financial data for accounting
        6. Compliance requirements (hazmat, etc.)
      `;

      const entities = await base44.integrations.Core.InvokeLLM({
        prompt: enrichmentPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            contacts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  company: { type: "string" },
                  role: { type: "string" },
                  phone: { type: "string" },
                  email: { type: "string" }
                }
              }
            },
            locations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  address: { type: "string" },
                  type: { type: "string" }
                }
              }
            },
            tasks: {
              type: "array",
              items: { type: "string" }
            },
            compliance_flags: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setResult({
        extracted_data: extraction.output,
        load_match: loadMatch,
        enriched_entities: entities,
        processing_complete: true
      });

      if (onDigitizationComplete) {
        onDigitizationComplete({
          extracted_data: extraction.output,
          matched_load_id: loadMatch.matched_load_id,
          enriched_entities: entities,
          digitization_date: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Digitization error:', error);
      setResult({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 to-blue-50">
      <CardHeader className="border-b border-cyan-100">
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-600" />
          Intelligent Document Digitization
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        
        {!processing && !result && (
          <div>
            <div className="p-4 bg-white rounded-lg border border-cyan-200 mb-4">
              <h4 className="font-semibold text-cyan-900 mb-3">🤖 Smart Digitization Features:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm text-cyan-800">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 text-cyan-600" />
                  <div>
                    <strong>Full Data Extraction</strong>
                    <p className="text-xs">All parties, shipment details, financials</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 mt-0.5 text-cyan-600" />
                  <div>
                    <strong>Auto Load Matching</strong>
                    <p className="text-xs">Links to existing loads automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Database className="w-4 h-4 mt-0.5 text-cyan-600" />
                  <div>
                    <strong>Entity Recognition</strong>
                    <p className="text-xs">Extracts contacts, locations, tasks</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-cyan-600" />
                  <div>
                    <strong>One-Click Creation</strong>
                    <p className="text-xs">Auto-populate loads, invoices, records</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              onClick={runIntelligentDigitization}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Digitize & Auto-Process Document
            </Button>
          </div>
        )}

        {processing && (
          <div className="text-center py-8">
            <Brain className="w-16 h-16 text-cyan-600 animate-pulse mx-auto mb-4" />
            <p className="font-semibold text-cyan-900 mb-3">Intelligent Processing...</p>
            <div className="space-y-2 text-sm text-cyan-700">
              <p>📄 Extracting all data fields...</p>
              <p>🔗 Matching to existing loads...</p>
              <p>👥 Recognizing contacts & locations...</p>
              <p>✅ Preparing auto-population...</p>
            </div>
          </div>
        )}

        {result && !result.error && (
          <div className="space-y-4">
            
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900">Digitization Complete!</span>
              </div>
              
              {/* Load Match */}
              {result.load_match?.matched_load_id && (
                <div className="mb-3 p-3 bg-white rounded border border-emerald-200">
                  <p className="text-sm font-semibold text-emerald-900 mb-1">
                    🎯 Matched to Load: {result.load_match.matched_load_id}
                  </p>
                  <p className="text-xs text-emerald-800">
                    Confidence: {result.load_match.confidence}% - {result.load_match.match_reason}
                  </p>
                </div>
              )}

              {/* Extracted Entities */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-white rounded border border-cyan-200">
                  <p className="text-xs font-semibold text-cyan-900">Contacts Found</p>
                  <p className="text-lg font-bold text-cyan-600">
                    {result.enriched_entities?.contacts?.length || 0}
                  </p>
                </div>
                <div className="p-2 bg-white rounded border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900">Locations Found</p>
                  <p className="text-lg font-bold text-blue-600">
                    {result.enriched_entities?.locations?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button className="bg-indigo-600">
                <Database className="w-4 h-4 mr-2" />
                Create Load
              </Button>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>

            <Button onClick={() => setResult(null)} variant="outline" className="w-full">
              Process Another Document
            </Button>
          </div>
        )}

        {result?.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{result.error}</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}