import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wrench, DollarSign, Calendar, TrendingDown } from "lucide-react";

const riskColors = {
  CRITICAL: "bg-red-100 text-red-700 border-red-300",
  HIGH: "bg-orange-100 text-orange-700 border-orange-300",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-300",
  LOW: "bg-blue-100 text-blue-700 border-blue-300"
};

export default function PredictiveAlerts({ predictions, vehicles }) {
  const criticalPredictions = predictions.filter(p => 
    p.safety_risk === 'CRITICAL' || p.critical_issues?.length > 0
  );

  return (
    <div className="space-y-6">
      
      {/* Critical Alerts */}
      {criticalPredictions.length > 0 && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-500">
          <CardHeader className="border-b border-red-200 pb-6">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-6 h-6" />
              Critical Maintenance Alerts ({criticalPredictions.length})
            </CardTitle>
            <p className="text-sm text-red-700 mt-1">
              Immediate attention required
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {criticalPredictions.map((pred) => (
                <div key={pred.vehicle_id} className="p-4 bg-white rounded-xl border-2 border-red-300">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{pred.vehicle_number}</h4>
                      <Badge className="mt-2 bg-red-600 text-white">
                        Safety Risk: {pred.safety_risk}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-red-600">{pred.health_score}</div>
                      <p className="text-xs text-slate-600">Health Score</p>
                    </div>
                  </div>

                  {pred.critical_issues && pred.critical_issues.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 rounded-lg">
                      <h5 className="text-sm font-semibold text-red-900 mb-2">Critical Issues:</h5>
                      <ul className="space-y-1">
                        {pred.critical_issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                            <span className="text-red-600">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                      <Wrench className="w-3 h-3 mr-2" />
                      Schedule Immediate Service
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Predictions */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-6">
          <CardTitle className="text-xl font-bold text-slate-900">
            AI Maintenance Predictions
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Predictive maintenance forecast for all vehicles
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {predictions.map((pred) => {
              const vehicle = vehicles.find(v => v.id === pred.vehicle_id);
              return (
                <div key={pred.vehicle_id} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900">{pred.vehicle_number}</h4>
                      <p className="text-sm text-slate-600">{vehicle?.driver_name}</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${
                        pred.health_score >= 80 ? 'text-emerald-600' :
                        pred.health_score >= 60 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {pred.health_score}
                      </div>
                      <p className="text-xs text-slate-600">Health</p>
                    </div>
                  </div>

                  {/* Risk Badges */}
                  <div className="flex gap-2 mb-4">
                    <Badge variant="outline" className={riskColors[pred.safety_risk]}>
                      Safety: {pred.safety_risk}
                    </Badge>
                    <Badge variant="outline" className={riskColors[pred.downtime_risk]}>
                      Downtime: {pred.downtime_risk}
                    </Badge>
                  </div>

                  {/* Upcoming Maintenance */}
                  {pred.upcoming_maintenance && pred.upcoming_maintenance.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-slate-700 mb-2">Upcoming Services:</h5>
                      <div className="space-y-2">
                        {pred.upcoming_maintenance.slice(0, 3).map((service, idx) => (
                          <div key={idx} className="p-2 bg-white rounded border border-slate-200 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-900">{service.service}</span>
                              <Badge className={`text-xs ${
                                service.priority === 'high' ? 'bg-red-100 text-red-700' :
                                service.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {service.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              Due at {service.due_miles?.toLocaleString()} miles
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cost & Date */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-3 h-3 text-slate-600" />
                        <span className="text-xs text-slate-600">Est. Cost</span>
                      </div>
                      <p className="font-semibold text-slate-900">
                        ${pred.estimated_cost?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        <span className="text-xs text-slate-600">Service By</span>
                      </div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {pred.estimated_service_date ? new Date(pred.estimated_service_date).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  {pred.recommended_actions && pred.recommended_actions.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-xs font-semibold text-slate-600 uppercase mb-2">Recommended:</h5>
                      <p className="text-sm text-slate-700">{pred.recommended_actions[0]}</p>
                    </div>
                  )}

                  <Button size="sm" variant="outline" className="w-full">
                    <Wrench className="w-3 h-3 mr-2" />
                    Schedule Maintenance
                  </Button>

                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}