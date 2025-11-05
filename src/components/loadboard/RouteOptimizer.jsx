import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, Zap, Clock, Fuel, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

export default function RouteOptimizer({ load, drivers, onRouteOptimized }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [error, setError] = useState(null);

  const optimizeRoute = async () => {
    if (!load.pickup_location || !load.dropoff_location) {
      setError("Load must have pickup and dropoff locations");
      return;
    }

    setIsOptimizing(true);
    setError(null);
    setOptimizedRoute(null);

    try {
      // Get available drivers with good HOS
      const availableDrivers = drivers.filter(d => 
        d.status === 'available' && (d.hos_remaining || 0) >= 3
      );

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI route optimization system for a transportation management system (TMS). 

Analyze the following load and provide optimized routing recommendations:

LOAD DETAILS:
- Pickup: ${load.pickup_location.city}, ${load.pickup_location.state}
- Dropoff: ${load.dropoff_location.city}, ${load.dropoff_location.state}
- Distance: ${load.distance_miles || 'Unknown'} miles
- Equipment: ${load.equipment_type}
- Pickup Time: ${load.pickup_date || 'Not specified'}
- Delivery Time: ${load.delivery_date || 'Not specified'}

AVAILABLE DRIVERS (${availableDrivers.length}):
${availableDrivers.map(d => `- ${d.full_name}: ${d.hos_remaining || 0}h HOS, Location: ${d.current_location?.city || 'Unknown'}, ${d.current_location?.state || ''}, On-time: ${d.on_time_percentage || 0}%`).join('\n')}

Please analyze and provide:
1. Optimal driver selection (consider HOS availability, current location, and on-time %)
2. Estimated drive time (hours) accounting for realistic traffic patterns
3. Route optimization strategy (direct vs scenic, toll roads, etc)
4. Fuel efficiency rating (1-10, where 10 is most efficient)
5. Traffic risk assessment (low/medium/high)
6. HOS compliance check - will driver have enough hours?
7. Any alerts or warnings (weather, construction, HOS concerns)
8. Alternative route options if applicable

Return detailed route optimization data.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_driver_id: { type: "string" },
            recommended_driver_name: { type: "string" },
            estimated_drive_time_hours: { type: "number" },
            estimated_arrival: { type: "string" },
            route_strategy: { type: "string" },
            fuel_efficiency_score: { type: "number" },
            traffic_risk: { type: "string" },
            hos_compliance: { type: "string" },
            alerts: { 
              type: "array",
              items: { type: "string" }
            },
            alternative_routes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  time_difference_hours: { type: "number" },
                  fuel_impact: { type: "string" }
                }
              }
            },
            optimization_summary: { type: "string" }
          }
        }
      });

      setOptimizedRoute(result);
      
      if (onRouteOptimized) {
        onRouteOptimized({
          ...result,
          load_id: load.id
        });
      }

    } catch (err) {
      setError(err.message || 'Failed to optimize route');
      console.error('Route optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      medium: 'bg-amber-100 text-amber-700 border-amber-300',
      high: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[risk?.toLowerCase()] || colors.medium;
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="border-b border-indigo-200 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                AI Route Optimizer
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Powered by real-time traffic, HOS, and fuel efficiency analysis
              </p>
            </div>
          </div>
          <Badge className="bg-indigo-600 text-white">AI-Powered</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        {!optimizedRoute && !isOptimizing && (
          <div className="text-center py-8">
            <Navigation className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-6">
              Optimize this route using AI-powered analysis of traffic, HOS, and fuel efficiency
            </p>
            <Button
              onClick={optimizeRoute}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50"
            >
              <Zap className="w-4 h-4 mr-2" />
              Optimize Route
            </Button>
          </div>
        )}

        {isOptimizing && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600 font-medium">
              Analyzing traffic patterns, HOS availability, and route options...
            </p>
            <p className="text-sm text-slate-500 mt-2">This may take a few seconds</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Optimization Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {optimizedRoute && (
          <div className="space-y-6">
            
            {/* Summary */}
            <div className="p-4 bg-white rounded-xl border border-indigo-200 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">Optimization Complete</h3>
                  <p className="text-sm text-slate-600">{optimizedRoute.optimization_summary}</p>
                </div>
              </div>
            </div>

            {/* Driver Recommendation */}
            <div className="p-4 bg-white rounded-xl border border-indigo-200 shadow-sm">
              <h4 className="font-semibold text-slate-900 mb-3">Recommended Driver</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg text-indigo-600">{optimizedRoute.recommended_driver_name}</p>
                  <p className="text-sm text-slate-600">Best match for this route</p>
                </div>
                <Badge className="bg-emerald-600 text-white">Optimal Match</Badge>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-xl border border-indigo-200 text-center">
                <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Drive Time</p>
                <p className="text-xl font-bold text-slate-900">
                  {optimizedRoute.estimated_drive_time_hours}h
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-indigo-200 text-center">
                <Fuel className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Fuel Score</p>
                <p className="text-xl font-bold text-emerald-600">
                  {optimizedRoute.fuel_efficiency_score}/10
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-indigo-200 text-center">
                <Navigation className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Traffic Risk</p>
                <Badge variant="outline" className={getRiskColor(optimizedRoute.traffic_risk)}>
                  {optimizedRoute.traffic_risk}
                </Badge>
              </div>

              <div className="p-4 bg-white rounded-xl border border-indigo-200 text-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">HOS</p>
                <p className="text-sm font-medium text-slate-900">
                  {optimizedRoute.hos_compliance}
                </p>
              </div>
            </div>

            {/* Route Strategy */}
            <div className="p-4 bg-white rounded-xl border border-indigo-200">
              <h4 className="font-semibold text-slate-900 mb-2">Route Strategy</h4>
              <p className="text-slate-700">{optimizedRoute.route_strategy}</p>
            </div>

            {/* Alerts */}
            {optimizedRoute.alerts && optimizedRoute.alerts.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 mb-2">Alerts & Warnings</h4>
                    <ul className="space-y-1">
                      {optimizedRoute.alerts.map((alert, index) => (
                        <li key={index} className="text-sm text-amber-800">• {alert}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Alternative Routes */}
            {optimizedRoute.alternative_routes && optimizedRoute.alternative_routes.length > 0 && (
              <div className="p-4 bg-white rounded-xl border border-indigo-200">
                <h4 className="font-semibold text-slate-900 mb-3">Alternative Routes</h4>
                <div className="space-y-3">
                  {optimizedRoute.alternative_routes.map((alt, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900 mb-1">{alt.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span>Time: {alt.time_difference_hours > 0 ? '+' : ''}{alt.time_difference_hours}h</span>
                        <span>Fuel: {alt.fuel_impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Re-optimize Button */}
            <Button
              onClick={optimizeRoute}
              variant="outline"
              className="w-full"
              disabled={isOptimizing}
            >
              <Zap className="w-4 h-4 mr-2" />
              Re-optimize Route
            </Button>

          </div>
        )}

      </CardContent>
    </Card>
  );
}