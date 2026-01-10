import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, AlertTriangle, CheckCircle, TrendingUp, Sparkles, Clock } from "lucide-react";

import MaintenanceSchedule from "../components/maintenance/MaintenanceSchedule";
import PredictiveAlerts from "../components/maintenance/PredictiveAlerts";
import VehicleHealthDashboard from "../components/maintenance/VehicleHealthDashboard";
import MaintenanceHistory from "../components/maintenance/MaintenanceHistory";

export default function MaintenanceAlerts() {
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictions, setPredictions] = useState(null);

  const { data: drivers, isLoading } = useScopedEntity('Driver', { limit: 100 });
  const { data: loads, isLoading: loadsLoading } = useScopedEntity('Load', { limit: 100 });

  // Simulate vehicle data (in production, this would come from telematics/ELD)
  const vehicles = drivers.map((driver, index) => ({
    id: `vehicle_${index}`,
    driver_id: driver.id,
    driver_name: driver.full_name,
    vehicle_number: driver.equipment_assigned || `TRUCK-${index + 1}`,
    make_model: 'Freightliner Cascadia',
    year: 2020 + (index % 4),
    mileage: 150000 + (index * 25000),
    last_service_date: new Date(Date.now() - (30 + index * 10) * 24 * 60 * 60 * 1000).toISOString(),
    last_service_miles: 145000 + (index * 25000),
    engine_hours: 8000 + (index * 1000),
    status: index % 5 === 0 ? 'critical' : index % 3 === 0 ? 'warning' : 'healthy'
  }));

  const runPredictiveAnalysis = async () => {
    setIsPredicting(true);

    try {
      const analysisPromises = vehicles.slice(0, 10).map(async (vehicle) => {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a predictive maintenance AI analyzing commercial vehicle data.

VEHICLE DATA:
- Vehicle: ${vehicle.vehicle_number} (${vehicle.make_model}, ${vehicle.year})
- Current Mileage: ${vehicle.mileage.toLocaleString()} miles
- Last Service: ${vehicle.last_service_date} at ${vehicle.last_service_miles.toLocaleString()} miles
- Miles Since Service: ${(vehicle.mileage - vehicle.last_service_miles).toLocaleString()}
- Engine Hours: ${vehicle.engine_hours}
- Driver: ${vehicle.driver_name}

PREDICT MAINTENANCE NEEDS:
1. Overall Vehicle Health Score (0-100)
2. Critical Issues (list any immediate maintenance needs)
3. Upcoming Maintenance (services due within 30 days)
4. Recommended Actions (prioritized list)
5. Predicted Failure Risks (components at risk)
6. Estimated Service Date (when next service needed)
7. Estimated Service Cost ($)
8. Downtime Risk (LOW/MEDIUM/HIGH)
9. Safety Risk Level (LOW/MEDIUM/HIGH/CRITICAL)

Consider:
- Typical service intervals (oil every 15k miles, brakes every 50k, etc.)
- Age and mileage of vehicle
- Engine hours vs miles (indicates idle time)
- Time since last service
- Commercial vehicle inspection requirements`,
          response_json_schema: {
            type: "object",
            properties: {
              health_score: { type: "number" },
              critical_issues: {
                type: "array",
                items: { type: "string" }
              },
              upcoming_maintenance: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    service: { type: "string" },
                    due_miles: { type: "number" },
                    priority: { type: "string" }
                  }
                }
              },
              recommended_actions: {
                type: "array",
                items: { type: "string" }
              },
              failure_risks: {
                type: "array",
                items: { type: "string" }
              },
              estimated_service_date: { type: "string" },
              estimated_cost: { type: "number" },
              downtime_risk: { type: "string" },
              safety_risk: { type: "string" }
            }
          }
        });

        return {
          vehicle_id: vehicle.id,
          vehicle_number: vehicle.vehicle_number,
          ...result
        };
      });

      const results = await Promise.all(analysisPromises);
      setPredictions(results);
    } catch (error) {
      console.error('Predictive analysis error:', error);
      alert('Failed to run predictive analysis');
    } finally {
      setIsPredicting(false);
    }
  };

  const criticalVehicles = vehicles.filter(v => v.status === 'critical').length;
  const warningVehicles = vehicles.filter(v => v.status === 'warning').length;
  const healthyVehicles = vehicles.filter(v => v.status === 'healthy').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-orange-900 to-red-900 bg-clip-text text-transparent mb-2">
            Predictive Maintenance Alerts
          </h1>
          <p className="text-slate-600 text-lg">
            AI-powered vehicle health monitoring and maintenance forecasting
          </p>
          <Badge className="mt-3 bg-orange-600">Predictive AI</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Fleet</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{vehicles.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Critical</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{criticalVehicles}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Warning</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{warningVehicles}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Healthy</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{healthyVehicles}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Predictive Analysis Control */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Run Predictive Analysis</h3>
                <p className="text-sm text-slate-600 mt-1">
                  AI will analyze all vehicles and predict maintenance needs
                </p>
              </div>
              <Button
                onClick={runPredictiveAnalysis}
                disabled={isPredicting}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-lg hover:shadow-orange-500/50"
              >
                {isPredicting ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Run AI Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Predictive Alerts */}
        {predictions && (
          <PredictiveAlerts predictions={predictions} vehicles={vehicles} />
        )}

        {/* Vehicle Health Dashboard */}
        <VehicleHealthDashboard vehicles={vehicles} />

        {/* Maintenance Schedule */}
        <MaintenanceSchedule vehicles={vehicles} />

        {/* Maintenance History */}
        <MaintenanceHistory vehicles={vehicles} />

      </div>
    </div>
  );
}