import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrgQueryKey } from "@/components/hooks/useOrgQueryKey";

/**
 * Automated Load Matching Engine
 * Continuously matches unassigned loads with best carriers in background
 */
export default function AutomatedLoadMatching({ loads, carriers, complianceItems, enabled = true, autoAssign = false }) {
  const [lastRun, setLastRun] = useState(null);
  const queryClient = useQueryClient();
  const loadsKey = useOrgQueryKey('loads');

  const updateLoadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Load.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loadsKey });
    },
  });

  useEffect(() => {
    if (!enabled || !loads || !carriers) return;

    const runMatching = async () => {
      const unassignedLoads = loads.filter(l => 
        !l.carrier_id && ['available', 'tendered'].includes(l.status)
      ).slice(0, 5);

      const activeCarriers = carriers.filter(c => 
        c.status === 'active' && 
        (c.compliance_score || 0) >= 70 &&
        c.performance_tier !== 'Watch'
      );

      if (unassignedLoads.length === 0 || activeCarriers.length === 0) return;

      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Match these ${unassignedLoads.length} loads with best carriers:

LOADS:
${JSON.stringify(unassignedLoads.map(l => ({
  id: l.id,
  load_number: l.load_number,
  origin: `${l.pickup_location?.city}, ${l.pickup_location?.state}`,
  destination: `${l.dropoff_location?.city}, ${l.dropoff_location?.state}`,
  equipment: l.equipment_type,
  pickup_date: l.pickup_date
})), null, 2)}

CARRIERS:
${JSON.stringify(activeCarriers.slice(0, 20).map(c => ({
  id: c.id,
  name: c.company_name,
  equipment: c.equipment_types,
  on_time: c.on_time_percentage,
  tier: c.performance_tier,
  compliance: c.compliance_score
})), null, 2)}

Return best carrier match for each load with confidence score (0-100).`,
          response_json_schema: {
            type: "object",
            properties: {
              matches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    load_id: { type: "string" },
                    carrier_id: { type: "string" },
                    confidence: { type: "number" },
                    suggested_rate: { type: "number" }
                  }
                }
              }
            }
          }
        });

        // Auto-assign high-confidence matches if enabled
        if (autoAssign && result.matches) {
          for (const match of result.matches.filter(m => m.confidence >= 85)) {
            await updateLoadMutation.mutateAsync({
              id: match.load_id,
              data: {
                carrier_id: match.carrier_id,
                carrier_pay: match.suggested_rate,
                status: 'tendered',
                auto_matched: true
              }
            });
          }
        }

        setLastRun(new Date());
      } catch (error) {
        console.error('Auto-matching error:', error);
      }
    };

    // Run immediately
    runMatching();

    // Run every 10 minutes
    const interval = setInterval(runMatching, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loads, carriers, enabled, autoAssign]);

  return null; // Background service
}