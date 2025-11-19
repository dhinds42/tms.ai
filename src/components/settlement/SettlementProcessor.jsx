import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle } from "lucide-react";

export default function SettlementProcessor() {
  const queryClient = useQueryClient();

  const { data: settlements } = useQuery({
    queryKey: ['settlements'],
    queryFn: () => base44.entities.Settlement.list('-created_date', 50),
    initialData: [],
  });

  const processSettlement = useMutation({
    mutationFn: async (settlementId) => {
      return base44.entities.Settlement.update(settlementId, { status: 'paid' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['settlements']);
      alert('Settlement processed successfully');
    },
  });

  const pendingSettlements = settlements.filter(s => s.status === 'pending');

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Settlement Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-amber-50 rounded border border-amber-200">
            <p className="text-xs text-amber-900">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{pendingSettlements.length}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-xs text-emerald-900">This Week</p>
            <p className="text-2xl font-bold text-emerald-600">
              ${settlements.filter(s => s.status === 'paid').reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {pendingSettlements.slice(0, 5).map((settlement) => (
            <div key={settlement.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
              <div>
                <p className="font-semibold text-sm">{settlement.carrier_name || 'Carrier'}</p>
                <p className="text-xs text-slate-600">${settlement.amount?.toLocaleString() || '0'}</p>
              </div>
              <Button
                size="sm"
                onClick={() => processSettlement.mutate(settlement.id)}
                className="bg-emerald-600"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Process
              </Button>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}