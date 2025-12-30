import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Automated Driver Performance Scoring Engine
 * Runs in background to calculate driver scores in real-time
 */
export default function AutomatedDriverScoring({ drivers, loads, complianceItems, enabled = true }) {
  const queryClient = useQueryClient();

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Driver.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  useEffect(() => {
    if (!enabled || !drivers || !loads) return;

    const calculateScores = async () => {
      for (const driver of drivers) {
        const score = calculateDriverPerformance(driver, loads, complianceItems);
        
        // Update driver if score changed significantly
        if (Math.abs((driver.performance_score || 0) - score.overall_score) > 5) {
          await updateDriverMutation.mutateAsync({
            id: driver.id,
            data: {
              performance_score: score.overall_score,
              on_time_percentage: score.on_time_percentage,
              rating: score.rating,
              safety_score: score.safety_score,
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
  }, [drivers, loads, complianceItems, enabled]);

  return null; // Background service
}

/**
 * Calculate driver performance score (0-100)
 */
export function calculateDriverPerformance(driver, allLoads, complianceItems) {
  const driverLoads = allLoads.filter(l => l.driver_id === driver.id);
  const driverCompliance = complianceItems?.filter(c => 
    c.entity_id === driver.id && c.entity_type === 'driver'
  ) || [];
  
  // 1. On-Time Performance (35 points)
  const deliveredLoads = driverLoads.filter(l => l.status === 'delivered');
  const onTimeLoads = deliveredLoads.filter(l => {
    if (!l.actual_delivery_datetime || !l.planned_delivery_datetime) return true;
    return new Date(l.actual_delivery_datetime) <= new Date(l.planned_delivery_datetime);
  });
  const onTimePercentage = deliveredLoads.length > 0 
    ? (onTimeLoads.length / deliveredLoads.length) * 100 
    : 100;
  const onTimeScore = (onTimePercentage / 100) * 35;

  // 2. Safety & Compliance (30 points)
  const currentCompliance = driverCompliance.filter(c => c.status === 'current').length;
  const totalCompliance = driverCompliance.length || 3; // Assume 3 required docs
  const complianceRate = (currentCompliance / totalCompliance) * 100;
  
  // Check for critical expirations
  const hasExpiredDocs = driverCompliance.some(c => c.status === 'expired');
  const safetyScore = hasExpiredDocs 
    ? Math.min((complianceRate / 100) * 30, 20) // Cap at 20 if expired docs
    : (complianceRate / 100) * 30;

  // 3. Load Completion Rate (20 points)
  const assignedLoads = driverLoads.filter(l => 
    ['assigned', 'dispatched', 'picked_up', 'in_transit', 'delivered'].includes(l.status)
  ).length;
  const completedLoads = deliveredLoads.length;
  const completionRate = assignedLoads > 0 ? (completedLoads / assignedLoads) * 100 : 100;
  const completionScore = (completionRate / 100) * 20;

  // 4. Consistency & Reliability (15 points)
  // Check for load cancellations, TONUs, service failures
  const cancelledLoads = driverLoads.filter(l => l.status === 'cancelled' || l.tonu).length;
  const reliabilityRate = driverLoads.length > 0 
    ? Math.max(0, 100 - ((cancelledLoads / driverLoads.length) * 100))
    : 100;
  const reliabilityScore = (reliabilityRate / 100) * 15;

  // Calculate overall score
  const overall_score = Math.round(onTimeScore + safetyScore + completionScore + reliabilityScore);

  // Determine tier
  let tier = 'Standard';
  if (overall_score >= 90) tier = 'Elite';
  else if (overall_score >= 80) tier = 'Professional';
  else if (overall_score < 65) tier = 'Training';

  // Convert to 5-star rating
  const rating = Math.min(5, Math.max(1, Math.round((overall_score / 100) * 5)));

  return {
    overall_score,
    on_time_percentage: Math.round(onTimePercentage),
    completion_rate: Math.round(completionRate),
    compliance_rate: Math.round(complianceRate),
    reliability_rate: Math.round(reliabilityRate),
    safety_score: Math.round(safetyScore),
    rating,
    tier,
    total_loads: driverLoads.length,
    completed_loads: completedLoads,
    breakdown: {
      on_time_score: Math.round(onTimeScore),
      safety_compliance_score: Math.round(safetyScore),
      completion_score: Math.round(completionScore),
      reliability_score: Math.round(reliabilityScore)
    }
  };
}