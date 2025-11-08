import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, TrendingUp, AlertCircle } from "lucide-react";

export default function DemandPrediction({ volumePrediction }) {
  if (!volumePrediction || volumePrediction.length === 0) return null;

  const totalLoads = volumePrediction.reduce((sum, v) => sum + (v.predicted_loads || 0), 0);
  const peakMonth = volumePrediction.reduce((max, v) => 
    v.predicted_loads > max.predicted_loads ? v : max
  , volumePrediction[0]);

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader className="border-b border-blue-200 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Truck className="w-5 h-5 text-blue-600" />
            Load Volume Prediction
          </CardTitle>
          <Badge className="bg-blue-600 text-white">
            Total: {totalLoads} loads
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        {/* Peak Month Alert */}
        <div className="p-4 bg-white rounded-xl border-2 border-blue-300 mb-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-1">Peak Volume Month</h4>
              <p className="text-sm text-blue-800">
                <span className="font-semibold">{peakMonth.month}</span> is expected to be the busiest with{' '}
                <span className="font-bold">{peakMonth.predicted_loads} loads</span>
              </p>
              {peakMonth.capacity_needed && (
                <p className="text-xs text-blue-700 mt-1">
                  ⚠️ Capacity Needed: {peakMonth.capacity_needed}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Volume */}
        <div className="space-y-3">
          {volumePrediction.map((month, idx) => (
            <div key={idx} className="p-4 bg-white rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-slate-900">{month.month}</h4>
                  {month.capacity_needed && (
                    <p className="text-xs text-slate-600 mt-1">
                      Capacity: {month.capacity_needed}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {month.predicted_loads}
                  </p>
                  <p className="text-xs text-slate-600">loads</p>
                </div>
              </div>

              {/* Volume Bar */}
              <div className="relative">
                <div className="w-full bg-slate-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-4 rounded-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${(month.predicted_loads / peakMonth.predicted_loads) * 100}%` }}
                  >
                    <span className="text-white text-xs font-bold">
                      {((month.predicted_loads / peakMonth.predicted_loads) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Capacity Warning */}
              {month.capacity_needed && month.capacity_needed.toLowerCase().includes('high') && (
                <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <p className="text-xs text-amber-900">
                      High capacity requirements - consider additional resources
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl border border-blue-200">
            <p className="text-xs text-slate-600 mb-1">Average Monthly Volume</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(totalLoads / volumePrediction.length)}
            </p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-blue-200">
            <p className="text-xs text-slate-600 mb-1">Volume Variance</p>
            <p className="text-2xl font-bold text-indigo-600">
              {Math.round(((peakMonth.predicted_loads / (totalLoads / volumePrediction.length)) - 1) * 100)}%
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}