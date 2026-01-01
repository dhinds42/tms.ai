import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, TrendingUp, TrendingDown, CheckCircle, XCircle } from "lucide-react";

export default function ProfitabilityHistory({ lanePreferenceId }) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['laneRateHistory', lanePreferenceId],
    queryFn: async () => {
      const rates = await base44.entities.LaneRatePreference.filter({
        lane_preference_id: lanePreferenceId
      });
      return rates.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    initialData: []
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-slate-600">Loading history...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          Rate History
          <Badge variant="outline" className="ml-auto">{history.length} versions</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {history.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-4">No rate history yet</p>
        ) : (
          history.map((rate, idx) => {
            const isLatest = idx === 0;
            const prevRate = history[idx + 1];
            const rateChanged = prevRate && (
              rate.target_rpm_cents !== prevRate.target_rpm_cents ||
              rate.target_flat_cents !== prevRate.target_flat_cents
            );
            
            return (
              <div 
                key={rate.id} 
                className={`p-4 border rounded-lg ${isLatest ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={isLatest ? 'bg-indigo-600' : 'bg-slate-500'}>
                        v{rate.version || idx + 1}
                      </Badge>
                      {isLatest && <Badge className="bg-emerald-600">Current</Badge>}
                      {rate.approval_status === 'approved' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      {new Date(rate.created_date).toLocaleDateString()} at {new Date(rate.created_date).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {rate.rate_type === 'per_mile' 
                        ? `$${(rate.target_rpm_cents / 100).toFixed(2)}/mi`
                        : `$${(rate.target_flat_cents / 100).toFixed(0)} flat`
                      }
                    </p>
                    {rateChanged && (
                      <div className="flex items-center gap-1 text-xs">
                        {rate.target_rpm_cents > prevRate.target_rpm_cents ? (
                          <>
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span className="text-green-600">+${((rate.target_rpm_cents - prevRate.target_rpm_cents) / 100).toFixed(2)}</span>
                          </>
                        ) : rate.target_rpm_cents < prevRate.target_rpm_cents ? (
                          <>
                            <TrendingDown className="w-3 h-3 text-red-600" />
                            <span className="text-red-600">-${((prevRate.target_rpm_cents - rate.target_rpm_cents) / 100).toFixed(2)}</span>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                  <div className="p-2 bg-white rounded">
                    <p className="text-slate-600">Driver</p>
                    <Badge className={rate.driver_profitability_ok ? 'bg-green-500' : 'bg-red-500'} size="sm">
                      {rate.driver_profitability_ok ? '✓' : '✗'}
                    </Badge>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-slate-600">Carrier</p>
                    <Badge className={rate.carrier_profitability_ok ? 'bg-green-500' : 'bg-red-500'} size="sm">
                      {rate.carrier_profitability_ok ? '✓' : '✗'}
                    </Badge>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-slate-600">Owner-Op</p>
                    <Badge className={rate.ownerop_profitability_ok ? 'bg-green-500' : 'bg-red-500'} size="sm">
                      {rate.ownerop_profitability_ok ? '✓' : '✗'}
                    </Badge>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-slate-600">Broker</p>
                    <Badge className={rate.broker_profitability_ok ? 'bg-green-500' : 'bg-red-500'} size="sm">
                      {rate.broker_profitability_ok ? '✓' : '✗'}
                    </Badge>
                  </div>
                </div>
                
                {rate.flagged_reason && (
                  <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-900">
                    <strong>Note:</strong> {rate.flagged_reason}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}