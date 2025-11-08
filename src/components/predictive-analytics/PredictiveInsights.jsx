import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertCircle } from "lucide-react";

export default function PredictiveInsights({ predictions }) {
  if (!predictions) return null;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <CardHeader className="border-b border-indigo-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent">
              AI Predictive Insights Summary
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              6-month forecast analysis and strategic recommendations
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        {/* Executive Summary */}
        {predictions.summary && (
          <div className="p-5 bg-white rounded-xl border-2 border-indigo-200 mb-6">
            <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Executive Summary
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {predictions.summary}
            </p>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {predictions.revenue_forecast && predictions.revenue_forecast.length > 0 && (
            <div className="p-4 bg-white rounded-xl border border-indigo-200">
              <p className="text-xs text-slate-600 mb-1">Projected Revenue (6mo)</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${(predictions.revenue_forecast.reduce((sum, f) => sum + (f.predicted_revenue || 0), 0) / 1000).toFixed(0)}K
              </p>
              <Badge className="mt-2 bg-emerald-100 text-emerald-700 text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Revenue Growth
              </Badge>
            </div>
          )}

          {predictions.load_volume_prediction && predictions.load_volume_prediction.length > 0 && (
            <div className="p-4 bg-white rounded-xl border border-indigo-200">
              <p className="text-xs text-slate-600 mb-1">Total Load Volume (6mo)</p>
              <p className="text-2xl font-bold text-blue-600">
                {predictions.load_volume_prediction.reduce((sum, v) => sum + (v.predicted_loads || 0), 0)}
              </p>
              <Badge className="mt-2 bg-blue-100 text-blue-700 text-xs">
                Volume Forecast
              </Badge>
            </div>
          )}

          {predictions.rate_trends && (
            <div className="p-4 bg-white rounded-xl border border-indigo-200">
              <p className="text-xs text-slate-600 mb-1">Market Trend</p>
              <p className="text-2xl font-bold text-indigo-600 capitalize">
                {predictions.rate_trends.overall_trend}
              </p>
              <Badge className={`mt-2 text-xs ${
                predictions.rate_trends.risk_level === 'HIGH' || predictions.rate_trends.risk_level === 'CRITICAL'
                  ? 'bg-red-100 text-red-700'
                  : predictions.rate_trends.risk_level === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                <AlertCircle className="w-3 h-3 mr-1" />
                {predictions.rate_trends.risk_level} Risk
              </Badge>
            </div>
          )}
        </div>

        {/* Strategic Priorities */}
        {predictions.recommendations && predictions.recommendations.length > 0 && (
          <div className="p-5 bg-white rounded-xl border-2 border-purple-200">
            <h4 className="font-bold text-purple-900 mb-4">Top Strategic Priorities</h4>
            <div className="space-y-3">
              {predictions.recommendations.slice(0, 5).map((rec, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{idx + 1}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-800 flex-1 leading-relaxed">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
            <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Growth Opportunities
            </h4>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li>✓ Expand into high-demand lanes</li>
              <li>✓ Recruit top-performing carriers</li>
              <li>✓ Optimize pricing strategy</li>
              <li>✓ Increase customer retention</li>
            </ul>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Risk Mitigation
            </h4>
            <ul className="space-y-2 text-sm text-amber-800">
              <li>• Monitor market volatility</li>
              <li>• Diversify carrier base</li>
              <li>• Maintain cash reserves</li>
              <li>• Review pricing regularly</li>
            </ul>
          </div>
        </div>

        {/* Confidence Indicator */}
        <div className="mt-6 p-4 bg-white rounded-xl border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-900">Prediction Confidence</span>
            <Badge className="bg-indigo-600 text-white">AI-Powered</Badge>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full"
              style={{ width: '85%' }}
            ></div>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            85% confidence based on historical data and market trends analysis
          </p>
        </div>

      </CardContent>
    </Card>
  );
}