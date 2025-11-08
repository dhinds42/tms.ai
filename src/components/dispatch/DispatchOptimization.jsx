import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Target } from "lucide-react";

export default function DispatchOptimization({ summary, riskFactors, immediateActions }) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      
      {/* Optimization Metrics */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="border-b border-blue-200 pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="w-5 h-5" />
            Optimization Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Fleet Utilization</p>
              <p className="text-2xl font-bold text-blue-600">
                {summary?.fleet_utilization?.toFixed(0)}%
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Avg Deadhead Miles</p>
              <p className="text-2xl font-bold text-amber-600">
                {summary?.avg_deadhead_miles?.toFixed(0)} mi
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Forecast On-Time %</p>
              <p className="text-2xl font-bold text-emerald-600">
                {summary?.forecast_on_time?.toFixed(0)}%
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Revenue per Mile</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${summary?.revenue_per_mile?.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="border-b border-amber-200 pb-4">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-5 h-5" />
            Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-2">
            {riskFactors?.map((risk, idx) => (
              <li key={idx} className="p-3 bg-white rounded-lg text-sm text-amber-900 border border-amber-200">
                • {risk}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Immediate Actions */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
        <CardHeader className="border-b border-emerald-200 pb-4">
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <Target className="w-5 h-5" />
            Immediate Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {immediateActions?.map((action, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={
                    action.priority === 'HIGH' ? 'bg-red-600 text-white' :
                    action.priority === 'MEDIUM' ? 'bg-amber-600 text-white' :
                    'bg-blue-600 text-white'
                  }>
                    {action.priority}
                  </Badge>
                </div>
                <p className="text-sm text-slate-900 font-medium mb-1">{action.action}</p>
                <p className="text-xs text-emerald-700">{action.impact}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}