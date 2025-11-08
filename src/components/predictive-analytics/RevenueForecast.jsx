import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";

export default function RevenueForecast({ forecast }) {
  if (!forecast || forecast.length === 0) return null;

  const totalPredicted = forecast.reduce((sum, f) => sum + (f.predicted_revenue || 0), 0);
  const avgGrowthRate = forecast.reduce((sum, f) => sum + (f.growth_rate || 0), 0) / forecast.length;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
      <CardHeader className="border-b border-emerald-200 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Revenue Forecast (Next 6 Months)
          </CardTitle>
          <Badge className="bg-emerald-600 text-white">
            Predicted: ${(totalPredicted / 1000).toFixed(0)}K
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded-xl border border-emerald-200">
            <p className="text-xs text-slate-600 mb-1">Total Forecast</p>
            <p className="text-2xl font-bold text-emerald-600">
              ${(totalPredicted / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-emerald-200">
            <p className="text-xs text-slate-600 mb-1">Avg Growth Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {avgGrowthRate > 0 ? '+' : ''}{avgGrowthRate.toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-emerald-200">
            <p className="text-xs text-slate-600 mb-1">Monthly Avg</p>
            <p className="text-2xl font-bold text-indigo-600">
              ${(totalPredicted / forecast.length / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        {/* Month by Month Forecast */}
        <div className="space-y-3">
          {forecast.map((month, idx) => (
            <div key={idx} className="p-4 bg-white rounded-xl border border-emerald-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-slate-900">{month.month}</h4>
                    <p className="text-xs text-slate-600">Confidence: {month.confidence}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">
                    ${(month.predicted_revenue / 1000).toFixed(0)}K
                  </p>
                  <Badge className={
                    month.growth_rate > 0 ? 'bg-emerald-100 text-emerald-700' :
                    month.growth_rate < 0 ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {month.growth_rate > 0 ? '+' : ''}{month.growth_rate?.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              {/* Visual Bar */}
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-emerald-600 to-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((month.predicted_revenue / Math.max(...forecast.map(f => f.predicted_revenue))) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Trend Indicator */}
        <div className="mt-6 p-4 bg-white rounded-xl border-2 border-emerald-300">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="font-semibold text-slate-900">Overall Trend</p>
              <p className="text-sm text-slate-600">
                {avgGrowthRate > 5 ? 'Strong growth expected' :
                 avgGrowthRate > 0 ? 'Moderate growth projected' :
                 avgGrowthRate > -5 ? 'Slight decline anticipated' :
                 'Significant decline forecasted'}
              </p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}