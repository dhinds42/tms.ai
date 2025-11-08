import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function CashFlowForecast({ forecast }) {
  const isPositive = forecast?.net_position >= 0;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader className="border-b border-blue-200 pb-6">
        <CardTitle className="text-xl font-bold text-slate-900">
          30-Day Cash Flow Forecast
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Projected inflows and outflows
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-600">Expected Inflows</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              ${forecast?.projected_inflows?.toLocaleString() || '0'}
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-600">Expected Outflows</span>
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">
              ${forecast?.projected_outflows?.toLocaleString() || '0'}
            </p>
          </div>

          <div className={`p-6 rounded-xl border-2 ${isPositive ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-600">Net Cash Position</span>
              <DollarSign className={`w-5 h-5 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`} />
            </div>
            <p className={`text-3xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              ${forecast?.net_position?.toLocaleString() || '0'}
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}