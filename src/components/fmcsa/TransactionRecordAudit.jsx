import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, DollarSign, CheckCircle } from "lucide-react";

export default function TransactionRecordAudit() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date', 100),
    initialData: [],
  });

  // Calculate transaction record compliance
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  const compliantLoads = loads.filter(load => {
    const hasRateConf = documents.some(d => d.load_id === load.id && d.document_type === 'rate_confirmation');
    const hasBOL = documents.some(d => d.load_id === load.id && d.document_type === 'bol');
    const hasPOD = documents.some(d => d.load_id === load.id && d.document_type === 'pod');
    const hasInvoice = documents.some(d => d.load_id === load.id && d.document_type === 'invoice');
    
    return hasRateConf && hasBOL && (hasPOD || load.status !== 'delivered') && hasInvoice;
  });

  const complianceRate = loads.length > 0 ? (compliantLoads.length / loads.length * 100).toFixed(1) : 0;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Transaction Record Audit (49 CFR 371.3)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-900 font-semibold">Overall Compliance Rate</p>
              <p className="text-4xl font-bold text-purple-600 mt-1">{complianceRate}%</p>
            </div>
            <CheckCircle className="w-16 h-16 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <p className="text-xs text-slate-600">Total Transactions</p>
            <p className="text-2xl font-bold text-slate-900">{loads.length}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-xs text-emerald-600">Fully Documented</p>
            <p className="text-2xl font-bold text-emerald-600">{compliantLoads.length}</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">✓ Required Documentation Per Transaction:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Rate Confirmation (shipper charges)</li>
            <li>• Bill of Lading (shipment details)</li>
            <li>• Proof of Delivery (delivery confirmation)</li>
            <li>• Invoice (carrier payment)</li>
            <li>• Broker-Carrier Agreement (on file)</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Recent Transactions</h4>
          {loads.slice(0, 5).map((load) => {
            const hasRateConf = documents.some(d => d.load_id === load.id && d.document_type === 'rate_confirmation');
            const hasBOL = documents.some(d => d.load_id === load.id && d.document_type === 'bol');
            const hasPOD = documents.some(d => d.load_id === load.id && d.document_type === 'pod');
            const hasInvoice = documents.some(d => d.load_id === load.id && d.document_type === 'invoice');
            const isCompliant = hasRateConf && hasBOL && hasInvoice;

            return (
              <div key={load.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">Load #{load.load_number}</p>
                    <p className="text-xs text-slate-600">
                      {hasRateConf ? '✓' : '✗'} Rate Conf | 
                      {hasBOL ? '✓' : '✗'} BOL | 
                      {hasPOD ? '✓' : '✗'} POD | 
                      {hasInvoice ? '✓' : '✗'} Invoice
                    </p>
                  </div>
                  <Badge className={isCompliant ? 'bg-emerald-600' : 'bg-amber-600'}>
                    {isCompliant ? 'Compliant' : 'Incomplete'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

      </CardContent>
    </Card>
  );
}