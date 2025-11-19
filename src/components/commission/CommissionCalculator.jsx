import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp } from "lucide-react";

export default function CommissionCalculator() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const deliveredLoads = loads.filter(l => l.status === 'delivered');
  const totalRevenue = deliveredLoads.reduce((sum, l) => sum + (l.customer_charge || 0), 0);
  const totalMargin = deliveredLoads.reduce((sum, l) => sum + ((l.customer_charge || 0) - (l.carrier_cost || 0)), 0);
  const commission = totalMargin * 0.15; // 15% commission

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Commission Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-900 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-600">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg">
            <p className="text-xs text-emerald-900 mb-1">Gross Margin</p>
            <p className="text-2xl font-bold text-emerald-600">${totalMargin.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-500">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Commission Earned</h4>
          </div>
          <p className="text-3xl font-bold text-purple-600">${commission.toLocaleString()}</p>
          <p className="text-xs text-purple-700 mt-1">15% of gross margin</p>
        </div>

        <div className="p-3 bg-slate-50 rounded">
          <p className="text-sm text-slate-600">Loads completed: <span className="font-bold">{deliveredLoads.length}</span></p>
          <p className="text-sm text-slate-600">Avg commission per load: <span className="font-bold">${(commission / deliveredLoads.length || 0).toFixed(2)}</span></p>
        </div>

      </CardContent>
    </Card>
  );
}