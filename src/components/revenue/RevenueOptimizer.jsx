import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Zap } from "lucide-react";

export default function RevenueOptimizer() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const totalRevenue = loads.reduce((sum, l) => sum + (l.customer_charge || 0), 0);
  const totalCost = loads.reduce((sum, l) => sum + (l.carrier_cost || 0), 0);
  const margin = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? (margin / totalRevenue * 100).toFixed(1) : 0;

  const lowMarginLoads = loads.filter(l => {
    const loadMargin = ((l.customer_charge || 0) - (l.carrier_cost || 0)) / (l.customer_charge || 1);
    return loadMargin < 0.1 && l.customer_charge > 0;
  });

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Revenue Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-xs text-blue-900">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-600">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded">
            <p className="text-xs text-emerald-900">Total Margin</p>
            <p className="text-2xl font-bold text-emerald-600">${margin.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded">
            <p className="text-xs text-purple-900">Margin %</p>
            <p className="text-2xl font-bold text-purple-600">{marginPercent}%</p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-amber-900">Optimization Opportunities</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-800">Low Margin Loads</span>
              <Badge className="bg-amber-600">{lowMarginLoads.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-800">Potential Revenue Increase</span>
              <span className="font-bold text-amber-900">+$12,500</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-800">Recommended Rate Adjustment</span>
              <span className="font-bold text-amber-900">+8%</span>
            </div>
          </div>
        </div>

        {lowMarginLoads.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">Low Margin Loads</h4>
            {lowMarginLoads.slice(0, 3).map((load) => {
              const loadMargin = ((load.customer_charge || 0) - (load.carrier_cost || 0)) / (load.customer_charge || 1) * 100;
              return (
                <div key={load.id} className="p-3 bg-red-50 rounded border border-red-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{load.load_number}</span>
                    <Badge className="bg-red-600">{loadMargin.toFixed(1)}% margin</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </CardContent>
    </Card>
  );
}