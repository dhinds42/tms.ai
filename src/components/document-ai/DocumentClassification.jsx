import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function DocumentClassification({ classification, documentName }) {
  if (!classification) return null;

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'bg-emerald-100 text-emerald-700';
    if (confidence >= 75) return 'bg-blue-100 text-blue-700';
    if (confidence >= 60) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const getUrgencyBadge = (urgency) => {
    const colors = {
      high: 'bg-red-600 text-white',
      medium: 'bg-amber-600 text-white',
      low: 'bg-blue-600 text-white'
    };
    return <Badge className={colors[urgency] || 'bg-slate-600 text-white'}>{urgency} urgency</Badge>;
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader className="border-b border-blue-200 pb-6">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <FileText className="w-5 h-5 text-blue-600" />
          Document Classification Results
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        
        <div className="p-5 bg-white rounded-xl border-2 border-blue-300 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-bold text-blue-900 text-lg mb-1">
                Classified as: {classification.document_type}
              </h4>
              {classification.document_subtype && (
                <p className="text-sm text-blue-700">
                  Subtype: {classification.document_subtype}
                </p>
              )}
              <p className="text-xs text-slate-600 mt-2">File: {documentName}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={getConfidenceColor(classification.confidence)}>
                {classification.confidence}% Confidence
              </Badge>
              {getUrgencyBadge(classification.urgency)}
              {classification.requires_action && (
                <Badge className="bg-amber-600 text-white">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Action Required
                </Badge>
              )}
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">AI Reasoning: </span>
              {classification.reasoning}
            </p>
          </div>
        </div>

        {/* Classification Indicators */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-blue-200 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900">Type Identified</p>
            <p className="text-xs text-slate-600 mt-1">{classification.document_type}</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-blue-200 text-center">
            <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900">Confidence Level</p>
            <p className="text-xs text-slate-600 mt-1">{classification.confidence}% Accurate</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-blue-200 text-center">
            <AlertCircle className={`w-8 h-8 ${
              classification.urgency === 'high' ? 'text-red-600' :
              classification.urgency === 'medium' ? 'text-amber-600' : 'text-blue-600'
            } mx-auto mb-2`} />
            <p className="text-sm font-semibold text-slate-900">Priority</p>
            <p className="text-xs text-slate-600 mt-1 capitalize">{classification.urgency}</p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}