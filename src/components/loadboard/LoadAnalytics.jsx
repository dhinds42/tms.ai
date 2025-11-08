import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Package, Percent } from "lucide-react";

export default function LoadAnalytics({ loads, operatingMode }) {
  const totalRevenue = loads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const totalMargin = loads.reduce((sum, l) => sum + (l.margin || 0), 0);
  const avgMargin = loads.length > 0 && totalRevenue > 0 
    ? ((totalMargin / totalRevenue) * 100).toFixed(1) 
    : 0;
  
  const activeLoads = loads.filter(l => 
    ['assigned', 'dispatched', 'picked_up', 'in_transit'].includes(l.status)
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Loads</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{loads.length}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Loads</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{activeLoads}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {operatingMode === 'broker' ? 'Total Revenue' : 'Total Value'}
              </p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                ${(totalRevenue / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {operatingMode === 'broker' && (
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Margin</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{avgMargin}%</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
                <Percent className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}