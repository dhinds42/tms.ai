import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Route, CheckCircle, TrendingUp, MapPin } from "lucide-react";

export default function MultiStopOptimization({ data }) {
  if (!data || !data.optimal_sequence) return null;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="border-b border-indigo-200 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <Route className="w-5 h-5 text-indigo-600" />
            Multi-Stop Route Optimization
          </CardTitle>
          <Badge className="bg-indigo-600 text-white text-lg px-4 py-2">
            Efficiency: {data.efficiency_score}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded-xl border border-indigo-200 text-center">
            <p className="text-sm text-slate-600 mb-1">Optimized Miles</p>
            <p className="text-3xl font-bold text-indigo-600">
              {data.optimized_miles}
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-indigo-200 text-center">
            <p className="text-sm text-slate-600 mb-1">Miles Saved</p>
            <p className="text-3xl font-bold text-emerald-600">
              {data.miles_saved}
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-indigo-200 text-center">
            <p className="text-sm text-slate-600 mb-1">Time Saved</p>
            <p className="text-3xl font-bold text-blue-600">
              {data.time_saved_hours}h
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-indigo-200 text-center">
            <p className="text-sm text-slate-600 mb-1">Fuel Saved</p>
            <p className="text-3xl font-bold text-amber-600">
              ${data.fuel_cost_saved?.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Optimization Reasoning */}
        <div className="p-5 bg-white rounded-xl border-2 border-indigo-200 mb-6">
          <h4 className="font-semibold text-indigo-900 mb-2">Optimization Strategy</h4>
          <p className="text-sm text-slate-700">{data.reasoning}</p>
        </div>

        {/* Optimal Sequence */}
        <div className="p-5 bg-white rounded-xl border-2 border-indigo-200 mb-6">
          <h4 className="font-semibold text-indigo-900 mb-4">Optimized Stop Sequence</h4>
          <div className="space-y-3">
            {data.optimal_sequence.map((stop, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {stop.order}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={
                      stop.action === 'Pickup' ? 'bg-blue-600' : 'bg-emerald-600'
                    }>
                      {stop.action}
                    </Badge>
                    <span className="font-semibold text-slate-900">
                      {stop.location}
                    </span>
                  </div>
                  {stop.load_id && (
                    <p className="text-xs text-slate-600">
                      Load: {data.loads?.find(l => l.id === stop.load_id)?.load_number || stop.load_id.slice(0, 8)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-indigo-600">
                    {stop.cumulative_miles} mi
                  </p>
                  <p className="text-xs text-slate-600">Total so far</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Metrics */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-300">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h4 className="font-bold text-emerald-900">Efficiency Improvement</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Efficiency Gain</p>
              <p className="text-3xl font-bold text-emerald-600">
                +{data.efficiency_improvement?.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">vs Separate Trips</p>
              <p className="text-3xl font-bold text-emerald-600">
                {data.unoptimized_miles} mi
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Would have driven without optimization
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Sequences */}
        {data.alternative_sequences && data.alternative_sequences.length > 0 && (
          <div className="mt-6 p-5 bg-white rounded-xl border-2 border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-4">Alternative Route Options</h4>
            <div className="space-y-3">
              {data.alternative_sequences.map((alt, idx) => (
                <div key={idx} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">{alt.name}</span>
                    <Badge variant="outline">{alt.score}/100</Badge>
                  </div>
                  <p className="text-sm text-slate-700">{alt.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}