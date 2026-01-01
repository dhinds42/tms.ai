import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Sparkles, Loader2, Target, Calendar } from "lucide-react";

export default function PredictiveEligibilityForecaster({ driverId }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const generateForecast = async () => {
    setLoading(true);
    
    try {
      const completedLoads = loads.filter(l => l.status === 'delivered');
      const recentLoads = completedLoads.slice(-10);
      
      // Build driver performance snapshot
      const performanceData = {
        driver_id: driverId,
        total_loads: completedLoads.length,
        current_on_time_pct: driver?.on_time_percentage || 0,
        current_performance_score: driver?.performance_score || 0,
        current_tier: driver?.performance_tier || 'Training',
        recent_load_trend: recentLoads.map(l => ({
          on_time: l.actual_delivery_datetime && l.planned_delivery_datetime 
            ? new Date(l.actual_delivery_datetime) <= new Date(l.planned_delivery_datetime)
            : null
        })),
        current_eligibility: eligibility.filter(e => e.eligible).map(e => e.feature_key),
        locked_features: eligibility.filter(e => !e.eligible).map(e => ({
          feature: e.feature_key,
          reason: e.reason
        }))
      };

      // Call AI to predict trajectory
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a logistics performance analyst. Analyze this driver's performance trajectory and predict eligibility for locked features.

Driver Performance Data:
${JSON.stringify(performanceData, null, 2)}

Feature Requirements:
- instant_pay: 10 loads, 90% on-time, 85% doc-on-time
- accessorial_auto_approval: 20 loads, 95% on-time, 95% doc-on-time, <5% dispute rate
- detention_self_edit: 30 loads, 95% on-time, 95% doc-on-time, <5% dispute rate
- counteroffers: 5 loads, 90% on-time, 90% doc-on-time, <10% dispute rate
- what_if_pricing: 5 loads, 90% on-time, 90% doc-on-time
- facility_intel: 5 loads, 90% on-time

Based on their current trajectory and recent performance trend, predict:
1. Which locked features they'll likely unlock in next 30/60/90 days
2. Probability of unlocking (0-100%)
3. Recommended actions to accelerate eligibility
4. Risk factors that could delay eligibility`,
        response_json_schema: {
          type: "object",
          properties: {
            forecasts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  feature_key: { type: "string" },
                  currently_locked: { type: "boolean" },
                  days_to_eligibility: { type: "number" },
                  probability_pct: { type: "number" },
                  trajectory: { type: "string", enum: ["improving", "stable", "declining"] },
                  recommended_actions: {
                    type: "array",
                    items: { type: "string" }
                  },
                  risk_factors: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            overall_trajectory: { type: "string" },
            tier_forecast_90d: { type: "string" },
            coaching_priority: { type: "string", enum: ["low", "medium", "high"] }
          }
        }
      });

      setForecast(aiResponse);
    } catch (error) {
      console.error('Forecast error:', error);
      setForecast({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Predictive Eligibility Forecast
        </CardTitle>
        <p className="text-sm text-slate-600">AI-powered prediction of feature unlock timeline</p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <Button
          onClick={generateForecast}
          disabled={loading || !driver}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing trajectory...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate 90-Day Forecast
            </>
          )}
        </Button>

        {forecast && !forecast.error && (
          <div className="space-y-4">
            {/* Overall Trajectory */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-purple-900 mb-2">Overall Trajectory</p>
                <p className="text-sm text-purple-800">{forecast.overall_trajectory}</p>
                {forecast.tier_forecast_90d && (
                  <div className="mt-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-700">
                      Predicted tier in 90 days: <strong>{forecast.tier_forecast_90d}</strong>
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feature Forecasts */}
            <div className="space-y-3">
              {forecast.forecasts?.map((f, idx) => (
                <Card key={idx} className={`border ${f.currently_locked ? 'border-slate-200' : 'border-green-200 bg-green-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-slate-900">{f.feature_key.replace(/_/g, ' ')}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={f.currently_locked ? 'bg-red-500' : 'bg-green-500'}>
                            {f.currently_locked ? 'Locked' : 'Unlocked'}
                          </Badge>
                          <Badge variant="outline" className={
                            f.trajectory === 'improving' ? 'border-green-500 text-green-700' :
                            f.trajectory === 'declining' ? 'border-red-500 text-red-700' :
                            'border-slate-400'
                          }>
                            {f.trajectory}
                          </Badge>
                        </div>
                      </div>
                      {f.currently_locked && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">{f.days_to_eligibility}</p>
                          <p className="text-xs text-slate-500">days</p>
                        </div>
                      )}
                    </div>

                    {f.currently_locked && (
                      <>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600">Unlock Probability</span>
                            <span className="font-semibold">{f.probability_pct}%</span>
                          </div>
                          <Progress value={f.probability_pct} className="h-2" />
                        </div>

                        {f.recommended_actions?.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                            <p className="text-xs font-semibold text-blue-900 mb-1">Recommended Actions:</p>
                            <ul className="text-xs text-blue-800 space-y-1">
                              {f.recommended_actions.map((action, i) => (
                                <li key={i}>• {action}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {f.risk_factors?.length > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded p-3">
                            <p className="text-xs font-semibold text-amber-900 mb-1">Risk Factors:</p>
                            <ul className="text-xs text-amber-800 space-y-1">
                              {f.risk_factors.map((risk, i) => (
                                <li key={i}>⚠️ {risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {forecast.coaching_priority && (
              <Card className={`border-2 ${
                forecast.coaching_priority === 'high' ? 'border-red-300 bg-red-50' :
                forecast.coaching_priority === 'medium' ? 'border-amber-300 bg-amber-50' :
                'border-green-300 bg-green-50'
              }`}>
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Coaching Priority: <span className="capitalize">{forecast.coaching_priority}</span>
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {forecast?.error && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-4">
              <p className="text-sm text-red-800">Error: {forecast.error}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}