import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle } from "lucide-react";

export default function RateVolatilityAnalysis({ rateTrends }) {
  if (!rateTrends) return null;

  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    stable: 'text-blue-600'
  };

  const riskColors = {
    LOW: 'bg-emerald-100 text-emerald-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HIGH: 'bg-red-100 text-red-700'
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <div>
            <CardTitle className="text-xl">Market Rate Volatility Analysis</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Rate trend predictions and volatility risk assessment
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-slate-900 mb-2">Overall Trend</h4>
            <p className={`text-4xl font-bold ${trendColors[rateTrends.overall_trend?.toLowerCase()] || 'text-slate-900'} mb-2`}>
              {rateTrends.overall_trend}
            </p>
            <p className="text-sm text-slate-600">Expected market direction</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <h4 className="font-semibold text-slate-900 mb-2">Volatility Risk</h4>
            <Badge className={`${riskColors[rateTrends.risk_level]} text-2xl px-4 py-2`}>
              {rateTrends.risk_level}
            </Badge>
            <p className="text-sm text-slate-600 mt-2">Rate fluctuation risk</p>
          </div>
        </div>

        {rateTrends.volatility_periods && rateTrends.volatility_periods.length > 0 && (
          <div className="p-5 bg-amber-50 rounded-xl border-2 border-amber-300">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-2">High Volatility Periods</h4>
                <ul className="space-y-1">
                  {rateTrends.volatility_periods.map((period, idx) => (
                    <li key={idx} className="text-sm text-amber-800">• {period}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}