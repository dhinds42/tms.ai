import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, DollarSign, Clock, Fuel, TrendingDown, Zap, MapPin } from "lucide-react";

export default function AIRouteOptimization({ load, onOptimize }) {
  const [optimizing, setOptimizing] = useState(false);
  const [routes, setRoutes] = useState(null);

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Optimize route for load with real-time data:
        
Origin: ${load.pickup_location?.city}, ${load.pickup_location?.state}
Destination: ${load.dropoff_location?.city}, ${load.dropoff_location?.state}
Equipment: ${load.equipment_type}
Distance: ${load.distance_miles || 'Unknown'} miles
Pickup: ${load.pickup_date || 'ASAP'}

Analyze current conditions and provide 3 optimized routes:
1. FASTEST: Time-critical delivery (minimize hours)
2. ECONOMICAL: Cost-optimized (minimize fuel + tolls)
3. BALANCED: Best time/cost ratio

For EACH route provide:
- Total distance (miles)
- Estimated time (hours, consider traffic)
- Fuel cost ($, diesel at $3.80/gal, 6.5 mpg average)
- Toll costs ($)
- Total operating cost
- Savings vs fastest route
- Current traffic conditions (real-time)
- Weather alerts & road conditions
- Recommended rest stops (every 8-10 hours)
- HOS compliance checkpoints
- Truck-friendly amenities (fuel, food, parking)
- Key waypoints with timing
- 3 pros and 3 cons for this route
- Risk factors (construction, weight restrictions, low bridges)`,
        response_json_schema: {
          type: "object",
          properties: {
            routes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  distance_miles: { type: "number" },
                  time_hours: { type: "number" },
                  fuel_cost: { type: "number" },
                  toll_cost: { type: "number" },
                  total_cost: { type: "number" },
                  waypoints: { type: "array", items: { type: "string" } },
                  savings_vs_fastest: { type: "number" },
                  pros: { type: "array", items: { type: "string" } },
                  cons: { type: "array", items: { type: "string" } },
                  traffic_status: { type: "string" },
                  weather_conditions: { type: "string" },
                  rest_stops: { type: "array", items: { type: "string" } },
                  risk_level: { type: "string", enum: ["low", "medium", "high"] }
                }
              }
            }
          }
        }
      });

      setRoutes(result.routes || []);
    } catch (error) {
      console.error('Route optimization error:', error);
      alert('Failed to optimize route');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-indigo-600" />
          AI Route Optimization
          <Badge className="ml-auto bg-indigo-600">AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {!routes ? (
          <Button
            onClick={handleOptimize}
            disabled={optimizing}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            {optimizing ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing Routes...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Optimize Route
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            {routes.map((route, i) => (
              <Card key={i} className="border-2 hover:border-indigo-400 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900">{route.name}</h4>
                    {route.savings_vs_fastest > 0 && (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        Save ${route.savings_vs_fastest}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{route.time_hours}h</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span>{route.distance_miles} mi</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Fuel className="w-4 h-4 text-slate-500" />
                      <span>${route.fuel_cost}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      <span>${route.total_cost} total</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {route.traffic_status && (
                      <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded flex items-center gap-1">
                        <span>🚦</span> {route.traffic_status}
                      </div>
                    )}
                    {route.weather_conditions && (
                      <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded flex items-center gap-1">
                        <span>🌤️</span> {route.weather_conditions}
                      </div>
                    )}
                    {route.rest_stops && route.rest_stops.length > 0 && (
                      <div className="text-xs text-indigo-700 bg-indigo-50 p-2 rounded">
                        <strong>Rest Stops:</strong> {route.rest_stops.slice(0, 2).join(', ')}
                      </div>
                    )}
                    {route.pros?.length > 0 && (
                      <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
                        ✓ {route.pros[0]}
                      </div>
                    )}
                    {route.risk_level && route.risk_level !== 'low' && (
                      <div className={`text-xs p-2 rounded ${
                        route.risk_level === 'high' ? 'text-red-700 bg-red-50' : 'text-amber-700 bg-amber-50'
                      }`}>
                        ⚠ {route.risk_level.toUpperCase()} RISK
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => onOptimize(route)}
                    className="w-full mt-3"
                    size="sm"
                  >
                    Select This Route
                  </Button>
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={() => setRoutes(null)}
              variant="outline"
              className="w-full"
            >
              Optimize Again
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}