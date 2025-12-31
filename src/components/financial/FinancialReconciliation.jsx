import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function FinancialReconciliation({ loads, invoices }) {
  const [reconciling, setReconciling] = useState(false);
  
  const reconcileMutation = useMutation({
    mutationFn: async () => {
      setReconciling(true);
      // Auto-match loads to invoices
      const results = await Promise.all(
        loads.filter(l => l.status === 'delivered' && !l.invoice_number).map(async (load) => {
          const matching = invoices.find(inv => 
            inv.load_id === load.id || 
            inv.reference_number === load.load_number
          );
          
          if (matching) {
            await base44.entities.Load.update(load.id, {
              invoice_number: matching.invoice_number,
              invoice_status: 'matched'
            });
            return { load_id: load.id, status: 'matched' };
          }
          return { load_id: load.id, status: 'unmatched' };
        })
      );
      setReconciling(false);
      return results;
    }
  });
  
  const unmatchedLoads = loads.filter(l => l.status === 'delivered' && !l.invoice_number);
  const matchedToday = loads.filter(l => l.invoice_status === 'matched' && new Date(l.updated_date).toDateString() === new Date().toDateString());
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Auto Reconciliation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-600">{unmatchedLoads.length}</p>
            <p className="text-xs text-slate-600">Unmatched</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-emerald-600">{matchedToday.length}</p>
            <p className="text-xs text-slate-600">Matched Today</p>
          </div>
        </div>
        
        <Button 
          onClick={() => reconcileMutation.mutate()} 
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600"
          disabled={reconciling || unmatchedLoads.length === 0}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${reconciling ? 'animate-spin' : ''}`} />
          {reconciling ? 'Reconciling...' : `Auto-Match ${unmatchedLoads.length} Loads`}
        </Button>
      </CardContent>
    </Card>
  );
}