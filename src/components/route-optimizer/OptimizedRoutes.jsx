import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation, MapPin, Clock, Fuel, TrendingDown, CheckCircle } from "lucide-react";

export default function OptimizedRoutes({ routes }) {
  if (!routes || !routes.optimized_routes) return null;

  const getRouteBadgeColor = (routeType) => {
    const colors = {
      'Fastest': 'bg-blue-600',
      'Shortest': 'bg-emerald-600',
      'Most Fuel-Efficient': 'bg-green-600',
      'Safest': 'bg-indigo-600',
      'Truck-Friendly': 'bg-amber-600'
    };
    return colors[routeType] || 'bg-slate-600';
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-orange-600" />
            Optimized Route Options
          </CardTitle>
          <Badge className="bg-orange-100 text-orange-700">
            {routes.optimized_routes.length} Routes Found
          </Badge>
        </div>
        {routes.optimization_summary && (
          <p className="text-sm text-slate-600 mt-2">{routes.optimization_summary}</p>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {routes.optimized_routes.map((route, idx) => (
            <div key={idx} className={`p-5 rounded-xl border-2 ${
              route.route_name === routes.best_overall 
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300'
                : 'bg-slate-50 border-slate-200'
            }`}>
              
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className={`${getRouteBadgeColor(route.route_type)} text-white`}>
                    {route.route_type}
                  </Badge>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{route.route_name}</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Recommended for: {route.recommended_for}
                    </p>
                  </div>
                </div>
                {route.route_name === routes.best_overall && (
                  <Badge className="bg-emerald-600 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Best Overall
                  </Badge>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid md:grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-slate-600">Distance</p>
                  </div>
                  <p className="text-xl font-bold text-blue-600">{route.total_miles} mi</p>
                  {route.miles_saved > 0 && (
                    <p className="text-xs text-emerald-600 mt-1">
                      <TrendingDown className="w-3 h-3 inline mr-1" />
                      {route.miles_saved} mi saved
                    </p>
                  )}
                </div>

                <div className="p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <p className="text-xs text-slate-600">Time</p>
                  </div>
                  <p className="text-xl font-bold text-indigo-600">{route.estimated_hours}h</p>
                  {route.time_saved_hours > 0 && (
                    <p className="text-xs text-emerald-600 mt-1">
                      {route.time_saved_hours}h saved
                    </p>
                  )}
                </div>

                <div className="p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Fuel className="w-4 h-4 text-amber-600" />
                    <p className="text-xs text-slate-600">Fuel</p>
                  </div>
                  <p className="text-xl font-bold text-amber-600">${route.fuel_cost?.toFixed(0)}</p>
                  {route.cost_savings > 0 && (
                    <p className="text-xs text-emerald-600 mt-1">
                      ${route.cost_savings.toFixed(0)} saved
                    </p>
                  )}
                </div>

                <div className="p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs text-slate-600">CO2</p>
                  </div>
                  <p className="text-xl font-bold text-emerald-600">
                    {route.co2_reduction_lbs?.toFixed(0)} lbs
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">reduced</p>
                </div>
              </div>

              {/* Waypoints */}
              {route.waypoints && route.waypoints.length > 0 && (
                <div className="p-4 bg-white rounded-lg mb-4">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Route Waypoints:</p>
                  <div className="flex flex-wrap gap-2">
                    {route.waypoints.map((waypoint, wIdx) => (
                      <Badge key={wIdx} variant="outline" className="text-xs">
                        {wIdx + 1}. {waypoint}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {route.highlights && route.highlights.length > 0 && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 mb-4">
                  <p className="text-xs font-semibold text-emerald-900 mb-2">Route Highlights:</p>
                  <ul className="space-y-1">
                    {route.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="text-xs text-emerald-800">
                        ✓ {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Issues */}
              {route.potential_issues && route.potential_issues.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-4">
                  <p className="text-xs font-semibold text-amber-900 mb-2">Potential Issues:</p>
                  <ul className="space-y-1">
                    {route.potential_issues.map((issue, iIdx) => (
                      <li key={iIdx} className="text-xs text-amber-800">
                        ⚠ {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Select Route Button */}
              <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Select This Route
              </Button>

            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}