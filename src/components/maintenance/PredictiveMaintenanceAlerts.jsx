import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wrench, Clock, TrendingUp, Calendar } from "lucide-react";

export default function PredictiveMaintenanceAlerts({ drivers, loads, equipment }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const analyzeMaintenance = async () => {
      if (!drivers || drivers.length === 0) return;

      setLoading(true);
      try {
        const driversWithEquipment = drivers.filter(d => d.equipment_assigned);
        
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Predict maintenance needs for fleet vehicles:

DRIVERS & EQUIPMENT:
${JSON.stringify(driversWithEquipment.slice(0, 15).map(d => ({
  driver: `${d.first_name} ${d.last_name}`,
  equipment: d.equipment_assigned,
  total_loads: d.total_loads,
  on_time: d.on_time_percentage,
  status: d.status
})), null, 2)}

RECENT ACTIVITY:
- Total active loads: ${loads?.filter(l => l.status === 'in_transit').length || 0}
- Average loads per driver: ${drivers.length > 0 ? (loads?.length / drivers.length).toFixed(1) : 0}

Analyze and predict:
1. Which vehicles need maintenance soon (mileage, usage patterns)
2. Severity level (critical, high, medium, low)
3. Estimated days until service needed
4. Type of service (oil change, tire rotation, brake inspection, etc.)
5. Impact on operations if delayed`,
          response_json_schema: {
            type: "object",
            properties: {
              alerts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    equipment_id: { type: "string" },
                    driver_name: { type: "string" },
                    severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                    service_type: { type: "string" },
                    days_until_needed: { type: "number" },
                    estimated_downtime_hours: { type: "number" },
                    impact: { type: "string" }
                  }
                }
              }
            }
          }
        });

        setAlerts(result.alerts || []);
      } catch (error) {
        console.error('Predictive maintenance error:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeMaintenance();
    const interval = setInterval(analyzeMaintenance, 24 * 60 * 60 * 1000); // Daily
    return () => clearInterval(interval);
  }, [drivers, loads]);

  if (alerts.length === 0) return null;

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wrench className="w-5 h-5 text-orange-600" />
          Predictive Maintenance
          {criticalAlerts.length > 0 && (
            <Badge className="ml-auto bg-red-600">{criticalAlerts.length} Critical</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.slice(0, 5).map((alert, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg border ${
              alert.severity === 'critical'
                ? 'bg-red-50 border-red-300'
                : alert.severity === 'high'
                ? 'bg-orange-50 border-orange-300'
                : 'bg-yellow-50 border-yellow-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`w-4 h-4 ${
                    alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
                  }`} />
                  <span className="text-sm font-semibold text-slate-900">
                    {alert.equipment_id} - {alert.driver_name}
                  </span>
                </div>
                <p className="text-xs text-slate-700">{alert.service_type}</p>
                <p className="text-xs text-slate-600 mt-1">{alert.impact}</p>
              </div>
              <Badge className={
                alert.severity === 'critical' ? 'bg-red-600' :
                alert.severity === 'high' ? 'bg-orange-600' : 'bg-yellow-600'
              }>
                {alert.severity.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{alert.days_until_needed} days</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{alert.estimated_downtime_hours}h downtime</span>
              </div>
            </div>
            <Button size="sm" className="w-full mt-2" variant="outline">
              Schedule Service
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}