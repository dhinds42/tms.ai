import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fuel, TrendingDown, DollarSign } from "lucide-react";

export default function FuelSavingsAnalysis({ routes }) {
  if (!routes || !routes.optimized_routes) return null;

  const totalMilesSaved = routes.optimized_routes.reduce((sum, r) => sum + (r.miles_saved || 0), 0);
  const avgMilesSaved = totalMilesSaved / routes.optimized_routes.length;
  const totalCostSavings = routes.optimized_routes.reduce((sum, r) => sum + (r.cost_savings || 0), 0);
  const avgCostSavings = totalCostSavings / routes.optimized_routes.length;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-yellow-50">
      <CardHeader className="border-b border-amber-200 pb-6">
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Fuel className="w-5 h-5 text-amber-600" />
          Fuel Savings Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        
        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="p-5 bg-white rounded-xl border-2 border-amber-200 text-center">
            <TrendingDown className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-emerald-600 mb-1">
              {avgMilesSaved.toFixed(0)}
            </p>
            <p className="text-sm text-slate-600">Avg Miles Saved</p>
          </div>

          <div className="p-5 bg-white rounded-xl border-2 border-amber-200 text-center">
            <DollarSign className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600 mb-1">
              ${avgCostSavings.toFixed(0)}
            </p>
            <p className="text-sm text-slate-600">Avg Cost Savings</p>
          </div>

          <div className="p-5 bg-white rounded-xl border-2 border-amber-200 text-center">
            <Fuel className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600 mb-1">
              {(avgMilesSaved / 6.5).toFixed(1)}
            </p>
            <p className="text-sm text-slate-600">Gallons Saved</p>
          </div>
        </div>

        {/* Annual Projections */}
        <div className="p-6 bg-white rounded-xl border-2 border-amber-300">
          <h4 className="font-bold text-amber-900 mb-4 text-center">
            Annual Savings Projection
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Monthly Savings</p>
              <p className="text-2xl font-bold text-amber-600">
                ${(avgCostSavings * 30).toFixed(0)}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Based on 30 loads/month
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Annual Savings</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${(avgCostSavings * 365).toFixed(0)}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Based on daily optimization
              </p>
            </div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300">
          <h4 className="font-bold text-green-900 mb-3">Environmental Impact</h4>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {(avgMilesSaved * 22.5).toFixed(0)}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                lbs CO2 saved per load
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {((avgMilesSaved * 22.5 * 365) / 2000).toFixed(1)}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Tons CO2 saved annually
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {((avgMilesSaved / 6.5) * 365).toFixed(0)}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Gallons fuel saved annually
              </p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}