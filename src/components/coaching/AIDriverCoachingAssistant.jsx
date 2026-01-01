import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Target, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

export default function AIDriverCoachingAssistant({ driverId }) {
  const [coaching, setCoaching] = useState(null);
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

  const { data: escalations } = useQuery({
    queryKey: ['driverEscalations', driverId],
    queryFn: () => base44.entities.DriverEscalation.filter({ driver_id: driverId }),
    initialData: []
  });

  const generateCoaching = async () => {
    setLoading(true);
    
    try {
      const completedLoads = loads.filter(l => l.status === 'delivered');
      const recentLoads = completedLoads.slice(-20);
      
      const onTimeLoads = recentLoads.filter(l => 
        l.actual_delivery_datetime && l.planned_delivery_datetime &&
        new Date(l.actual_delivery_datetime) <= new Date(l.planned_delivery_datetime)
      );
      
      const lockedFeatures = eligibility.filter(e => !e.eligible);
      const recentEscalations = escalations.filter(e => 
        new Date(e.created_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert logistics coach. Analyze this driver's performance and provide personalized coaching.

Driver: ${driver.first_name} ${driver.last_name}
Current Stats:
- Total Loads: ${completedLoads.length}
- On-Time Rate: ${driver.on_time_percentage || 0}%
- Recent On-Time (last 20): ${recentLoads.length > 0 ? Math.round((onTimeLoads.length / recentLoads.length) * 100) : 0}%
- Performance Score: ${driver.performance_score || 0}/100
- Tier: ${driver.performance_tier || 'Training'}

Recent Issues (30d):
${recentEscalations.map(e => `- ${e.escalation_type}: ${e.title}`).join('\n') || 'None'}

Locked Features (not yet eligible):
${lockedFeatures.map(f => `- ${f.feature_key}: ${f.reason}`).join('\n') || 'All features unlocked'}

Provide actionable coaching in these areas:
1. Performance strengths to maintain
2. Specific improvement areas with measurable goals
3. Next feature unlock strategy
4. Safety/compliance reminders
5. Motivation/recognition`,
        response_json_schema: {
          type: "object",
          properties: {
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            improvement_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  current_metric: { type: "string" },
                  target_metric: { type: "string" },
                  action_plan: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] }
                }
              }
            },
            next_feature_unlock: {
              type: "object",
              properties: {
                feature: { type: "string" },
                days_away: { type: "number" },
                action_needed: { type: "string" }
              }
            },
            safety_reminders: {
              type: "array",
              items: { type: "string" }
            },
            recognition: { type: "string" }
          }
        }
      });

      setCoaching(aiResponse);
    } catch (error) {
      setCoaching({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!driver) return null;

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          AI Coaching Assistant
        </CardTitle>
        <p className="text-sm text-slate-600">Personalized performance coaching and development plan</p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <Button
          onClick={generateCoaching}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing performance...
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 mr-2" />
              Generate Coaching Plan
            </>
          )}
        </Button>

        {coaching && !coaching.error && (
          <div className="space-y-4">
            
            {/* Recognition */}
            {coaching.recognition && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-900 mb-1">Recognition</p>
                      <p className="text-sm text-green-800">{coaching.recognition}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Strengths */}
            {coaching.strengths?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {coaching.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-900">{strength}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Improvement Areas */}
            {coaching.improvement_areas?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    Development Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {coaching.improvement_areas.map((area, idx) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-slate-900">{area.area}</p>
                        <Badge className={
                          area.priority === 'high' ? 'bg-red-500' :
                          area.priority === 'medium' ? 'bg-amber-500' :
                          'bg-blue-500'
                        }>
                          {area.priority}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                        <div className="p-2 bg-slate-50 rounded">
                          <p className="text-slate-500">Current</p>
                          <p className="font-semibold text-slate-900">{area.current_metric}</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="text-slate-500">Target</p>
                          <p className="font-semibold text-blue-900">{area.target_metric}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-xs text-blue-900">{area.action_plan}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Next Feature Unlock */}
            {coaching.next_feature_unlock && (
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-purple-900 mb-2">Next Unlock Goal</p>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-purple-800 capitalize">
                      {coaching.next_feature_unlock.feature?.replace(/_/g, ' ')}
                    </p>
                    <Badge className="bg-purple-600">{coaching.next_feature_unlock.days_away} days</Badge>
                  </div>
                  <p className="text-xs text-purple-700">{coaching.next_feature_unlock.action_needed}</p>
                </CardContent>
              </Card>
            )}

            {/* Safety Reminders */}
            {coaching.safety_reminders?.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Safety Reminders
                  </p>
                  <ul className="space-y-1">
                    {coaching.safety_reminders.map((reminder, idx) => (
                      <li key={idx} className="text-xs text-amber-800">• {reminder}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {coaching?.error && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-4">
              <p className="text-sm text-red-800">Error: {coaching.error}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}