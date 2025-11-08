import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Target, Zap } from "lucide-react";

export default function DispatchOptimization({ summary, riskFactors, immediateActions }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      
      {/* Optimization Summary */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader className="border-b border-blue-200 pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Optimization Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {summary && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-blue-200">
                <p className="text-xs text-slate-600 mb-1">Fleet Utilization</p>
                <p className="text-3xl font-bold text-blue-600">
                  {summary.fleet_utilization?.toFixed(0)}%
                </p>
                <Badge className={
                  summary.fleet_utilization >= 85 ? 'bg-emerald-600 mt-2' :
                  summary.fleet_utilization >= 70 ? 'bg-amber-600 mt-2' :
                  'bg-red-600 mt-2'
                }>
                  {summary.fleet_utilization >= 85 ? 'Excellent' :
                   summary.fleet_utilization >= 70 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>

              <div className="p-4 bg-white rounded-xl border border-blue-200">
                <p className="text-xs text-slate-600 mb-1">Avg Deadhead</p>
                <p className="text-3xl font-bold text-amber-600">
                  {summary.avg_deadhead_miles?.toFixed(0)}mi
                </p>
                <Badge className={
                  summary.avg_deadhead_miles <= 50 ? 'bg-emerald-600 mt-2' :
                  summary.avg_deadhead_miles <= 100 ? 'bg-amber-600 mt-2' :
                  'bg-red-600 mt-2'
                }>
                  {summary.avg_deadhead_miles <= 50 ? 'Excellent' :
                   summary.avg_deadhead_miles <= 100 ? 'Good' : 'High'}
                </Badge>
              </div>

              <div className="p-4 bg-white rounded-xl border border-blue-200">
                <p className="text-xs text-slate-600 mb-1">On-Time Forecast</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {summary.forecast_on_time?.toFixed(0)}%
                </p>
                <Badge className="bg-emerald-600 mt-2">
                  Target: 95%
                </Badge>
              </div>

              <div className="p-4 bg-white rounded-xl border border-blue-200">
                <p className="text-xs text-slate-600 mb-1">Revenue/Mile</p>
                <p className="text-3xl font-bold text-indigo-600">
                  ${summary.revenue_per_mile?.toFixed(2)}
                </p>
                <Badge className={
                  summary.revenue_per_mile >= 2.0 ? 'bg-emerald-600 mt-2' :
                  summary.revenue_per_mile >= 1.5 ? 'bg-amber-600 mt-2' :
                  'bg-red-600 mt-2'
                }>
                  {summary.revenue_per_mile >= 2.0 ? 'Excellent' :
                   summary.revenue_per_mile >= 1.5 ? 'Good' : 'Low'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Immediate Actions & Risks */}
      <div className="space-y-6">
        
        {/* Immediate Actions */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="border-b border-emerald-200 pb-4">
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <Zap className="w-5 h-5 text-emerald-600" />
              Immediate Actions ({immediateActions?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {immediateActions && immediateActions.length > 0 ? (
              <div className="space-y-3">
                {immediateActions.map((action, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-xl border border-emerald-200">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={
                        action.priority === 'high' ? 'bg-red-600 text-white' :
                        action.priority === 'medium' ? 'bg-amber-600 text-white' :
                        'bg-blue-600 text-white'
                      }>
                        {action.priority} priority
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {action.impact}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{action.action}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 text-center py-4">
                No immediate actions required
              </p>
            )}
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="border-b border-amber-200 pb-4">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Risk Factors ({riskFactors?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {riskFactors && riskFactors.length > 0 ? (
              <ul className="space-y-2">
                {riskFactors.map((risk, idx) => (
                  <li key={idx} className="p-3 bg-white rounded-lg border border-amber-200 text-sm text-amber-900">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>{risk}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600 text-center py-4">
                No significant risks identified
              </p>
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  );
}