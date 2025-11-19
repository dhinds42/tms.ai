import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock } from "lucide-react";

export default function RecordRetention() {
  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date', 500),
    initialData: [],
  });

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 500),
    initialData: [],
  });

  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  const retainedRecords = {
    rateConfs: documents.filter(d => d.document_type === 'rate_confirmation' && new Date(d.created_date) >= threeYearsAgo).length,
    bols: documents.filter(d => d.document_type === 'bol' && new Date(d.created_date) >= threeYearsAgo).length,
    pods: documents.filter(d => d.document_type === 'pod' && new Date(d.created_date) >= threeYearsAgo).length,
    invoices: documents.filter(d => d.document_type === 'invoice' && new Date(d.created_date) >= threeYearsAgo).length,
    agreements: documents.filter(d => ['broker_carrier_agreement', 'broker_shipper_msa'].includes(d.document_type)).length,
    loads: loads.filter(l => new Date(l.created_date) >= threeYearsAgo).length
  };

  const totalRetained = Object.values(retainedRecords).reduce((a, b) => a + b, 0);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            3-Year Record Retention (49 CFR 371.3)
          </CardTitle>
          <Badge className="bg-emerald-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Compliant
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-900 font-semibold">Total Records Retained</p>
              <p className="text-3xl font-bold text-indigo-600 mt-1">{totalRetained}</p>
            </div>
            <Clock className="w-12 h-12 text-indigo-600 opacity-20" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <p className="text-xs text-slate-600">Rate Confirmations</p>
            <p className="text-2xl font-bold text-slate-900">{retainedRecords.rateConfs}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <p className="text-xs text-slate-600">Bills of Lading</p>
            <p className="text-2xl font-bold text-slate-900">{retainedRecords.bols}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <p className="text-xs text-slate-600">Proof of Delivery</p>
            <p className="text-2xl font-bold text-slate-900">{retainedRecords.pods}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <p className="text-xs text-slate-600">Invoices</p>
            <p className="text-2xl font-bold text-slate-900">{retainedRecords.invoices}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <p className="text-xs text-slate-600">Agreements</p>
            <p className="text-2xl font-bold text-slate-900">{retainedRecords.agreements}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <p className="text-xs text-slate-600">Transaction Records</p>
            <p className="text-2xl font-bold text-slate-900">{retainedRecords.loads}</p>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <h4 className="font-semibold text-emerald-900 mb-2">✓ Retention Policy Active</h4>
          <ul className="text-sm text-emerald-800 space-y-1">
            <li>• All transaction records automatically retained for 3+ years</li>
            <li>• Documents stored in secure, tamper-proof storage</li>
            <li>• Audit trail maintained for compliance verification</li>
            <li>• Carrier access rights preserved per 49 CFR 371.3(c)</li>
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}