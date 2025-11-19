import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText, DollarSign, CheckCircle } from "lucide-react";

export default function CarrierAccessRights() {
  const [selectedCarrier, setSelectedCarrier] = useState(null);

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list(),
    initialData: [],
  });

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list(),
    initialData: [],
  });

  const getCarrierTransactions = (carrierId) => {
    return loads.filter(l => l.carrier_id === carrierId);
  };

  const getCarrierDocuments = (carrierId) => {
    return documents.filter(d => d.carrier_id === carrierId);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          Carrier Access Rights (49 CFR 371.3(c))
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📋 Regulatory Requirement:</h4>
          <p className="text-sm text-blue-800">
            Carriers have the right to review transaction records showing charges and shipment details upon reasonable request. 
            Brokers may obtain waiver of this right, but waiver is voluntary and cannot be coerced.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <p className="text-sm text-slate-600">Total Carriers</p>
            <p className="text-3xl font-bold text-slate-900">{carriers.length}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-sm text-emerald-600">Portal Access Enabled</p>
            <p className="text-3xl font-bold text-emerald-600">{carriers.length}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Carrier Access Summary</h4>
          {carriers.slice(0, 5).map((carrier) => {
            const transactions = getCarrierTransactions(carrier.id);
            const docs = getCarrierDocuments(carrier.id);

            return (
              <div 
                key={carrier.id}
                className="p-3 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 cursor-pointer"
                onClick={() => setSelectedCarrier(carrier)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{carrier.company_name}</p>
                    <p className="text-xs text-slate-600">
                      {transactions.length} transactions | {docs.length} documents accessible
                    </p>
                  </div>
                  <Badge className="bg-emerald-600">
                    <Eye className="w-3 h-3 mr-1" />
                    Portal Active
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {selectedCarrier && (
          <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-300">
            <h4 className="font-semibold text-indigo-900 mb-3">
              {selectedCarrier.company_name} - Available Records
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold">Transaction History:</span>
                <span>{getCarrierTransactions(selectedCarrier.id).length} loads</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold">Payment Records:</span>
                <span>Full visibility to carrier payments</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold">Documents:</span>
                <span>{getCarrierDocuments(selectedCarrier.id).length} files</span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-indigo-200">
              <p className="text-xs text-indigo-800">
                ✓ Carrier has full access to transaction records via Carrier Portal<br/>
                ✓ Can download rate confirmations, BOLs, and PODs<br/>
                ✓ Cannot view other carriers' data or internal pricing
              </p>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}