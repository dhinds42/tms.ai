import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2, Plus } from "lucide-react";
import PageHeader from "@/components/design-system/PageHeader";

export default function LoadDocumentProcessor() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [extractedLoads, setExtractedLoads] = useState([]);
  const [summary, setSummary] = useState(null);
  const queryClient = useQueryClient();

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return result.file_url;
    }
  });

  const processDocumentsMutation = useMutation({
    mutationFn: async (fileUrls) => {
      const prompt = `You are the "Load Intake & Normalization Agent" for Dual TMS.ai.

Goal:
Read uploaded document(s) containing load details. Extract and normalize information into structured JSON ready for the Loadboard.

Required Behavior:
1) Read all uploaded files end-to-end.
2) Detect load records (one file may contain multiple loads across pages/tables).
3) Extract fields using best effort + cross-validation.
4) Normalize:
   - Dates → ISO 8601 (YYYY-MM-DD)
   - Times → 24h HH:MM
   - Weight → pounds (lb)
   - Distance → miles
   - Currency → USD
5) For locations: extract city, state, zip separately. If only facility name exists, store as location_name.
6) Mark every field with confidence (high/medium/low) and flag missing required fields.

Required Fields (must flag if missing):
- customer_name OR broker_name
- pickup.city + pickup.state
- delivery.city + delivery.state
- pickup.date
- delivery.date
- equipment.equipment_type
- pricing.total_rate_usd

Output one JSON load per detected load record.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: fileUrls,
        response_json_schema: {
          type: "object",
          properties: {
            loads: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  load_id_external: { type: "string" },
                  customer_name: { type: "string" },
                  broker_name: { type: "string" },
                  mc_number: { type: "string" },
                  contact: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      phone: { type: "string" },
                      email: { type: "string" }
                    }
                  },
                  pickup: {
                    type: "object",
                    properties: {
                      location_name: { type: "string" },
                      address1: { type: "string" },
                      address2: { type: "string" },
                      city: { type: "string" },
                      state: { type: "string" },
                      zip: { type: "string" },
                      date: { type: "string" },
                      time_start: { type: "string" },
                      time_end: { type: "string" },
                      appointment_required: { type: "boolean" },
                      notes: { type: "string" }
                    }
                  },
                  delivery: {
                    type: "object",
                    properties: {
                      location_name: { type: "string" },
                      address1: { type: "string" },
                      address2: { type: "string" },
                      city: { type: "string" },
                      state: { type: "string" },
                      zip: { type: "string" },
                      date: { type: "string" },
                      time_start: { type: "string" },
                      time_end: { type: "string" },
                      appointment_required: { type: "boolean" },
                      notes: { type: "string" }
                    }
                  },
                  equipment: {
                    type: "object",
                    properties: {
                      equipment_type: { type: "string" },
                      length_ft: { type: "number" },
                      temp_f: { type: "number" }
                    }
                  },
                  freight: {
                    type: "object",
                    properties: {
                      commodity: { type: "string" },
                      weight_lb: { type: "number" },
                      pieces: { type: "number" },
                      pallets: { type: "number" },
                      hazmat: { type: "boolean" },
                      team_required: { type: "boolean" }
                    }
                  },
                  pricing: {
                    type: "object",
                    properties: {
                      linehaul_usd: { type: "number" },
                      fuel_surcharge_usd: { type: "number" },
                      accessorials: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            type: { type: "string" },
                            amount_usd: { type: "number" }
                          }
                        }
                      },
                      total_rate_usd: { type: "number" },
                      rate_type: { type: "string" }
                    }
                  },
                  constraints: {
                    type: "object",
                    properties: {
                      driver_assist: { type: "boolean" },
                      lumper_required: { type: "boolean" },
                      detention_terms: { type: "string" },
                      special_instructions: { type: "string" }
                    }
                  },
                  confidence: {
                    type: "object",
                    properties: {
                      overall: { type: "string" }
                    }
                  },
                  needs_review: { type: "boolean" },
                  missing_required_fields: { type: "array", items: { type: "string" } }
                }
              }
            },
            summary: {
              type: "object",
              properties: {
                files_processed: { type: "array", items: { type: "string" } },
                loads_found: { type: "number" },
                loads_ready_to_create: { type: "number" },
                loads_need_review: { type: "number" },
                top_missing_fields: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      return result;
    }
  });

  const createLoadsMutation = useMutation({
    mutationFn: async (loads) => {
      const results = [];
      for (const load of loads) {
        try {
          const pickupLocation = {
            city: load.pickup?.city || '',
            state: load.pickup?.state || '',
            address: load.pickup?.address1 || '',
            zip: load.pickup?.zip || ''
          };
          
          const dropoffLocation = {
            city: load.delivery?.city || '',
            state: load.delivery?.state || '',
            address: load.delivery?.address1 || '',
            zip: load.delivery?.zip || ''
          };
          
          const notes = [
            load.constraints?.special_instructions,
            load.pickup?.notes,
            load.delivery?.notes,
            load.needs_review ? '[NEEDS REVIEW - Extracted from document]' : null
          ].filter(Boolean).join('\n');
          
          const result = await base44.entities.Load.create({
            load_number: load.load_id_external || `LOAD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            pickup_location: pickupLocation,
            dropoff_location: dropoffLocation,
            pickup_date: load.pickup?.date || new Date().toISOString().split('T')[0],
            delivery_date: load.delivery?.date || new Date().toISOString().split('T')[0],
            equipment_type: load.equipment?.equipment_type || 'dry_van',
            commodity: load.freight?.commodity || 'General Freight',
            weight: load.freight?.weight_lb || null,
            customer_rate: load.pricing?.total_rate_usd || load.pricing?.linehaul_usd || null,
            carrier_pay: null,
            status: 'available',
            notes: notes || ''
          });
          results.push({ success: true, load: result });
        } catch (err) {
          console.error('Failed to create load:', load, err);
          results.push({ success: false, load: load.load_id_external || 'unknown', error: err.message });
        }
      }
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (failed > 0) {
        throw new Error(`Created ${successful} loads, ${failed} failed. Check console for details.`);
      }
      
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      alert(`Successfully created ${results.length} load(s)!`);
      setExtractedLoads([]);
      setSummary(null);
      setUploadedFiles([]);
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files);
  };

  const handleProcess = async () => {
    if (uploadedFiles.length === 0) return;
    
    setProcessing(true);
    try {
      // Upload files
      const fileUrls = await Promise.all(
        uploadedFiles.map(file => uploadFileMutation.mutateAsync(file))
      );

      // Process with LLM
      const result = await processDocumentsMutation.mutateAsync(fileUrls);
      
      setExtractedLoads(result.loads || []);
      setSummary(result.summary || {});
    } catch (error) {
      alert('Error processing documents: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateLoads = (loadsToCreate) => {
    if (confirm(`Create ${loadsToCreate.length} load(s)?`)) {
      createLoadsMutation.mutate(loadsToCreate);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Load Document Processor"
        subtitle="Upload rate confirmations, tenders, or BOLs to extract load data"
        icon={FileText}
      />

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
              <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <input
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.docx,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button type="button" onClick={() => document.getElementById('file-upload').click()}>
                  Select Files
                </Button>
              </label>
              <p className="text-sm text-slate-500 mt-2">
                PDF, Excel, Word, or CSV files supported
              </p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold">Selected Files:</p>
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4" />
                    <span>{file.name}</span>
                    <Badge variant="outline">{(file.size / 1024).toFixed(1)} KB</Badge>
                  </div>
                ))}
              </div>
            )}

            <Button 
              onClick={handleProcess} 
              disabled={uploadedFiles.length === 0 || processing}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Documents...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Extract Load Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Summary */}
        {summary && (
          <Card className="border-indigo-200 bg-indigo-50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Files Processed</p>
                  <p className="text-2xl font-bold">{summary.files_processed?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Loads Found</p>
                  <p className="text-2xl font-bold">{summary.loads_found || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Ready to Create</p>
                  <p className="text-2xl font-bold text-emerald-600">{summary.loads_ready_to_create || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Need Review</p>
                  <p className="text-2xl font-bold text-amber-600">{summary.loads_need_review || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extracted Loads */}
        {extractedLoads.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Extracted Loads ({extractedLoads.length})</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCreateLoads(extractedLoads.filter(l => !l.needs_review))}
                  disabled={extractedLoads.filter(l => !l.needs_review).length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create {extractedLoads.filter(l => !l.needs_review).length} Ready Loads
                </Button>
                <Button
                  onClick={() => handleCreateLoads(extractedLoads)}
                  variant="outline"
                  disabled={extractedLoads.length === 0}
                >
                  Create All {extractedLoads.length} Loads
                </Button>
              </div>
            </div>

            {extractedLoads.map((load, idx) => (
              <Card key={idx} className={load.needs_review ? 'border-amber-300' : 'border-emerald-300'}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        Load {load.load_id_external || `#${idx + 1}`}
                      </CardTitle>
                      <p className="text-sm text-slate-600">{load.customer_name || load.broker_name}</p>
                    </div>
                    <div className="flex gap-2">
                      {load.needs_review ? (
                        <Badge className="bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Needs Review
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Ready
                        </Badge>
                      )}
                      <Badge variant="outline">{load.confidence?.overall || 'medium'} confidence</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-slate-700">Pickup</p>
                      <p>{load.pickup?.location_name || `${load.pickup?.city}, ${load.pickup?.state}`}</p>
                      <p className="text-slate-600">{load.pickup?.date} {load.pickup?.time_start && `@ ${load.pickup.time_start}`}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Delivery</p>
                      <p>{load.delivery?.location_name || `${load.delivery?.city}, ${load.delivery?.state}`}</p>
                      <p className="text-slate-600">{load.delivery?.date} {load.delivery?.time_start && `@ ${load.delivery.time_start}`}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Equipment</p>
                      <p>{load.equipment?.equipment_type || 'Not specified'}</p>
                      {load.equipment?.length_ft && <p className="text-xs text-slate-500">{load.equipment.length_ft}ft</p>}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Weight</p>
                      <p>{load.freight?.weight_lb ? `${load.freight.weight_lb.toLocaleString()} lbs` : 'Not specified'}</p>
                      {load.freight?.pallets && <p className="text-xs text-slate-500">{load.freight.pallets} pallets</p>}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Rate</p>
                      <p className="text-emerald-600 font-bold">
                        ${load.pricing?.total_rate_usd?.toLocaleString() || load.pricing?.linehaul_usd?.toLocaleString() || 'TBD'}
                      </p>
                      {load.pricing?.fuel_surcharge_usd && (
                        <p className="text-xs text-slate-500">+ ${load.pricing.fuel_surcharge_usd} FSC</p>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Commodity</p>
                      <p>{load.freight?.commodity || 'General freight'}</p>
                      {load.freight?.hazmat && <Badge className="mt-1 bg-red-100 text-red-800 text-xs">HAZMAT</Badge>}
                    </div>
                  </div>

                  {load.missing_required_fields?.length > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                      <p className="text-sm font-semibold text-amber-800">Missing Required Fields:</p>
                      <p className="text-sm text-amber-700">{load.missing_required_fields.join(', ')}</p>
                    </div>
                  )}

                  {load.constraints?.special_instructions && (
                    <div className="mt-4 p-3 bg-slate-50 rounded">
                      <p className="text-xs font-semibold text-slate-700">Special Instructions:</p>
                      <p className="text-xs text-slate-600">{load.constraints.special_instructions}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateLoads([load])}
                    >
                      Create This Load
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Help Text */}
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">
              <strong>How it works:</strong> Upload rate confirmations, load tenders, or dispatch sheets. 
              The AI will extract load details, normalize formats, and prepare data for import. 
              Review extracted loads and create them directly in the loadboard.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}