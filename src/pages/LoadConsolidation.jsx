import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, TrendingUp, Package, Brain } from "lucide-react";

import LoadOptimizer from "../components/optimization/LoadOptimizer";

export default function LoadConsolidation() {
  const [analyzing, setAnalyzing] = useState(false);
  const [opportunities, setOpportunities] = useState([]);

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const findConsolidationOpportunities = async () => {
    setAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these loads for consolidation opportunities:
${JSON.stringify(loads.slice(0, 20).map(l => ({
  id: l.id,
  origin: l.origin_city,
  destination: l.destination_city,
  weight: l.weight,
  pickup_date: l.pickup_date
})))}

Find loads that can be consolidated based on similar lanes and timing.`,
        response_json_schema: {
          type: "object",
          properties: {
            opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  load_ids: { type: "array", items: { type: "string" } },
                  combined_weight: { type: "number" },
                  savings_potential: { type: "number" },
                  lane: { type: "string" }
                }
              }
            }
          }
        }
      });
      setOpportunities(result.opportunities || []);
    } catch (error) {
      alert('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            Load Consolidation AI
          </h1>
          <p className="text-slate-600 mt-2">Smart grouping to maximize trailer utilization</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Available Loads</p>
                  <p className="text-3xl font-bold text-purple-600">{loads.filter(l => l.status === 'pending').length}</p>
                </div>
                <Package className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Opportunities</p>
                  <p className="text-3xl font-bold text-emerald-600">{opportunities.length}</p>
                </div>
                <Layers className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Potential Savings</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    ${opportunities.reduce((sum, o) => sum + o.savings_potential, 0).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Consolidation Opportunities</CardTitle>
              <Button onClick={findConsolidationOpportunities} disabled={analyzing} className="bg-purple-600">
                <Brain className="w-4 h-4 mr-2" />
                Find Opportunities
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {opportunities.length > 0 ? (
              <div className="space-y-4">
                {opportunities.map((opp, idx) => (
                  <Card key={idx} className="border border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-purple-900">{opp.lane}</p>
                          <p className="text-sm text-purple-700">{opp.load_ids.length} loads • {opp.combined_weight} lbs</p>
                        </div>
                        <Badge className="bg-emerald-600">Save ${opp.savings_potential}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Click "Find Opportunities" to analyze loads</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Load Optimizer */}
        <LoadOptimizer />

      </div>
    </div>
  );
}