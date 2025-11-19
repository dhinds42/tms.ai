import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, TrendingUp } from "lucide-react";

export default function DoubleBrokerFraudScorer({ load }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [riskScore, setRiskScore] = useState(null);

  const analyzeDoubleBrokerRisk = async () => {
    setAnalyzing(true);
    try {
      // AI-powered fraud risk scoring
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this freight transaction for double brokering and fraud risk:

Load Details:
- Carrier: ${load.carrier_name || 'Unknown'}
- MC Number: ${load.carrier_mc || 'Not provided'}
- Rate: $${load.carrier_pay || 0}
- Equipment: ${load.equipment_type || 'Unknown'}
- Route: ${load.origin_city}, ${load.origin_state} to ${load.destination_city}, ${load.destination_state}

Red Flags to Check:
1. Carrier refuses to provide equipment photos
2. Unusual payment arrangements
3. Rate is suspiciously low for lane
4. MC number mismatch with carrier name
5. New/unknown carrier with no history
6. Equipment type doesn't match carrier profile
7. Last-minute driver changes
8. Different company name on documents

Provide a fraud risk score (0-100) and specific risk factors found.`,
        response_json_schema: {
          type: "object",
          properties: {
            risk_score: { type: "number" },
            risk_level: { type: "string" },
            red_flags: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            requires_verification: { type: "boolean" }
          }
        }
      });

      setRiskScore(result);

    } catch (error) {
      alert('Risk analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'low': return 'emerald';
      case 'medium': return 'amber';
      case 'high': return 'red';
      case 'critical': return 'red';
      default: return 'slate';
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          Double Broker Fraud Scorer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-900">AI-Powered Fraud Detection</h4>
          </div>
          <p className="text-sm text-red-800">
            Analyze transactions for double brokering patterns and fraud indicators
          </p>
        </div>

        <Button 
          onClick={analyzeDoubleBrokerRisk}
          disabled={analyzing || !load}
          className="w-full bg-red-600 py-6"
        >
          <TrendingUp className={`w-5 h-5 mr-2 ${analyzing ? 'animate-pulse' : ''}`} />
          {analyzing ? 'Analyzing Risk...' : 'Analyze Double Broker Risk'}
        </Button>

        {riskScore && (
          <div className="space-y-4">
            
            <div className={`p-4 rounded-lg border-2 bg-${getRiskColor(riskScore.risk_level)}-50 border-${getRiskColor(riskScore.risk_level)}-500`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-lg">Risk Assessment</h4>
                <Badge className={`bg-${getRiskColor(riskScore.risk_level)}-600 text-lg px-4 py-1`}>
                  {riskScore.risk_level} RISK
                </Badge>
              </div>
              <div className="mb-3">
                <p className="text-sm font-semibold mb-1">Risk Score</p>
                <div className="w-full bg-slate-200 rounded-full h-6">
                  <div 
                    className={`bg-${getRiskColor(riskScore.risk_level)}-600 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold`}
                    style={{ width: `${riskScore.risk_score}%` }}
                  >
                    {riskScore.risk_score}/100
                  </div>
                </div>
              </div>
            </div>

            {riskScore.red_flags?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-300">
                <h4 className="font-semibold text-amber-900 mb-2">🚩 Red Flags Detected</h4>
                <ul className="space-y-1">
                  {riskScore.red_flags.map((flag, idx) => (
                    <li key={idx} className="text-sm text-amber-800">• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {riskScore.recommendations?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-300">
                <h4 className="font-semibold text-blue-900 mb-2">✓ Recommended Actions</h4>
                <ul className="space-y-1">
                  {riskScore.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-blue-800">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {riskScore.requires_verification && (
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-500">
                <p className="font-bold text-red-900">⚠️ VERIFICATION REQUIRED</p>
                <p className="text-sm text-red-800 mt-1">
                  High fraud risk detected. Verify carrier identity and authority before proceeding.
                </p>
              </div>
            )}

          </div>
        )}

      </CardContent>
    </Card>
  );
}