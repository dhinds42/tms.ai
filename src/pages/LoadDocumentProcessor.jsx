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
      const prompt = `You are a Load Intake & Normalization Agent. Extract all load details from the uploaded documents.

For EACH load found, extract:
- Load ID/Reference/Pro Number
- Customer/Broker name and contact info
- Pickup location (name, address, city, state, zip, date, time)
- Delivery location (name, address, city, state, zip, date, time)  
- Equipment type (dry van, reefer, flatbed, etc.)
- Commodity description
- Weight (convert to pounds)
- Pricing (linehaul, fuel surcharge, total rate in USD)
- Special instructions

Output valid JSON in this format:
{
  "loads": [
    {
      "load_number": "",
      "customer_name": "",
      "pickup_location": {"city": "", "state": "", "address": "", "zip": ""},
      "dropoff_location": {"city": "", "state": "", "address": "", "zip": ""},
      "pickup_date": "YYYY-MM-DD",
      "delivery_date": "YYYY-MM-DD",
      "equipment_type": "",
      "commodity": "",
      "weight_lbs": null,
      "customer_rate": null,
      "carrier_pay": null,
      "notes": "",
      "confidence": "high|medium|low",
      "needs_review": false,
      "missing_fields": []
    }
  ],
  "summary": {
    "files_processed": 0,
    "loads_found": 0,
    "loads_ready": 0,
    "loads_need_review": 0
  }
}

IMPORTANT:
- Normalize dates to ISO format (YYYY-MM-DD)
- Convert all weights to pounds
- Extract ALL loads (may be multiple per file)
- Mark needs_review=true if missing required fields
- Set confidence based on data completeness`;

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
                  load_number: { type: "string" },
                  customer_name: { type: "string" },
                  pickup_location: {
                    type: "object",
                    properties: {
                      city: { type: "string" },
                      state: { type: "string" },
                      address: { type: "string" },
                      zip: { type: "string" }
                    }
                  },
                  dropoff_location: {
                    type: "object",
                    properties: {
                      city: { type: "string" },
                      state: { type: "string" },
                      address: { type: "string" },
                      zip: { type: "string" }
                    }
                  },
                  pickup_date: { type: "string" },
                  delivery_date: { type: "string" },
                  equipment_type: { type: "string" },
                  commodity: { type: "string" },
                  weight_lbs: { type: "number" },
                  customer_rate: { type: "number" },
                  carrier_pay: { type: "number" },
                  notes: { type: "string" },
                  confidence: { type: "string" },
                  needs_review: { type: "boolean" },
                  missing_fields: { type: "array", items: { type: "string" } }
                }
              }
            },
            summary: {
              type: "object",
              properties: {
                files_processed: { type: "number" },
                loads_found: { type: "number" },
                loads_ready: { type: "number" },
                loads_need_review: { type: "number" }
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
      const results = await Promise.all(
        loads.map(load => 
          base44.entities.Load.create({
            load_number: load.load_number || `LOAD-${Date.now()}`,
            pickup_location: load.pickup_location || {},
            dropoff_location: load.dropoff_location || {},
            pickup_date: load.pickup_date,
            delivery_date: load.delivery_date,
            equipment_type: load.equipment_type || 'dry_van',
            commodity: load.commodity || 'General Freight',
            weight: load.weight_lbs,
            customer_rate: load.customer_rate,
            carrier_pay: load.carrier_pay,
            status: 'available',
            notes: load.notes || ''
          }).catch(err => {
            console.error('Failed to create load:', load, err);
            throw new Error(`Failed to create load ${load.load_number}: ${err.message}`);
          })
        )
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      alert('Loads created successfully!');
      setExtractedLoads([]);
      setSummary(null);
      setUploadedFiles([]);
    },
    onError: (error) => {
      alert('Failed to create loads: ' + error.message);
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
                  <p className="text-2xl font-bold">{summary.files_processed}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Loads Found</p>
                  <p className="text-2xl font-bold">{summary.loads_found}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Ready to Create</p>
                  <p className="text-2xl font-bold text-emerald-600">{summary.loads_ready}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Need Review</p>
                  <p className="text-2xl font-bold text-amber-600">{summary.loads_need_review}</p>
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
              <Button
                onClick={() => handleCreateLoads(extractedLoads.filter(l => !l.needs_review))}
                disabled={extractedLoads.filter(l => !l.needs_review).length === 0}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create {extractedLoads.filter(l => !l.needs_review).length} Ready Loads
              </Button>
            </div>

            {extractedLoads.map((load, idx) => (
              <Card key={idx} className={load.needs_review ? 'border-amber-300' : 'border-emerald-300'}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        Load {load.load_number || `#${idx + 1}`}
                      </CardTitle>
                      <p className="text-sm text-slate-600">{load.customer_name}</p>
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
                      <Badge variant="outline">{load.confidence} confidence</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-slate-700">Pickup</p>
                      <p>{load.pickup_location?.city}, {load.pickup_location?.state}</p>
                      <p className="text-slate-600">{load.pickup_date}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Delivery</p>
                      <p>{load.dropoff_location?.city}, {load.dropoff_location?.state}</p>
                      <p className="text-slate-600">{load.delivery_date}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Equipment</p>
                      <p>{load.equipment_type}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Weight</p>
                      <p>{load.weight_lbs ? `${load.weight_lbs.toLocaleString()} lbs` : 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Rate</p>
                      <p className="text-emerald-600 font-bold">
                        ${load.customer_rate?.toLocaleString() || 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Commodity</p>
                      <p>{load.commodity || 'General freight'}</p>
                    </div>
                  </div>

                  {load.missing_fields?.length > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                      <p className="text-sm font-semibold text-amber-800">Missing Fields:</p>
                      <p className="text-sm text-amber-700">{load.missing_fields.join(', ')}</p>
                    </div>
                  )}

                  {load.notes && (
                    <div className="mt-4 p-3 bg-slate-50 rounded">
                      <p className="text-xs font-semibold text-slate-700">Notes:</p>
                      <p className="text-xs text-slate-600">{load.notes}</p>
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