import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, TrendingDown, Fuel, Clock, MapPin, Zap, BarChart3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function RouteOptimizationEngine() {
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const queryClient = useQueryClient();

  const { data: loads } = useQuery({
    queryKey: ['activeLoads'],
    queryFn: () => base44.entities.Load.filter({ 
      status: { $in: ['assigned', 'dispatched', 'in_transit'] }
    }, '-created_date', 50),
    initialData: [],
  });

  const runOptimization = async () => {
    setOptimizing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze and optimize routes for ${loads.length} active loads:
        
${loads.map(l => `Load ${l.load_number}: ${l.pickup_location?.city}, ${l.pickup_location?.state} → ${l.dropoff_location?.city}, ${l.dropoff_location?.state}`).join('\n')}

Provide route optimization recommendations including:
- Consolidated routes
- Fuel savings opportunities
- Time efficiency improvements
- Backhaul opportunities
- Multi-stop optimization`,
        response_json_schema: {
          type: "object",
          properties: {
            optimizedRoutes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  routeName: { type: "string" },
                  loads: { type: "array", items: { type: "string" } },
                  totalMiles: { type: "number" },
                  fuelSavings: { type: "number" },
                  timeSavings: { type: "number" },
                  recommendation: { type: "string" }
                }
              }
            },
            totalSavings: {
              type: "object",
              properties: {
                miles: { type: "number" },
                fuel: { type: "number" },
                time: { type: "number" },
                cost: { type: "number" }
              }
            }
          }
        }
      });
      setOptimizationResults(result);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const applyOptimization = useMutation({
    mutationFn: async (route) => {
      // Update loads with optimized route info
      const updatePromises = route.loads.map(loadNumber => {
        const load = loads.find(l => l.load_number === loadNumber);
        if (load) {
          return base44.entities.Load.update(load.id, {
            special_instructions: `Optimized Route: ${route.routeName} - ${route.recommendation}`
          });
        }
      });
      return Promise.all(updatePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activeLoads']);
    },
  });

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>AI Route Optimization Engine</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Multi-stop optimization & fuel efficiency</p>
            </div>
          </div>
          <Button
            onClick={runOptimization}
            disabled={optimizing || loads.length === 0}
            className="bg-gradient-to-r from-emerald-600 to-teal-600"
          >
            <Zap className="w-4 h-4 mr-2" />
            {optimizing ? 'Optimizing...' : 'Run Optimization'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">

          {/* Active Loads Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{loads.length}</p>
              <p className="text-xs text-slate-600 mt-1">Active Loads</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-600">
                {optimizationResults ? `${optimizationResults.totalSavings?.miles || 0}` : '--'}
              </p>
              <p className="text-xs text-slate-600 mt-1">Miles Saved</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
              <Fuel className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-600">
                {optimizationResults ? `$${optimizationResults.totalSavings?.fuel?.toLocaleString() || 0}` : '--'}
              </p>
              <p className="text-xs text-slate-600 mt-1">Fuel Savings</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">
                {optimizationResults ? `${optimizationResults.totalSavings?.time || 0}h` : '--'}
              </p>
              <p className="text-xs text-slate-600 mt-1">Time Saved</p>
            </div>
          </div>

          {/* Optimization Results */}
          {optimizationResults && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Optimized Routes ({optimizationResults.optimizedRoutes?.length || 0})
                </h3>
                <Badge className="bg-emerald-600">
                  Total Savings: ${optimizationResults.totalSavings?.cost?.toLocaleString() || 0}
                </Badge>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {optimizationResults.optimizedRoutes?.map((route, idx) => (
                  <Card key={idx} className="border border-slate-200 hover:border-emerald-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">{route.routeName}</h4>
                          <p className="text-sm text-slate-600 mt-1">{route.recommendation}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => applyOptimization.mutate(route)}
                          disabled={applyOptimization.isPending}
                          className="bg-emerald-600"
                        >
                          Apply
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <p className="text-xs text-slate-600">Loads</p>
                          <p className="text-lg font-bold text-slate-900">{route.loads?.length || 0}</p>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <p className="text-xs text-slate-600">Miles</p>
                          <p className="text-lg font-bold text-blue-600">{route.totalMiles}</p>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <p className="text-xs text-slate-600">Fuel Saved</p>
                          <p className="text-lg font-bold text-emerald-600">${route.fuelSavings}</p>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <p className="text-xs text-slate-600">Time Saved</p>
                          <p className="text-lg font-bold text-purple-600">{route.timeSavings}h</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {route.loads?.map((loadNum, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {loadNum}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!optimizationResults && !optimizing && (
            <div className="text-center py-12 text-slate-600">
              <Navigation className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p>Run optimization to get AI-powered route recommendations</p>
            </div>
          )}

          {optimizing && (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Analyzing routes and calculating optimal paths...</p>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}