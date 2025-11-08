import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, AlertTriangle, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { format, differenceInHours } from "date-fns";

export default function ETAPredictionCard({ load, drivers }) {
  const [etaPrediction, setEtaPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const driver = drivers?.find(d => d.id === load.driver_id);

  const predictETA = async () => {
    setIsAnalyzing(true);
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Rosie, an AI bot that predicts accurate ETAs for freight loads.

LOAD DETAILS:
- Current Status: ${load.status}
- Origin: ${load.pickup_location?.city}, ${load.pickup_location?.state}
- Destination: ${load.dropoff_location?.city}, ${load.dropoff_location?.state}
- Distance: ${load.distance_miles || 'Unknown'} miles
- Scheduled Delivery: ${load.delivery_date || 'Not set'}
- Current ETA: ${load.eta || 'Not set'}

DRIVER INFO:
- HOS Remaining: ${driver?.hos_remaining || 'Unknown'} hours
- Current Location: ${driver?.current_location?.city || 'Unknown'}, ${driver?.current_location?.state || ''}

Provide an AI-powered ETA prediction considering:
- Current traffic conditions
- Weather patterns
- Driver HOS limitations
- Historical performance on this lane
- Typical delays and rest stops
- Time of day and day of week factors

Return:
1. Predicted ETA (date-time string)
2. Confidence Level (LOW/MEDIUM/HIGH)
3. Delay Risk (NONE/LOW/MEDIUM/HIGH)
4. Factors Affecting ETA (list 3-5 specific factors)
5. Recommended Actions (if any delays predicted)
6. Traffic Impact Score (0-100)
7. Weather Impact Score (0-100)
8. On-Time Probability (%)`,
        response_json_schema: {
          type: "object",
          properties: {
            predicted_eta: { type: "string" },
            confidence_level: { type: "string" },
            delay_risk: { type: "string" },
            factors_affecting_eta: {
              type: "array",
              items: { type: "string" }
            },
            recommended_actions: {
              type: "array",
              items: { type: "string" }
            },
            traffic_impact_score: { type: "number" },
            weather_impact_score: { type: "number" },
            on_time_probability: { type: "number" }
          }
        }
      });

      setEtaPrediction(result);
    } catch (error) {
      console.error('ETA prediction error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (load.status === 'in_transit') {
      predictETA();
    }
  }, [load.id]);

  const delayRiskColors = {
    NONE: "bg-emerald-100 text-emerald-700 border-emerald-300",
    LOW: "bg-blue-100 text-blue-700 border-blue-300",
    MEDIUM: "bg-amber-100 text-amber-700 border-amber-300",
    HIGH: "bg-red-100 text-red-700 border-red-300"
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white">
      <CardContent className="p-6">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900">
              {load.load_number || `#${load.id.slice(0, 8)}`}
            </h3>
            <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              {load.pickup_location?.city} → {load.dropoff_location?.city}
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 capitalize">
            {load.status.replace(/_/g, ' ')}
          </Badge>
        </div>

        {isAnalyzing && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-cyan-600 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-slate-600">Analyzing route and conditions...</p>
          </div>
        )}

        {etaPrediction && !isAnalyzing && (
          <div className="space-y-4">
            
            {/* ETA Display */}
            <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-cyan-900 uppercase tracking-wider">
                  Predicted ETA
                </span>
                <Badge variant="outline" className={delayRiskColors[etaPrediction.delay_risk]}>
                  {etaPrediction.delay_risk} Risk
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-600" />
                <span className="text-xl font-bold text-cyan-900">
                  {format(new Date(etaPrediction.predicted_eta), "MMM d, h:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <p className="text-xs text-slate-600">Confidence</p>
                  <p className="text-sm font-semibold text-slate-900">{etaPrediction.confidence_level}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">On-Time Probability</p>
                  <p className="text-sm font-semibold text-emerald-600">{etaPrediction.on_time_probability}%</p>
                </div>
              </div>
            </div>

            {/* Impact Scores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Traffic Impact</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500"
                      style={{ width: `${etaPrediction.traffic_impact_score}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {etaPrediction.traffic_impact_score}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Weather Impact</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${etaPrediction.weather_impact_score}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {etaPrediction.weather_impact_score}
                  </span>
                </div>
              </div>
            </div>

            {/* Factors */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Factors Affecting ETA
              </h4>
              <ul className="space-y-1">
                {etaPrediction.factors_affecting_eta?.map((factor, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-cyan-600">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Actions */}
            {etaPrediction.recommended_actions && etaPrediction.recommended_actions.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="text-xs font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  Recommended Actions
                </h4>
                <ul className="space-y-1">
                  {etaPrediction.recommended_actions.map((action, i) => (
                    <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                      <span>•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}

        {!etaPrediction && !isAnalyzing && (
          <Button
            onClick={predictETA}
            variant="outline"
            className="w-full border-cyan-300 text-cyan-700 hover:bg-cyan-50"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Predict ETA with AI
          </Button>
        )}

      </CardContent>
    </Card>
  );
}