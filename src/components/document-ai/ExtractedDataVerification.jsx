import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";

export default function ExtractedDataVerification({ data, docType, onVerify }) {
  if (!data) return null;

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle>Verify Extracted Data</CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Review the AI-extracted information for accuracy
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="p-5 bg-slate-50 rounded-xl mb-6">
          <h4 className="font-semibold text-slate-900 mb-3">Extracted Fields:</h4>
          <p className="text-sm text-slate-700">
            ✓ {Object.keys(data).length} fields successfully extracted from {docType}
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={onVerify} className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify & Save
          </Button>
          <Button onClick={onVerify} variant="outline" className="border-red-300 text-red-700">
            <X className="w-4 h-4 mr-2" />
            Discard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}