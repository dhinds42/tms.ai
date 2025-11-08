import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";

export default function SeasonalTrends({ seasonalAnalysis }) {
  if (!seasonalAnalysis) return null;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader className="border-b border-purple-200 pb-6">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Calendar className="w-5 h-5 text-purple-600" />
          Seasonal Trends & Planning
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          
          {/* Peak Months */}
          <div className="p-5 bg-white rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Peak Season</h4>
                <p className="text-xs text-slate-600">High-demand months</p>
              </div>
            </div>

            {seasonalAnalysis.peak_months && seasonalAnalysis.peak_months.length > 0 ? (
              <div className="space-y-2">
                {seasonalAnalysis.peak_months.map((month, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-900">{month}</span>
                      <Badge className="bg-emerald-600 text-white text-xs">
                        Peak
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 text-center py-4">
                No clear peak identified yet
              </p>
            )}

            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-xs text-emerald-900">
                <span className="font-semibold">Prepare:</span> Increase capacity, recruit additional carriers, 
                lock in favorable rates, and ensure adequate staffing.
              </p>
            </div>
          </div>

          {/* Slow Months */}
          <div className="p-5 bg-white rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Slow Season</h4>
                <p className="text-xs text-slate-600">Lower-demand months</p>
              </div>
            </div>

            {seasonalAnalysis.slow_months && seasonalAnalysis.slow_months.length > 0 ? (
              <div className="space-y-2">
                {seasonalAnalysis.slow_months.map((month, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-900">{month}</span>
                      <Badge className="bg-blue-600 text-white text-xs">
                        Slow
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 text-center py-4">
                No clear slow periods identified
              </p>
            )}

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-900">
                <span className="font-semibold">Optimize:</span> Focus on efficiency, reduce costs, 
                pursue new markets, and plan maintenance activities.
              </p>
            </div>
          </div>

        </div>

        {/* Planning Insights */}
        {seasonalAnalysis.planning_insights && seasonalAnalysis.planning_insights.length > 0 && (
          <div className="p-5 bg-white rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-purple-600" />
              <h4 className="font-bold text-slate-900">Strategic Planning Insights</h4>
            </div>
            
            <div className="space-y-3">
              {seasonalAnalysis.planning_insights.map((insight, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-purple-600 text-white shrink-0">
                      {idx + 1}
                    </Badge>
                    <p className="text-sm text-slate-800 flex-1">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seasonal Strategy Calendar */}
        <div className="mt-6 p-5 bg-white rounded-xl border-2 border-purple-200">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Year-Round Strategy Guide
          </h4>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-900 mb-2 text-sm">Q1 (Jan-Mar)</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Plan for year ahead</li>
                <li>• Review annual contracts</li>
                <li>• Set quarterly targets</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-900 mb-2 text-sm">Q2 (Apr-Jun)</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Ramp up for summer</li>
                <li>• Recruit carriers</li>
                <li>• Optimize routes</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-900 mb-2 text-sm">Q3 (Jul-Sep)</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Peak season prep</li>
                <li>• Max capacity</li>
                <li>• Lock in rates</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-900 mb-2 text-sm">Q4 (Oct-Dec)</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Holiday logistics</li>
                <li>• Year-end planning</li>
                <li>• Set next year goals</li>
              </ul>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}