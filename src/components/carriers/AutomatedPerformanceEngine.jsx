import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrgQueryKey } from "@/components/hooks/useOrgQueryKey";

/**
 * Automated Performance Engine
 * Runs in background to calculate carrier scores in real-time
 */
export default function AutomatedPerformanceEngine({ carriers, loads, complianceItems, enabled = true }) {
  const queryClient = useQueryClient();
  const carriersKey = useOrgQueryKey('carriers');

  const updateCarrierMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Carrier.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carriersKey });
    },
  });

  useEffect(() => {
    if (!enabled || !carriers || !loads) return;

    const calculateScores = async () => {
      for (const carrier of carriers) {
        const score = calculateCarrierPerformance(carrier, loads, complianceItems);
        
        // Update carrier if score changed
        if (Math.abs((carrier.compliance_score || 0) - score.overall_score) > 5) {
          await updateCarrierMutation.mutateAsync({
            id: carrier.id,
            data: {
              compliance_score: score.overall_score,
              on_time_percentage: score.on_time_percentage,
              rating: score.rating,
              performance_tier: score.tier,
              last_score_update: new Date().toISOString()
            }
          });
        }
      }
    };

    // Run immediately
    calculateScores();

    // Run every 5 minutes
    const interval = setInterval(calculateScores, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [carriers, loads, complianceItems, enabled]);

  return null; // This is a background service
}

/**
 * Calculate comprehensive carrier performance score
 */
export function calculateCarrierPerformance(carrier, allLoads, complianceItems) {
  const carrierLoads = allLoads.filter(l => l.carrier_id === carrier.id || l.current_carrier_party_id === carrier.id);
  const carrierCompliance = complianceItems.filter(c => c.entity_id === carrier.id && c.entity_type === 'carrier');
  
  // 1. On-Time Performance (30 points)
  const deliveredLoads = carrierLoads.filter(l => l.status === 'delivered');
  const onTimeLoads = deliveredLoads.filter(l => {
    if (!l.actual_delivery_datetime || !l.planned_delivery_datetime) return true;
    return new Date(l.actual_delivery_datetime) <= new Date(l.planned_delivery_datetime);
  });
  const onTimePercentage = deliveredLoads.length > 0 
    ? (onTimeLoads.length / deliveredLoads.length) * 100 
    : 100;
  const onTimeScore = (onTimePercentage / 100) * 30;

  // 2. Completion Rate (20 points)
  const totalAssignedLoads = carrierLoads.filter(l => 
    ['assigned', 'dispatched', 'picked_up', 'in_transit', 'delivered'].includes(l.status)
  ).length;
  const completedLoads = deliveredLoads.length;
  const completionRate = totalAssignedLoads > 0 ? (completedLoads / totalAssignedLoads) * 100 : 100;
  const completionScore = (completionRate / 100) * 20;

  // 3. Compliance Score (25 points)
  const currentCompliance = carrierCompliance.filter(c => c.status === 'current').length;
  const totalCompliance = carrierCompliance.length;
  const complianceRate = totalCompliance > 0 ? (currentCompliance / totalCompliance) * 100 : 100;
  const complianceScore = (complianceRate / 100) * 25;

  // 4. Claims & Issues (15 points) - Lower is better
  const loadsWithClaims = carrierLoads.filter(l => l.has_open_claim_flag).length;
  const claimsRate = carrierLoads.length > 0 ? (loadsWithClaims / carrierLoads.length) : 0;
  const claimsScore = Math.max(0, 15 - (claimsRate * 100)); // Penalty for claims

  // 5. Customer Rating (10 points)
  const avgRating = carrier.rating || 0;
  const ratingScore = (avgRating / 5) * 10;

  // Calculate overall score
  const overall_score = Math.round(onTimeScore + completionScore + complianceScore + claimsScore + ratingScore);

  // Determine tier
  let tier = 'Standard';
  if (overall_score >= 90) tier = 'Preferred';
  else if (overall_score < 70) tier = 'Watch';

  // Convert to 5-star rating
  const rating = Math.min(5, Math.max(1, Math.round((overall_score / 100) * 5)));

  return {
    overall_score,
    on_time_percentage: Math.round(onTimePercentage),
    completion_rate: Math.round(completionRate),
    compliance_rate: Math.round(complianceRate),
    claims_rate: Math.round(claimsRate * 100),
    rating,
    tier,
    total_loads: carrierLoads.length,
    completed_loads: completedLoads,
    breakdown: {
      on_time_score: Math.round(onTimeScore),
      completion_score: Math.round(completionScore),
      compliance_score: Math.round(complianceScore),
      claims_score: Math.round(claimsScore),
      rating_score: Math.round(ratingScore)
    }
  };
}