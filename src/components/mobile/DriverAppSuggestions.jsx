import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, Award, Clock, DollarSign, Zap } from "lucide-react";

export default function DriverAppSuggestions({ driverId }) {
  const [suggestions, setSuggestions] = useState([]);

  const { data: driver } = useQuery({
    queryKey: ['driver', driverId],
    queryFn: async () => {
      const drivers = await base44.entities.Driver.filter({ id: driverId });
      return drivers[0];
    }
  });

  const { data: loads } = useQuery({
    queryKey: ['driverLoads', driverId],
    queryFn: () => base44.entities.Load.filter({ driver_id: driverId }),
    initialData: []
  });

  const { data: eligibility } = useQuery({
    queryKey: ['driverEligibility', driverId],
    queryFn: () => base44.entities.DriverFeatureEligibility.filter({ driver_id: driverId }),
    initialData: []
  });

  React.useEffect(() => {
    if (!driver || !loads || !eligibility) return;

    const newSuggestions = [];
    const recentLoads = loads.filter(l => l.status === 'delivered').slice(-10);
    const lockedFeatures = eligibility.filter(e => !e.eligible);

    // On-time improvement suggestion
    if ((driver.on_time_percentage || 0) < 90) {
      newSuggestions.push({
        type: 'performance',
        icon: Clock,
        color: 'amber',
        title: 'Improve On-Time Rate',
        description: `You're at ${driver.on_time_percentage}%. Reach 90% to unlock premium features.`,
        action: 'View Tips',
        priority: 'high'
      });
    }

    // Feature unlock suggestion
    if (lockedFeatures.length > 0 && (driver.performance_score || 0) > 70) {
      const nextFeature = lockedFeatures[0];
      newSuggestions.push({
        type: 'unlock',
        icon: Award,
        color: 'purple',
        title: `Unlock ${nextFeature.feature_key.replace(/_/g, ' ')}`,
        description: nextFeature.reason || 'Complete a few more loads to unlock',
        action: 'View Requirements',
        priority: 'medium'
      });
    }

    // Instant pay suggestion
    const instantPayEligible = eligibility.find(e => 
      e.feature_key === 'instant_pay' && e.eligible
    );
    if (instantPayEligible && recentLoads.length > 0) {
      newSuggestions.push({
        type: 'earnings',
        icon: DollarSign,
        color: 'green',
        title: 'Get Paid Instantly',
        description: 'Cash out your earnings today with Instant Pay',
        action: 'Enable Now',
        priority: 'high'
      });
    }

    // Detention tracking suggestion
    if (recentLoads.some(l => l.status === 'at_pickup' || l.status === 'at_delivery')) {
      newSuggestions.push({
        type: 'earnings',
        icon: Clock,
        color: 'blue',
        title: 'Track Detention Time',
        description: 'Start detention timer when you arrive to maximize earnings',
        action: 'Start Timer',
        priority: 'medium'
      });
    }

    // Performance milestone
    if ((driver.total_loads || 0) % 10 === 9) {
      newSuggestions.push({
        type: 'milestone',
        icon: TrendingUp,
        color: 'indigo',
        title: 'Milestone Alert',
        description: `You're 1 load away from ${(driver.total_loads || 0) + 1} total loads!`,
        action: 'View Stats',
        priority: 'low'
      });
    }

    setSuggestions(newSuggestions);
  }, [driver, loads, eligibility]);

  if (suggestions.length === 0) return null;

  const colorMap = {
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', button: 'bg-amber-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600', button: 'bg-purple-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', button: 'bg-green-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', button: 'bg-blue-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600', button: 'bg-indigo-600' }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Suggestions for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, idx) => {
          const colors = colorMap[suggestion.color];
          const Icon = suggestion.icon;
          
          return (
            <Card key={idx} className={`${colors.bg} ${colors.border} border-2`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 bg-white rounded-lg ${colors.border} border`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-slate-900">{suggestion.title}</p>
                      {suggestion.priority === 'high' && (
                        <Badge className="bg-red-500 text-xs">Priority</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{suggestion.description}</p>
                    <Button size="sm" className={colors.button}>
                      <Zap className="w-3 h-3 mr-1" />
                      {suggestion.action}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}