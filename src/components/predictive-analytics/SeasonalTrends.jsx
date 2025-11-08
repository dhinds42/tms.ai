import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

export default function SeasonalTrends({ seasonalAnalysis }) {
  if (!seasonalAnalysis) return null;

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-purple-600" />
          <CardTitle className="text-xl">Seasonal Trends & Planning</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h4 className="font-semibold text-emerald-900">Peak Demand Months</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {seasonalAnalysis.peak_months?.map((month, idx) => (
                <Badge key={idx} className="bg-emerald-600 text-white">
                  {month}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Slower Periods</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {seasonalAnalysis.slow_months?.map((month, idx) => (
                <Badge key={idx} className="bg-blue-600 text-white">
                  {month}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 bg-purple-50 rounded-xl border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-3">Strategic Planning Insights</h4>
          <ul className="space-y-2">
            {seasonalAnalysis.planning_insights?.map((insight, idx) => (
              <li key={idx} className="text-sm text-purple-900">
                • {insight}
              </li>
            ))}
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}