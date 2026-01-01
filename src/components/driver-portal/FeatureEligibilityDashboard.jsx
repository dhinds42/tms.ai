import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, Unlock, Clock, Award, TrendingUp } from "lucide-react";

export default function FeatureEligibilityDashboard({ driverId }) {
  const { data: eligibility, isLoading } = useQuery({
    queryKey: ['driverFeatureEligibility', driverId],
    queryFn: () => base44.entities.DriverFeatureEligibility.filter({ driver_id: driverId }),
    initialData: []
  });

  const features = {
    instant_pay: { icon: TrendingUp, label: 'Instant Pay', description: 'Get paid immediately after delivery' },
    load_selection_priority: { icon: Award, label: 'Priority Load Selection', description: 'First pick on new loads' },
    accessorial_auto_approval: { icon: Unlock, label: 'Auto-Approved Accessorials', description: 'Accessorials up to $200 auto-approved' },
    advance_request: { icon: TrendingUp, label: 'Pay Advances', description: 'Request advances on loads' },
    detention_self_edit: { icon: Unlock, label: 'Self-Edit Detention', description: 'Edit detention amounts without approval' },
    direct_messaging: { icon: Award, label: 'Direct Messaging', description: 'Message dispatch directly' },
    premium_loads: { icon: Award, label: 'Premium Loads', description: 'Access to high-value loads' },
    flexible_home_time: { icon: Clock, label: 'Flexible Home Time', description: 'Customize home time schedule' }
  };

  const unlockedFeatures = eligibility.filter(e => e.eligible).length;
  const totalFeatures = Object.keys(features).length;
  const unlockProgress = (unlockedFeatures / totalFeatures) * 100;

  const getTierBadge = (tier) => {
    const colors = {
      bronze: 'bg-orange-600',
      silver: 'bg-slate-400',
      gold: 'bg-amber-500',
      platinum: 'bg-purple-600'
    };
    return <Badge className={`${colors[tier] || 'bg-slate-500'} text-white capitalize`}>{tier}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading features...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Features Unlocked</h3>
            <span className="text-2xl font-bold text-indigo-600">{unlockedFeatures}/{totalFeatures}</span>
          </div>
          <Progress value={unlockProgress} className="h-2" />
          <p className="text-xs text-slate-600 mt-2">Keep improving to unlock more features</p>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(features).map(([key, feature]) => {
          const record = eligibility.find(e => e.feature_key === key);
          const isEligible = record?.eligible || false;
          const FeatureIcon = feature.icon;

          return (
            <Card key={key} className={`${isEligible ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FeatureIcon className={`w-5 h-5 ${isEligible ? 'text-green-600' : 'text-slate-400'}`} />
                    <h3 className="font-semibold text-slate-900">{feature.label}</h3>
                  </div>
                  {isEligible ? (
                    <Unlock className="w-5 h-5 text-green-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <p className="text-xs text-slate-600 mb-3">{feature.description}</p>

                {record ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      {isEligible ? (
                        <Badge className="bg-green-500">Unlocked</Badge>
                      ) : (
                        <Badge className="bg-slate-400">Locked</Badge>
                      )}
                      {record.tier && getTierBadge(record.tier)}
                      {record.carrier_override && <Badge variant="outline" className="bg-purple-50 text-purple-700">Override</Badge>}
                    </div>

                    <p className="text-xs text-slate-700">{record.reason}</p>

                    {record.cooldown_until && new Date(record.cooldown_until) > new Date() && (
                      <div className="mt-2 bg-amber-100 border border-amber-300 rounded p-2 text-xs text-amber-900">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Cooldown until {new Date(record.cooldown_until).toLocaleDateString()}
                      </div>
                    )}

                    {record.metrics_snapshot && (
                      <div className="mt-2 text-xs text-slate-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Completed Loads:</span>
                          <span className="font-semibold">{record.metrics_snapshot.completed_loads}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>On-Time %:</span>
                          <span className="font-semibold">{record.metrics_snapshot.on_time_pct}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Doc On-Time %:</span>
                          <span className="font-semibold">{record.metrics_snapshot.doc_on_time_pct}%</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-500">Not evaluated yet</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}