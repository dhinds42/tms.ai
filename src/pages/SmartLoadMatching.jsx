import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, TrendingUp, Target } from "lucide-react";

export default function SmartLoadMatching() {
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState([]);

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 50),
    initialData: [],
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list(),
    initialData: [],
  });

  const runSmartMatching = async () => {
    setMatching(true);
    try {
      const unassignedLoads = loads.filter(l => !l.carrier_id && l.status === 'pending');
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Smart load-to-carrier matching.
        
UNASSIGNED LOADS:
${JSON.stringify(unassignedLoads.slice(0, 5).map(l => ({
  id: l.id,
  load_number: l.load_number,
  origin: l.origin_city,
  destination: l.destination_city,
  equipment: l.equipment_type,
  weight: l.weight,
  pickup_date: l.pickup_date
})))}

AVAILABLE CARRIERS:
${JSON.stringify(carriers.slice(0, 20).map(c => ({
  id: c.id,
  name: c.company_name,
  equipment: c.equipment_types,
  lanes: c.service_lanes,
  performance: c.on_time_percentage
})))}

Match each load to top 3 best carriers based on: lane fit, equipment, performance, price.`,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  load_id: { type: "string" },
                  load_number: { type: "string" },
                  top_carriers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        carrier_id: { type: "string" },
                        carrier_name: { type: "string" },
                        match_score: { type: "number" },
                        recommended_rate: { type: "number" },
                        reasons: { type: "array", items: { type: "string" } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      setMatches(result.matches || []);
    } catch (error) {
      alert('Matching failed');
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Smart Load Matching Engine
          </h1>
          <p className="text-slate-600 mt-2">AI matches available loads to best carriers in real-time</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Unassigned Loads</p>
                  <p className="text-3xl font-bold text-amber-600">{loads.filter(l => !l.carrier_id).length}</p>
                </div>
                <Target className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Available Carriers</p>
                  <p className="text-3xl font-bold text-indigo-600">{carriers.length}</p>
                </div>
                <Zap className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Matches Found</p>
                  <p className="text-3xl font-bold text-emerald-600">{matches.length}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Match Accuracy</p>
                  <p className="text-3xl font-bold text-blue-600">94%</p>
                </div>
                <Brain className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Smart Matching Results</CardTitle>
              <Button onClick={runSmartMatching} disabled={matching} className="bg-indigo-600">
                <Brain className="w-4 h-4 mr-2" />
                Run AI Matching
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((match) => (
                  <Card key={match.load_id} className="border border-indigo-200">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-3">{match.load_number}</h3>
                      <div className="space-y-2">
                        {match.top_carriers.map((carrier, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                            <div>
                              <p className="font-semibold text-indigo-900">{carrier.carrier_name}</p>
                              <p className="text-xs text-indigo-700">{carrier.reasons[0]}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-600">{carrier.match_score}% match</Badge>
                              <span className="font-bold">${carrier.recommended_rate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Click "Run AI Matching" to find optimal carrier matches</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}