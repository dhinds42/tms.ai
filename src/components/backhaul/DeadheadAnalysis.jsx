import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, AlertTriangle } from "lucide-react";

export default function DeadheadAnalysis({ loads }) {
  const totalMiles = loads.reduce((sum, l) => sum + (l.distance_miles || 0), 0);
  const estimatedDeadhead = totalMiles * 0.15; // Assuming 15% deadhead
  const deadheadPercentage = 15;
  const costOfDeadhead = estimatedDeadhead * 1.50;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
      <CardHeader className="border-b border-amber-200 pb-6">
        <div className="flex items-center gap-3">
          <TrendingDown className="w-5 h-5 text-amber-600" />
          <div>
            <CardTitle className="text-xl text-amber-900">Deadhead Impact Analysis</CardTitle>
            <p className="text-sm text-amber-700 mt-1">
              Current deadhead miles are costing you money
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-white rounded-xl border border-amber-200">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Deadhead Miles</p>
            <p className="text-3xl font-bold text-amber-600">{estimatedDeadhead.toFixed(0)}</p>
            <p className="text-sm text-slate-600 mt-1">{deadheadPercentage}% of total miles</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-amber-200">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Cost Impact</p>
            <p className="text-3xl font-bold text-red-600">${costOfDeadhead.toFixed(0)}</p>
            <p className="text-sm text-slate-600 mt-1">Lost revenue opportunity</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-emerald-200">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Reduction Goal</p>
            <p className="text-3xl font-bold text-emerald-600">8%</p>
            <p className="text-sm text-slate-600 mt-1">Industry best practice</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-xl border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">Improvement Opportunity</h4>
              <p className="text-sm text-amber-800">
                By reducing deadhead from 15% to 8%, you could save approximately ${(costOfDeadhead * 0.47).toFixed(0)} per period.
                Use AI backhaul matching to find optimal return loads.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}