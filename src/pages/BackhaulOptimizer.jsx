import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, Sparkles, TrendingUp, MapPin, DollarSign, Loader2 } from "lucide-react";

import BackhaulMatches from "../components/backhaul/BackhaulMatches";
import DeadheadAnalysis from "../components/backhaul/DeadheadAnalysis";
import BackhaulOpportunities from "../components/backhaul/BackhaulOpportunities";

export default function BackhaulOptimizer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [backhaulMatches, setBackhaulMatches] = useState([]);

  const { data: loads, isLoading: loadsLoading } = useScopedEntity('Load', { limit: 100 });
  const { data: drivers, isLoading: driversLoading } = useScopedEntity('Driver', { limit: 100 });

  const deliveredLoads = loads.filter(l => l.status === 'delivered');
  const availableLoads = loads.filter(l => l.status === 'available');

  const runBackhaulAnalysis = async () => {
    setIsAnalyzing(true);
    setBackhaulMatches([]);

    try {
      const analysisPromises = deliveredLoads.slice(0, 5).map(async (completedLoad) => {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an AI backhaul optimization agent for a freight carrier.

COMPLETED LOAD:
- Driver delivered at: ${completedLoad.dropoff_location?.city}, ${completedLoad.dropoff_location?.state}
- Equipment Type: ${completedLoad.equipment_type}
- Delivery Date: ${completedLoad.actual_delivery || completedLoad.delivery_date}

AVAILABLE LOADS IN MARKET:
${availableLoads.slice(0, 20).map(l => `
- Load: ${l.load_number || l.id.slice(0, 8)}
  Pickup: ${l.pickup_location?.city}, ${l.pickup_location?.state}
  Dropoff: ${l.dropoff_location?.city}, ${l.dropoff_location?.state}
  Equipment: ${l.equipment_type}
  Rate: $${l.customer_rate || 'TBD'}
  Pickup Date: ${l.pickup_date}
  Distance: ${l.distance_miles || 'Unknown'} miles
`).join('\n')}

Find the BEST backhaul opportunities considering:
1. Proximity to delivery location (minimize deadhead miles)
2. Equipment type match
3. Timing (pickup date feasibility)
4. Rate and profitability
5. Direction toward driver's home terminal if known

Return top 3 backhaul matches with:
- Load details
- Deadhead miles from current location to pickup
- Match score (0-100)
- Estimated profit (rate minus fuel cost for deadhead)
- Reasons why it's a good match
- Time to pickup location
- Total miles (deadhead + loaded)`,
          response_json_schema: {
            type: "object",
            properties: {
              matches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    load_id: { type: "string" },
                    match_score: { type: "number" },
                    deadhead_miles: { type: "number" },
                    loaded_miles: { type: "number" },
                    total_miles: { type: "number" },
                    estimated_profit: { type: "number" },
                    time_to_pickup_hours: { type: "number" },
                    match_reasons: {
                      type: "array",
                      items: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        });

        return {
          completed_load: completedLoad,
          backhaul_matches: result.matches?.map(match => {
            const load = availableLoads.find(l => 
              l.id === match.load_id || 
              l.load_number === match.load_id ||
              l.id.startsWith(match.load_id)
            );
            return {
              ...match,
              load
            };
          }) || []
        };
      });

      const results = await Promise.all(analysisPromises);
      setBackhaulMatches(results.filter(r => r.backhaul_matches.length > 0));

    } catch (error) {
      console.error('Backhaul analysis error:', error);
      alert('Failed to analyze backhaul opportunities');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deadheadMiles = deliveredLoads.reduce((sum, l) => sum + (l.distance_miles || 0), 0) * 0.15; // Estimate 15% deadhead
  const potentialSavings = deadheadMiles * 1.50; // $1.50 per mile saved

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-cyan-500/30">
            <Navigation className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 bg-clip-text text-transparent mb-2">
            AI Backhaul Optimizer
          </h1>
          <p className="text-slate-600 text-lg">
            Maximize revenue by finding optimal backhaul loads and minimizing deadhead
          </p>
          <Badge className="mt-3 bg-cyan-600">AI-Powered</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Est. Deadhead Miles</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{deadheadMiles.toFixed(0)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Potential Savings</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">${potentialSavings.toFixed(0)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Available Loads</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{availableLoads.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
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
                <h3 className="font-semibold text-slate-900 text-lg">Find Backhaul Opportunities</h3>
                <p className="text-sm text-slate-600 mt-1">
                  AI will analyze delivery locations and find optimal backhaul loads
                </p>
              </div>
              <Button
                onClick={runBackhaulAnalysis}
                disabled={isAnalyzing || deliveredLoads.length === 0}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Find Backhauls
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backhaul Matches */}
        {backhaulMatches.length > 0 && (
          <BackhaulMatches matches={backhaulMatches} />
        )}

        {/* Deadhead Analysis */}
        <DeadheadAnalysis loads={deliveredLoads} />

        {/* Opportunities */}
        <BackhaulOpportunities availableLoads={availableLoads} />

      </div>
    </div>
  );
}