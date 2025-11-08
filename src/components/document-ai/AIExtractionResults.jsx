import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle } from "lucide-react";

export default function AIExtractionResults({ data, docType, loads }) {
  if (!data) return null;

  const renderField = (key, value) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="p-3 bg-slate-50 rounded-lg">
          <p className="text-xs font-semibold text-slate-700 mb-2 capitalize">
            {key.replace(/_/g, ' ')}:
          </p>
          <div className="ml-3 space-y-1">
            {Object.entries(value).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-600 capitalize">{k.replace(/_/g, ' ')}:</span>
                <span className="font-medium text-slate-900">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="flex justify-between p-3 bg-slate-50 rounded-lg">
        <span className="text-sm text-slate-600 capitalize">{key.replace(/_/g, ' ')}:</span>
        <span className="text-sm font-semibold text-slate-900">{String(value)}</span>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
      <CardHeader className="border-b border-emerald-200 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <Brain className="w-5 h-5 text-emerald-600" />
            AI Extraction Results
          </CardTitle>
          <Badge className="bg-emerald-600 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="p-4 bg-white rounded-xl border-2 border-emerald-300 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-emerald-900">Document Type: {docType}</h4>
            <Badge className="bg-emerald-100 text-emerald-700">
              {Object.keys(data).length} Fields Extracted
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => renderField(key, value))}
        </div>

        <div className="mt-6 p-4 bg-white rounded-xl border border-emerald-200">
          <h4 className="font-semibold text-emerald-900 mb-3">Next Steps</h4>
          <ul className="space-y-2 text-sm text-emerald-800">
            <li>✓ Review extracted data for accuracy</li>
            <li>✓ Link to existing load if applicable</li>
            <li>✓ Verify and approve the document</li>
            <li>✓ Auto-update related records</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}