import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Sparkles, TrendingUp, Clock, Loader2, Navigation, BarChart2 } from "lucide-react";

import DispatchRecommendations from "../components/dispatch/DispatchRecommendations";
import LoadPriority from "../components/dispatch/LoadPriority";
import DriverAvailability from "../components/dispatch/DriverAvailability";
import DispatchOptimization from "../components/dispatch/DispatchOptimization";

export default function DispatchAssistant() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dispatchPlan, setDispatchPlan] = useState(null);

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const availableLoads = loads.filter(l => ['available', 'tendered'].includes(l.status));
  const availableDrivers = drivers.filter(d => d.status === 'available' && (d.hos_remaining || 0) > 4);

  const runDispatchAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI dispatch assistant for a freight ${operatingMode} operation.

CURRENT SITUATION:
- Available Loads: ${availableLoads.length}
- Available ${operatingMode === 'carrier' ? 'Drivers' : 'Carriers'}: ${operatingMode === 'carrier' ? availableDrivers.length : carriers.length}
- Operating Mode: ${operatingMode}

AVAILABLE LOADS:
${availableLoads.slice(0, 10).map(l => `
Load: ${l.load_number || l.id.slice(0, 8)}
Route: ${l.pickup_location?.city}, ${l.pickup_location?.state} → ${l.dropoff_location?.city}, ${l.dropoff_location?.state}
Distance: ${l.distance_miles || 'Unknown'} miles
Pickup: ${l.pickup_date}
Equipment: ${l.equipment_type}
Rate: $${l.customer_rate || 'TBD'}
Priority: ${l.priority || 'medium'}
`).join('\n')}

${operatingMode === 'carrier' ? `
AVAILABLE DRIVERS:
${availableDrivers.slice(0, 10).map(d => `
Driver: ${d.full_name}
Location: ${d.current_location?.city || 'Unknown'}, ${d.current_location?.state || 'Unknown'}
HOS: ${d.hos_remaining || 0} hours
Home: ${d.home_terminal?.city || 'Unknown'}
Rating: ${d.rating || 0}/5
On-Time: ${d.on_time_percentage || 0}%
`).join('\n')}
` : `
AVAILABLE CARRIERS:
${carriers.slice(0, 10).map(c => `
Carrier: ${c.company_name}
Equipment: ${c.equipment_types?.join(', ') || 'Various'}
Rating: ${c.rating || 0}/5
On-Time: ${c.on_time_percentage || 0}%
Compliance: ${c.compliance_score || 0}%
`).join('\n')}
`}

CREATE OPTIMAL DISPATCH PLAN:

1. **Load Prioritization** (rank loads by urgency):
   - Consider pickup dates
   - Factor in priority levels
   - Account for customer relationships
   - Identify time-critical shipments

2. **Resource Matching** (${operatingMode === 'carrier' ? 'driver' : 'carrier'}-to-load assignments):
   - Proximity to pickup location
   - Equipment compatibility
   - HOS/availability
   - Performance history
   - Cost efficiency

3. **Route Optimization**:
   - Minimize deadhead miles
   - Maximize backhaul opportunities
   - Consider driver home time
   - Fuel cost optimization

4. **Efficiency Metrics**:
   - Fleet utilization percentage
   - Average deadhead miles
   - On-time performance forecast
   - Revenue per mile optimization

5. **Risk Assessment**:
   - Capacity constraints
   - Time window conflicts
   - Equipment shortages
   - Service failures

6. **Action Items** (top 5 immediate dispatch decisions)

Provide specific, actionable dispatch recommendations with reasoning.`,
        response_json_schema: {
          type: "object",
          properties: {
            prioritized_loads: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  load_id: { type: "string" },
                  priority_rank: { type: "number" },
                  urgency_reason: { type: "string" },
                  recommended_assignment: { type: "string" }
                }
              }
            },
            resource_matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  load_id: { type: "string" },
                  resource_id: { type: "string" },
                  resource_name: { type: "string" },
                  match_score: { type: "number" },
                  deadhead_miles: { type: "number" },
                  reasoning: { type: "string" }
                }
              }
            },
            optimization_summary: {
              type: "object",
              properties: {
                fleet_utilization: { type: "number" },
                avg_deadhead_miles: { type: "number" },
                forecast_on_time: { type: "number" },
                revenue_per_mile: { type: "number" }
              }
            },
            risk_factors: {
              type: "array",
              items: { type: "string" }
            },
            immediate_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  impact: { type: "string" }
                }
              }
            }
          }
        }
      });

      setDispatchPlan(result);

    } catch (error) {
      console.error('Dispatch analysis error:', error);
      alert('Failed to generate dispatch plan');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            AI Dispatch Assistant
          </h1>
          <p className="text-slate-600 text-lg">
            Intelligent load-to-{operatingMode === 'carrier' ? 'driver' : 'carrier'} matching and optimization
          </p>
          <Badge className="mt-3 bg-purple-600">Real-time Optimization</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Available Loads</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{availableLoads.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Available {operatingMode === 'carrier' ? 'Drivers' : 'Carriers'}
                  </p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {operatingMode === 'carrier' ? availableDrivers.length : carriers.length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Utilization</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {dispatchPlan?.optimization_summary?.fleet_utilization?.toFixed(0) || '--'}%
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <BarChart2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Deadhead</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    {dispatchPlan?.optimization_summary?.avg_deadhead_miles?.toFixed(0) || '--'} mi
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Control */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Generate Dispatch Plan</h3>
                <p className="text-sm text-slate-600 mt-1">
                  AI will analyze all loads and resources to create optimal assignments
                </p>
              </div>
              <Button
                onClick={runDispatchAnalysis}
                disabled={isAnalyzing || loadsLoading || driversLoading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

        {dispatchPlan && (
          <>
            {/* Dispatch Recommendations */}
            <DispatchRecommendations 
              matches={dispatchPlan.resource_matches}
              loads={loads}
              resources={operatingMode === 'carrier' ? drivers : carriers}
              mode={operatingMode}
            />

            {/* Load Priority */}
            <LoadPriority 
              prioritizedLoads={dispatchPlan.prioritized_loads}
              loads={loads}
            />

            {/* Optimization Summary */}
            <DispatchOptimization 
              summary={dispatchPlan.optimization_summary}
              riskFactors={dispatchPlan.risk_factors}
              immediateActions={dispatchPlan.immediate_actions}
            />

            {/* Driver/Carrier Availability */}
            {operatingMode === 'carrier' && (
              <DriverAvailability drivers={availableDrivers} />
            )}
          </>
        )}

      </div>
    </div>
  );
}