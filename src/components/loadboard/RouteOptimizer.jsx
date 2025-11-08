import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, Sparkles, Loader2, CheckCircle, Clock, MapPin, Zap } from "lucide-react";

export default function RouteOptimizer({ load, drivers, onRouteOptimized }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState(null);

  useEffect(() => {
    if (load && drivers.length > 0) {
      optimizeRoute();
    }
  }, [load, drivers]);

  const optimizeRoute = async () => {
    setIsOptimizing(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI route optimization agent for freight transportation.

LOAD DETAILS:
- Route: ${load.pickup_location?.city}, ${load.pickup_location?.state} → ${load.dropoff_location?.city}, ${load.dropoff_location?.state}
- Distance: ${load.distance_miles || 'Unknown'} miles
- Pickup Date: ${load.pickup_date}
- Equipment: ${load.equipment_type}
- Priority: ${load.priority || 'medium'}

AVAILABLE DRIVERS:
${drivers.map(d => `
- ${d.full_name}
  Current Location: ${d.current_location?.city || 'Unknown'}, ${d.current_location?.state || 'Unknown'}
  HOS Remaining: ${d.hos_remaining || 0} hours
  Home Terminal: ${d.home_terminal?.city || 'Unknown'}, ${d.home_terminal?.state || 'Unknown'}
  Status: ${d.status}
  On-Time %: ${d.on_time_percentage || 0}%
  Rating: ${d.rating || 0}/5
`).join('\n')}

OPTIMIZATION REQUIREMENTS:
1. Recommend the BEST driver for this load
2. Calculate:
   - Deadhead miles to pickup
   - Total trip miles (deadhead + loaded)
   - Estimated fuel cost
   - Driver's HOS availability
   - Estimated arrival time
   - Route efficiency score (0-100)
3. Provide optimization reasoning
4. Alternative driver recommendations (2nd and 3rd choice)
5. Suggested route optimizations (avoid traffic, tolls, etc.)
6. Time-critical considerations
7. Cost-benefit analysis

Consider:
- Proximity to pickup location
- HOS compliance
- Driver performance record
- Home terminal proximity for backhaul
- Load priority and timing`,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_driver_id: { type: "string" },
            recommended_driver_name: { type: "string" },
            deadhead_miles: { type: "number" },
            total_miles: { type: "number" },
            estimated_fuel_cost: { type: "number" },
            hos_adequate: { type: "boolean" },
            estimated_arrival: { type: "string" },
            route_efficiency_score: { type: "number" },
            optimization_reasons: {
              type: "array",
              items: { type: "string" }
            },
            alternative_drivers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            route_suggestions: {
              type: "array",
              items: { type: "string" }
            },
            time_considerations: { type: "string" },
            cost_benefit: { type: "string" }
          }
        }
      });

      setOptimization(result);

    } catch (error) {
      console.error('Route optimization error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  if (!optimization && isOptimizing) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <h3 className="font-semibold text-slate-900 mb-2">Optimizing Route...</h3>
          <p className="text-sm text-slate-600">AI is analyzing all available drivers and routes</p>
        </CardContent>
      </Card>
    );
  }

  if (!optimization) return null;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-l-blue-500">
      <CardHeader className="border-b border-blue-200 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl text-blue-900">
                AI Route Optimization Results
              </CardTitle>
              <p className="text-sm text-blue-700 mt-1">
                Optimal driver and route for {load.load_number || `Load #${load.id.slice(0, 8)}`}
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{optimization.route_efficiency_score}</div>
            <p className="text-xs text-slate-600">Efficiency Score</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        {/* Recommended Driver */}
        <div className="p-5 bg-white rounded-xl border-2 border-blue-300 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge className="bg-blue-600 text-white mb-2">RECOMMENDED DRIVER</Badge>
              <h3 className="font-bold text-slate-900 text-lg">{optimization.recommended_driver_name}</h3>
            </div>
            {optimization.hos_adequate && (
              <Badge className="bg-emerald-100 text-emerald-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                HOS Compliant
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="p-3 bg-slate-50 rounded-lg text-center">
              <MapPin className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-xs text-slate-600">Deadhead</p>
              <p className="font-bold text-amber-600">{optimization.deadhead_miles} mi</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-center">
              <Navigation className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-slate-600">Total Miles</p>
              <p className="font-bold text-blue-600">{optimization.total_miles} mi</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-center">
              <Zap className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs text-slate-600">Fuel Cost</p>
              <p className="font-bold text-emerald-600">${optimization.estimated_fuel_cost}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-center">
              <Clock className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <p className="text-xs text-slate-600">ETA</p>
              <p className="font-bold text-indigo-600 text-xs">
                {new Date(optimization.estimated_arrival).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg mb-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Why This Driver:</h4>
            <ul className="space-y-1">
              {optimization.optimization_reasons?.map((reason, idx) => (
                <li key={idx} className="text-sm text-blue-800">• {reason}</li>
              ))}
            </ul>
          </div>

          <Button
            onClick={() => onRouteOptimized({
              load_id: load.id,
              recommended_driver_id: optimization.recommended_driver_id,
              estimated_arrival: optimization.estimated_arrival,
              deadhead_miles: optimization.deadhead_miles
            })}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Assign to {optimization.recommended_driver_name}
          </Button>
        </div>

        {/* Route Suggestions */}
        {optimization.route_suggestions && optimization.route_suggestions.length > 0 && (
          <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200 mb-4">
            <h4 className="font-semibold text-cyan-900 mb-2">Route Optimization Tips:</h4>
            <ul className="space-y-1">
              {optimization.route_suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-cyan-800">• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternative Drivers */}
        {optimization.alternative_drivers && optimization.alternative_drivers.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Alternative Options:</h4>
            <div className="space-y-2">
              {optimization.alternative_drivers.map((alt, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{alt.name}</span>
                    <Badge className="bg-slate-200 text-slate-700">Option {idx + 2}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{alt.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}