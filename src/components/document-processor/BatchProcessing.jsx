import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

export default function BatchProcessing({ documents, onComplete }) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const handleBatchProcess = async () => {
    setProcessing(true);
    setProgress(0);
    
    const unprocessed = documents.filter(d => !d.extracted_data);
    const totalDocs = unprocessed.length;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < unprocessed.length; i++) {
      const doc = unprocessed[i];
      
      try {
        // Process each document
        const schema = {
          type: "object",
          properties: {
            shipper_name: { type: "string" },
            consignee_name: { type: "string" },
            pickup_address: { type: "string" },
            delivery_address: { type: "string" },
            commodity: { type: "string" },
            weight: { type: "number" },
            reference_numbers: { type: "string" }
          }
        };

        const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: doc.file_url,
          json_schema: schema
        });

        if (result.status === 'success') {
          await base44.entities.Document.update(doc.id, {
            extracted_data: result.output,
            verified: false
          });
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
      
      setProgress(((i + 1) / totalDocs) * 100);
    }
    
    setResults({ totalDocs, successCount, errorCount });
    setProcessing(false);
    onComplete();
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader className="border-b border-purple-100">
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          Batch AI Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        
        {!processing && !results && (
          <div>
            <p className="text-sm text-slate-700 mb-4">
              Process all unprocessed documents with AI data extraction in one batch operation.
            </p>
            <Button
              onClick={handleBatchProcess}
              disabled={documents.filter(d => !d.extracted_data).length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Process {documents.filter(d => !d.extracted_data).length} Documents
            </Button>
          </div>
        )}

        {processing && (
          <div>
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-center text-slate-600">
              Processing... {Math.round(progress)}%
            </p>
          </div>
        )}

        {results && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900">Successful</span>
              </div>
              <Badge className="bg-emerald-600">{results.successCount}</Badge>
            </div>
            
            {results.errorCount > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-900">Errors</span>
                </div>
                <Badge className="bg-red-600">{results.errorCount}</Badge>
              </div>
            )}

            <Button
              onClick={() => setResults(null)}
              variant="outline"
              className="w-full"
            >
              Process More Documents
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}