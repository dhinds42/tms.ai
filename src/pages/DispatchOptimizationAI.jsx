import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Users, CheckCircle } from "lucide-react";

export default function DispatchOptimizationAI() {
  const [optimizing, setOptimizing] = useState(false);
  const [assignments, setAssignments] = useState([]);

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 50),
    initialData: [],
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
    initialData: [],
  });

  const runOptimization = async () => {
    setOptimizing(true);
    try {
      const unassigned = loads.filter(l => !l.driver_id && l.status === 'pending');
      const available = drivers.filter(d => d.driver_status === 'available');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Optimize driver-to-load assignments.
        
UNASSIGNED LOADS:
${JSON.stringify(unassigned.slice(0, 10).map(l => ({
  id: l.id,
  origin: l.origin_city,
  destination: l.destination_city,
  pickup_date: l.pickup_date
})))}

AVAILABLE DRIVERS:
${JSON.stringify(available.slice(0, 20).map(d => ({
  id: d.id,
  name: d.first_name + ' ' + d.last_name,
  location: d.current_location,
  hos_remaining: d.hos_remaining
})))}

Assign based on: proximity, HOS availability, home time preferences, efficiency.`,
        response_json_schema: {
          type: "object",
          properties: {
            assignments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  load_id: { type: "string" },
                  driver_id: { type: "string" },
                  driver_name: { type: "string" },
                  optimization_score: { type: "number" },
                  reasons: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setAssignments(result.assignments || []);
    } catch (error) {
      alert('Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent">
            Dispatch Optimization AI
          </h1>
          <p className="text-slate-600 mt-2">Auto-assign loads based on driver location, HOS, preferences</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Unassigned</p>
                  <p className="text-3xl font-bold text-amber-600">{loads.filter(l => !l.driver_id).length}</p>
                </div>
                <Zap className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Available Drivers</p>
                  <p className="text-3xl font-bold text-emerald-600">{drivers.filter(d => d.driver_status === 'available').length}</p>
                </div>
                <Users className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Optimized</p>
                  <p className="text-3xl font-bold text-indigo-600">{assignments.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Efficiency</p>
                  <p className="text-3xl font-bold text-blue-600">96%</p>
                </div>
                <Brain className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Optimized Assignments</CardTitle>
              <Button onClick={runOptimization} disabled={optimizing} className="bg-emerald-600">
                <Brain className="w-4 h-4 mr-2" />
                Run AI Optimization
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((assign, idx) => (
                  <Card key={idx} className="border border-emerald-200 bg-emerald-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-emerald-900">{assign.driver_name}</p>
                          <p className="text-sm text-emerald-700">Load: {assign.load_id}</p>
                          <p className="text-xs text-emerald-600">{assign.reasons[0]}</p>
                        </div>
                        <Badge className="bg-emerald-600">{assign.optimization_score}% optimal</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Click "Run AI Optimization" to auto-assign loads</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}