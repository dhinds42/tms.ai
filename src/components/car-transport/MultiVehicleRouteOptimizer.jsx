import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Navigation, Zap } from "lucide-react";

export default function MultiVehicleRouteOptimizer({ vehicles }) {
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState(null);

  const optimizeRoute = async () => {
    if (!vehicles || vehicles.length === 0) {
      alert('No vehicles to optimize');
      return;
    }

    setOptimizing(true);
    try {
      // Group vehicles by proximity
      const pickups = vehicles.map(v => v.pickup_location_id).filter(Boolean);
      const deliveries = vehicles.map(v => v.delivery_location_id).filter(Boolean);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Optimize auto transport route for ${vehicles.length} vehicles:

Vehicles: ${vehicles.map(v => `${v.year} ${v.make} ${v.model} (VIN: ${v.vin})`).join(', ')}

Pickup Locations: ${pickups.join(', ')}
Delivery Locations: ${deliveries.join(', ')}

Optimize for:
1. Most efficient pickup sequence (minimize deadhead)
2. Logical delivery order based on geography
3. Trailer utilization (suggest 6-8 vehicle capacity)
4. Estimated total miles
5. Recommended stops

Return optimized route plan with pickup sequence, delivery sequence, total miles, and hauler type (open/enclosed).`,
        response_json_schema: {
          type: "object",
          properties: {
            pickup_sequence: { type: "array", items: { type: "string" } },
            delivery_sequence: { type: "array", items: { type: "string" } },
            total_miles: { type: "number" },
            estimated_transit_days: { type: "number" },
            recommended_hauler_type: { type: "string" },
            trailer_capacity_used: { type: "number" },
            route_notes: { type: "string" }
          }
        }
      });

      setOptimizedRoute(result);

    } catch (error) {
      alert('Route optimization failed: ' + error.message);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-indigo-600" />
          Multi-Vehicle Route Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-900 font-semibold">Vehicles to Optimize</p>
              <p className="text-3xl font-bold text-indigo-600 mt-1">{vehicles?.length || 0}</p>
            </div>
            <Truck className="w-12 h-12 text-indigo-600 opacity-20" />
          </div>
        </div>

        <Button 
          onClick={optimizeRoute}
          disabled={optimizing || !vehicles || vehicles.length === 0}
          className="w-full bg-indigo-600 py-6"
        >
          <Zap className="w-5 h-5 mr-2" />
          {optimizing ? 'Optimizing Route...' : 'Optimize Multi-Vehicle Route'}
        </Button>

        {optimizedRoute && (
          <div className="space-y-4 mt-6">
            
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-600">Total Miles</p>
                <p className="text-2xl font-bold text-slate-900">{optimizedRoute.total_miles}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-600">Transit Days</p>
                <p className="text-2xl font-bold text-slate-900">{optimizedRoute.estimated_transit_days}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-600">Capacity Used</p>
                <p className="text-2xl font-bold text-slate-900">{optimizedRoute.trailer_capacity_used}</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-900 mb-2">📍 Pickup Sequence</h4>
              <ol className="space-y-1">
                {optimizedRoute.pickup_sequence?.map((stop, idx) => (
                  <li key={idx} className="text-sm text-emerald-800">
                    {idx + 1}. {stop}
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">🎯 Delivery Sequence</h4>
              <ol className="space-y-1">
                {optimizedRoute.delivery_sequence?.map((stop, idx) => (
                  <li key={idx} className="text-sm text-blue-800">
                    {idx + 1}. {stop}
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-purple-900">Recommended Hauler</h4>
                <Badge className="bg-purple-600">
                  {optimizedRoute.recommended_hauler_type}
                </Badge>
              </div>
              <p className="text-sm text-purple-800">{optimizedRoute.route_notes}</p>
            </div>

          </div>
        )}

      </CardContent>
    </Card>
  );
}