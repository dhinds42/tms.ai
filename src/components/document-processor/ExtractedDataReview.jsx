import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, FileText } from "lucide-react";

export default function ExtractedDataReview({ extractedData, loads, onVerify, onClose }) {
  const { document, data } = extractedData;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50 border-l-4 border-l-emerald-500">
      <CardHeader className="border-b border-emerald-200 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <div>
              <CardTitle className="text-xl text-emerald-900">
                Data Extracted Successfully
              </CardTitle>
              <p className="text-sm text-emerald-700 mt-1">
                Review and verify the extracted data from {document.file_name}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="p-4 bg-white rounded-xl border border-emerald-200">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                {key.replace(/_/g, ' ')}
              </p>
              <p className="font-medium text-slate-900">
                {typeof value === 'object' ? JSON.stringify(value) : value || 'Not found'}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => onVerify(document.id)}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify & Save Data
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-slate-300"
          >
            Review Later
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}