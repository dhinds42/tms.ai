import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function SettlementProcessor() {
  const queryClient = useQueryClient();

  const { data: settlements } = useQuery({
    queryKey: ['settlements'],
    queryFn: () => base44.entities.Settlement.list('-created_date', 50),
    initialData: [],
  });

  const processSettlementMutation = useMutation({
    mutationFn: (settlementId) => base44.entities.Settlement.update(settlementId, { status: 'processed' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settlements'] })
  });

  const pendingSettlements = settlements.filter(s => s.status === 'pending');
  const processedSettlements = settlements.filter(s => s.status === 'processed');

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Settlement Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-amber-50 rounded">
            <p className="text-xs text-amber-900">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{pendingSettlements.length}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded">
            <p className="text-xs text-emerald-900">Processed</p>
            <p className="text-2xl font-bold text-emerald-600">{processedSettlements.length}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-xs text-blue-900">Total Amount</p>
            <p className="text-2xl font-bold text-blue-600">
              ${settlements.reduce((sum, s) => sum + (s.total_amount || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {pendingSettlements.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <p className="text-slate-600">All settlements processed</p>
          </div>
        ) : (
          pendingSettlements.slice(0, 5).map((settlement) => (
            <div key={settlement.id} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-slate-900">Settlement #{settlement.settlement_number}</p>
                  <p className="text-sm text-slate-600">{settlement.carrier_name || 'Unknown Carrier'}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">${(settlement.total_amount || 0).toLocaleString()}</p>
                  <Badge className="bg-amber-600 mt-1">Pending</Badge>
                </div>
              </div>
              <Button 
                onClick={() => processSettlementMutation.mutate(settlement.id)}
                className="w-full bg-emerald-600 mt-2"
                disabled={processSettlementMutation.isPending}
              >
                Process Settlement
              </Button>
            </div>
          ))
        )}

      </CardContent>
    </Card>
  );
}