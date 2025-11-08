import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, Sparkles, TrendingDown, MapPin, Fuel, Clock, Loader2, Route } from "lucide-react";

import OptimizedRoutes from "../components/route-optimizer/OptimizedRoutes";
import RouteComparison from "../components/route-optimizer/RouteComparison";
import MultiStopOptimization from "../components/route-optimizer/MultiStopOptimization";
import FuelSavingsAnalysis from "../components/route-optimizer/FuelSavingsAnalysis";

export default function RouteOptimizer() {
  const [optimizing, setOptimizing] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [optimizedRoutes, setOptimizedRoutes] = useState(null);
  const [multiStopLoads, setMultiStopLoads] = useState([]);

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
  });

  const activeLoads = loads.filter(l => ['assigned', 'dispatched', 'picked_up', 'in_transit'].includes(l.status));
  const totalMiles = activeLoads.reduce((sum, l) => sum + (l.distance_miles || 0), 0);
  const avgFuelPrice = 3.85;
  const estimatedGallons = totalMiles / 6.5;
  const currentFuelCost = estimatedGallons * avgFuelPrice;

  const runRouteOptimization = async (loadId) => {
    setOptimizing(true);
    setSelectedLoad(loadId);

    try {
      const load = loads.find(l => l.id === loadId);
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI route optimization engine for freight transportation.

LOAD TO OPTIMIZE:
- Load: ${load.load_number || load.id.slice(0, 8)}
- Origin: ${load.pickup_location?.city}, ${load.pickup_location?.state}
- Destination: ${load.dropoff_location?.city}, ${load.dropoff_location?.state}
- Current Distance: ${load.distance_miles || 'Unknown'} miles
- Equipment: ${load.equipment_type}
- Priority: ${load.priority || 'medium'}
- Pickup Date: ${load.pickup_date}
- Special Instructions: ${load.special_instructions || 'None'}
- Temperature Requirements: ${load.temperature_requirements || 'N/A'}

OPTIMIZATION OBJECTIVES:
1. Find SHORTEST route (minimize miles)
2. Find FASTEST route (minimize time)
3. Find MOST FUEL-EFFICIENT route (avoid hills, traffic)
4. Find SAFEST route (avoid high-crime areas, bad weather)
5. Find TRUCK-FRIENDLY route (avoid low bridges, weight restrictions)

For each route option, provide:
- Route name/type
- Total miles
- Estimated hours
- Fuel gallons needed
- Fuel cost estimate
- Key waypoints (3-5 major cities along route)
- Route highlights (why this route is good)
- Potential issues (tolls, weather, restrictions)
- Recommended for (speed/cost/safety priority)

Also calculate:
- Miles saved vs current route
- Time saved vs current route
- Fuel cost savings
- CO2 emissions reduction

Provide 3-4 optimized route options ranked by different priorities.`,
        response_json_schema: {
          type: "object",
          properties: {
            current_route: {
              type: "object",
              properties: {
                miles: { type: "number" },
                hours: { type: "number" },
                fuel_gallons: { type: "number" },
                fuel_cost: { type: "number" }
              }
            },
            optimized_routes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  route_name: { type: "string" },
                  route_type: { type: "string" },
                  total_miles: { type: "number" },
                  estimated_hours: { type: "number" },
                  fuel_gallons: { type: "number" },
                  fuel_cost: { type: "number" },
                  waypoints: {
                    type: "array",
                    items: { type: "string" }
                  },
                  highlights: {
                    type: "array",
                    items: { type: "string" }
                  },
                  potential_issues: {
                    type: "array",
                    items: { type: "string" }
                  },
                  recommended_for: { type: "string" },
                  miles_saved: { type: "number" },
                  time_saved_hours: { type: "number" },
                  cost_savings: { type: "number" },
                  co2_reduction_lbs: { type: "number" }
                }
              }
            },
            best_overall: { type: "string" },
            optimization_summary: { type: "string" }
          }
        }
      });

      setOptimizedRoutes({
        ...result,
        load_id: loadId,
        load
      });

    } catch (error) {
      console.error('Route optimization error:', error);
      alert('Failed to optimize route');
    } finally {
      setOptimizing(false);
    }
  };

  const runMultiStopOptimization = async () => {
    if (multiStopLoads.length < 2) {
      alert('Please select at least 2 loads for multi-stop optimization');
      return;
    }

    setOptimizing(true);

    try {
      const selectedLoadDetails = multiStopLoads.map(id => loads.find(l => l.id === id));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI multi-stop route optimization engine.

LOADS TO SEQUENCE:
${selectedLoadDetails.map((l, idx) => `
${idx + 1}. Load ${l.load_number || l.id.slice(0, 8)}
   Pickup: ${l.pickup_location?.city}, ${l.pickup_location?.state}
   Dropoff: ${l.dropoff_location?.city}, ${l.dropoff_location?.state}
   Priority: ${l.priority || 'medium'}
   Pickup Date: ${l.pickup_date}
`).join('\n')}

OPTIMIZE THE SEQUENCE TO:
1. Minimize total miles driven
2. Respect pickup date priorities
3. Minimize backtracking
4. Group geographically close stops
5. Balance driver workload

Provide:
- Optimal stop sequence (order to execute loads)
- Route efficiency score (0-100)
- Total miles for optimized vs unoptimized
- Time savings estimate
- Fuel savings estimate
- Reasoning for sequence chosen
- Alternative sequences if applicable

Calculate consolidated metrics:
- Total miles
- Total drive time
- Total fuel cost
- Miles saved vs separate trips
- Efficiency improvement percentage`,
        response_json_schema: {
          type: "object",
          properties: {
            optimal_sequence: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  order: { type: "number" },
                  load_id: { type: "string" },
                  action: { type: "string" },
                  location: { type: "string" },
                  cumulative_miles: { type: "number" }
                }
              }
            },
            efficiency_score: { type: "number" },
            optimized_miles: { type: "number" },
            unoptimized_miles: { type: "number" },
            miles_saved: { type: "number" },
            time_saved_hours: { type: "number" },
            fuel_cost_optimized: { type: "number" },
            fuel_cost_saved: { type: "number" },
            efficiency_improvement: { type: "number" },
            reasoning: { type: "string" },
            alternative_sequences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  score: { type: "number" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      setOptimizedRoutes({
        type: 'multi-stop',
        ...result,
        loads: selectedLoadDetails
      });

    } catch (error) {
      console.error('Multi-stop optimization error:', error);
      alert('Failed to optimize multi-stop route');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
            <Navigation className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-orange-900 to-red-900 bg-clip-text text-transparent mb-2">
            AI Route Optimizer
          </h1>
          <p className="text-slate-600 text-lg">
            Intelligent route planning with fuel savings, time optimization, and multi-stop efficiency
          </p>
          <Badge className="mt-3 bg-orange-600">Smart Routing</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Routes</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{activeLoads.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl">
                  <Route className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Miles</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{totalMiles.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Fuel Cost</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">${(currentFuelCost / 1000).toFixed(1)}K</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-2xl">
                  <Fuel className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Potential Savings</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {optimizedRoutes ? `$${(optimizedRoutes.optimized_routes?.[0]?.cost_savings || 0).toFixed(0)}` : '--'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Single Load Optimization */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-6">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-orange-600" />
              Single Load Route Optimization
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Find the best route for individual loads considering speed, cost, and safety
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLoads.slice(0, 9).map((load) => (
                <div key={load.id} className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-orange-300 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {load.load_number || `#${load.id.slice(0, 8)}`}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {load.pickup_location?.city} → {load.dropoff_location?.city}
                      </p>
                    </div>
                    <Badge className={
                      load.priority === 'urgent' ? 'bg-red-600' :
                      load.priority === 'high' ? 'bg-amber-600' :
                      'bg-blue-600'
                    }>
                      {load.priority || 'medium'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="p-2 bg-white rounded">
                      <p className="text-slate-600">Distance</p>
                      <p className="font-semibold text-slate-900">{load.distance_miles || '?'} mi</p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <p className="text-slate-600">Equipment</p>
                      <p className="font-semibold text-slate-900 capitalize">
                        {load.equipment_type?.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => runRouteOptimization(load.id)}
                    disabled={optimizing && selectedLoad === load.id}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white"
                    size="sm"
                  >
                    {optimizing && selectedLoad === load.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Optimize Route
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Multi-Stop Optimization */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader className="border-b border-indigo-200 pb-6">
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Route className="w-5 h-5 text-indigo-600" />
              Multi-Stop Route Optimization
            </CardTitle>
            <p className="text-sm text-indigo-700 mt-1">
              Combine multiple loads into a single optimized route sequence
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Select loads to combine ({multiStopLoads.length} selected):
              </p>
              <div className="flex flex-wrap gap-2">
                {activeLoads.slice(0, 15).map((load) => (
                  <label key={load.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={multiStopLoads.includes(load.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setMultiStopLoads([...multiStopLoads, load.id]);
                        } else {
                          setMultiStopLoads(multiStopLoads.filter(id => id !== load.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">
                      {load.load_number || `#${load.id.slice(0, 8)}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={runMultiStopOptimization}
              disabled={optimizing || multiStopLoads.length < 2}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
              {optimizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Optimizing Sequence...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Optimize Multi-Stop Route
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Optimization Results */}
        {optimizedRoutes && (
          <>
            {optimizedRoutes.type === 'multi-stop' ? (
              <MultiStopOptimization data={optimizedRoutes} />
            ) : (
              <>
                <OptimizedRoutes routes={optimizedRoutes} />
                <RouteComparison routes={optimizedRoutes} />
                <FuelSavingsAnalysis routes={optimizedRoutes} />
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}