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
        prompt: `Optimize route for load:
        
Origin: ${load.pickup_location?.city}, ${load.pickup_location?.state}
Destination: ${load.dropoff_location?.city}, ${load.dropoff_location?.state}
Equipment: ${load.equipment_type}
Distance: ${load.distance_miles || 'Unknown'} miles

Provide 3 route options:
1. Fastest route (time optimized)
2. Most fuel-efficient route (cost optimized)
3. Balanced route (time + cost)

For each route include:
- Estimated time (hours)
- Distance (miles)
- Fuel cost estimate
- Toll costs
- Key waypoints/stops
- Traffic considerations
- Weather alerts
- Fuel-efficient driving tips`,
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
                  cons: { type: "array", items: { type: "string" } }
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
                    {route.pros?.length > 0 && (
                      <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
                        ✓ {route.pros[0]}
                      </div>
                    )}
                    {route.cons?.length > 0 && (
                      <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                        ⚠ {route.cons[0]}
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