import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle } from "lucide-react";

export default function RecordRetention() {
  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-uploaded_date', 100),
    initialData: [],
  });

  const requiredDocs = [
    { type: 'Rate Confirmation', count: documents.filter(d => d.document_type === 'rate_confirmation').length, required: true, retention: '3 years' },
    { type: 'BOL', count: documents.filter(d => d.document_type === 'bol').length, required: true, retention: '3 years' },
    { type: 'Carrier Agreement', count: documents.filter(d => d.document_type === 'carrier_contract').length, required: true, retention: '3 years' },
    { type: 'Insurance Certificate', count: documents.filter(d => d.document_type === 'insurance').length, required: true, retention: '3 years' },
    { type: 'Transaction Records', count: documents.filter(d => d.document_type === 'transaction_record').length, required: true, retention: '3 years' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Record Retention Compliance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            <strong>49 CFR 371.3:</strong> Brokers must maintain records of each transaction for 3 years
          </p>
        </div>

        {requiredDocs.map((doc, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-semibold text-sm text-slate-900">{doc.type}</p>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-3 h-3" />
                  <span>Retention: {doc.retention}</span>
                </div>
              </div>
            </div>
            <Badge className="bg-indigo-600">{doc.count} records</Badge>
          </div>
        ))}

      </CardContent>
    </Card>
  );
}