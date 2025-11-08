import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingDown } from "lucide-react";

export default function RouteComparison({ routes }) {
  if (!routes || !routes.current_route || !routes.optimized_routes) return null;

  const bestRoute = routes.optimized_routes[0];

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
      <CardHeader className="border-b border-emerald-200 pb-6">
        <CardTitle className="flex items-center gap-2 text-emerald-900">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          Route Comparison: Current vs Optimized
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Current Route */}
          <div className="p-5 bg-white rounded-xl border-2 border-slate-300">
            <h4 className="font-bold text-slate-900 mb-4">Current Route</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Distance:</span>
                <span className="font-semibold text-slate-900">
                  {routes.current_route.miles} miles
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Time:</span>
                <span className="font-semibold text-slate-900">
                  {routes.current_route.hours} hours
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Fuel:</span>
                <span className="font-semibold text-slate-900">
                  {routes.current_route.fuel_gallons} gallons
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-semibold text-slate-900">Fuel Cost:</span>
                <span className="font-bold text-slate-900 text-lg">
                  ${routes.current_route.fuel_cost?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Optimized Route */}
          <div className="p-5 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl border-2 border-emerald-400">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-emerald-900">Best Optimized Route</h4>
              <TrendingDown className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-emerald-800">Distance:</span>
                <div className="text-right">
                  <span className="font-semibold text-emerald-900 block">
                    {bestRoute.total_miles} miles
                  </span>
                  {bestRoute.miles_saved > 0 && (
                    <span className="text-xs text-emerald-700">
                      -{bestRoute.miles_saved} mi saved
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-emerald-800">Time:</span>
                <div className="text-right">
                  <span className="font-semibold text-emerald-900 block">
                    {bestRoute.estimated_hours} hours
                  </span>
                  {bestRoute.time_saved_hours > 0 && (
                    <span className="text-xs text-emerald-700">
                      -{bestRoute.time_saved_hours}h saved
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-emerald-800">Fuel:</span>
                <div className="text-right">
                  <span className="font-semibold text-emerald-900 block">
                    {bestRoute.fuel_gallons} gallons
                  </span>
                  {bestRoute.fuel_gallons < routes.current_route.fuel_gallons && (
                    <span className="text-xs text-emerald-700">
                      -{(routes.current_route.fuel_gallons - bestRoute.fuel_gallons).toFixed(1)}g saved
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between border-t border-emerald-300 pt-2">
                <span className="text-sm font-semibold text-emerald-900">Fuel Cost:</span>
                <div className="text-right">
                  <span className="font-bold text-emerald-900 text-lg block">
                    ${bestRoute.fuel_cost?.toFixed(2)}
                  </span>
                  {bestRoute.cost_savings > 0 && (
                    <span className="text-xs font-semibold text-emerald-700">
                      Save ${bestRoute.cost_savings.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Savings Summary */}
        <div className="mt-6 p-5 bg-white rounded-xl border-2 border-emerald-300">
          <h4 className="font-bold text-emerald-900 mb-4 text-center">Total Savings with Optimization</h4>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">
                {bestRoute.miles_saved}
              </p>
              <p className="text-xs text-slate-600 mt-1">Miles Saved</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {bestRoute.time_saved_hours}h
              </p>
              <p className="text-xs text-slate-600 mt-1">Time Saved</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">
                ${bestRoute.cost_savings?.toFixed(0)}
              </p>
              <p className="text-xs text-slate-600 mt-1">Cost Savings</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {bestRoute.co2_reduction_lbs?.toFixed(0)}
              </p>
              <p className="text-xs text-slate-600 mt-1">CO2 Reduced (lbs)</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}