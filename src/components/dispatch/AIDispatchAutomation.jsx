import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle, Clock, TrendingUp } from "lucide-react";

export default function AIDispatchAutomation({ loads, drivers, carriers, enabled = true }) {
  const [autoAssignments, setAutoAssignments] = useState([]);
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  const updateLoadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Load.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loads'] }),
  });

  useEffect(() => {
    if (!enabled) return;

    const runAutoDispatch = async () => {
      const unassignedLoads = loads?.filter(l => 
        !l.driver_id && !l.carrier_id && l.status === 'available'
      ).slice(0, 3) || [];

      if (unassignedLoads.length === 0) return;

      setProcessing(true);
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Auto-dispatch ${unassignedLoads.length} loads using AI optimization:

LOADS:
${JSON.stringify(unassignedLoads.map(l => ({
  id: l.id,
  origin: `${l.pickup_location?.city}, ${l.pickup_location?.state}`,
  dest: `${l.dropoff_location?.city}, ${l.dropoff_location?.state}`,
  equipment: l.equipment_type,
  pickup: l.pickup_date,
  weight: l.weight
})), null, 2)}

AVAILABLE DRIVERS:
${JSON.stringify(drivers?.filter(d => d.status === 'available').slice(0, 10).map(d => ({
  id: d.id,
  name: `${d.first_name} ${d.last_name}`,
  location: d.current_location?.city,
  hos: d.hos_remaining,
  score: d.performance_score
})), null, 2)}

AVAILABLE CARRIERS:
${JSON.stringify(carriers?.filter(c => c.status === 'active' && c.performance_tier !== 'Watch').slice(0, 10).map(c => ({
  id: c.id,
  name: c.company_name,
  tier: c.performance_tier,
  on_time: c.on_time_percentage
})), null, 2)}

For each load, recommend best assignment (driver or carrier) considering:
- Distance from current location
- HOS availability
- Performance score
- Equipment match
- Cost efficiency
- On-time reliability`,
          response_json_schema: {
            type: "object",
            properties: {
              assignments: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    load_id: { type: "string" },
                    assigned_to: { type: "string" },
                    assigned_type: { type: "string", enum: ["driver", "carrier"] },
                    confidence: { type: "number" },
                    reasoning: { type: "string" }
                  }
                }
              }
            }
          }
        });

        setAutoAssignments(result.assignments || []);
      } catch (error) {
        console.error('Auto-dispatch error:', error);
      } finally {
        setProcessing(false);
      }
    };

    runAutoDispatch();
    const interval = setInterval(runAutoDispatch, 5 * 60 * 1000); // Every 5 min
    return () => clearInterval(interval);
  }, [loads, drivers, carriers, enabled]);

  const handleApproveAssignment = async (assignment) => {
    await updateLoadMutation.mutateAsync({
      id: assignment.load_id,
      data: {
        [assignment.assigned_type === 'driver' ? 'driver_id' : 'carrier_id']: assignment.assigned_to,
        status: 'assigned',
        auto_dispatched: true
      }
    });
    setAutoAssignments(prev => prev.filter(a => a.load_id !== assignment.load_id));
  };

  if (!enabled || autoAssignments.length === 0) return null;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="w-5 h-5 text-purple-600" />
          AI Auto-Dispatch
          {processing && <Badge className="ml-auto bg-purple-600 animate-pulse">Processing...</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {autoAssignments.map((assignment) => {
          const load = loads?.find(l => l.id === assignment.load_id);
          if (!load) return null;

          return (
            <div key={assignment.load_id} className="p-3 bg-white rounded-lg border border-purple-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {load.pickup_location?.city} → {load.dropoff_location?.city}
                  </p>
                  <p className="text-xs text-slate-600">{assignment.reasoning}</p>
                </div>
                <Badge className={`${
                  assignment.confidence >= 90 ? 'bg-emerald-600' : 'bg-amber-600'
                }`}>
                  {assignment.confidence}% match
                </Badge>
              </div>
              <Button
                size="sm"
                onClick={() => handleApproveAssignment(assignment)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Assign
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}