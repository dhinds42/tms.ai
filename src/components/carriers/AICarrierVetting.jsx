import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, AlertTriangle, Brain, Loader2, TrendingUp } from "lucide-react";

export default function AICarrierVetting({ carrier, onVettingComplete }) {
  const [vetting, setVetting] = useState(false);
  const [results, setResults] = useState(null);

  const runVettingProcess = async () => {
    setVetting(true);
    
    try {
      // Comprehensive AI vetting prompt
      const vettingPrompt = `
        You are an expert freight broker analyzing carrier safety and reliability.
        
        CARRIER INFORMATION:
        - Company: ${carrier.company_name}
        - DOT#: ${carrier.dot_number || 'N/A'}
        - MC#: ${carrier.mc_number || 'N/A'}
        - Years in Business: ${carrier.years_in_business || 'Unknown'}
        - Fleet Size: ${carrier.fleet_size || 'Unknown'}
        - Service Lanes: ${carrier.service_lanes?.join(', ') || 'N/A'}
        - Equipment Types: ${carrier.equipment_types?.join(', ') || 'N/A'}
        
        PERFORMANCE METRICS:
        - On-Time Rate: ${carrier.on_time_percentage || 0}%
        - Safety Score: ${carrier.safety_score || 0}
        - Insurance: ${carrier.insurance_verified ? 'Verified' : 'Not Verified'}
        - Authority Status: ${carrier.authority_status || 'Unknown'}
        
        VETTING ANALYSIS REQUIRED:
        
        1. SAFETY ASSESSMENT (0-100 score)
           - DOT safety rating implications
           - Insurance coverage adequacy
           - Authority status concerns
           - Historical incident analysis
        
        2. RELIABILITY SCORE (0-100)
           - On-time performance evaluation
           - Communication responsiveness
           - Equipment maintenance indicators
           - Operational consistency
        
        3. FINANCIAL STABILITY (High/Medium/Low)
           - Years in business factor
           - Fleet size stability
           - Insurance compliance
           - Market presence
        
        4. COMPLIANCE STATUS (Pass/Fail/Conditional)
           - DOT/MC authority validation
           - Insurance requirements met
           - Safety regulations adherence
           - Operating authority scope
        
        5. RISK ASSESSMENT
           - Identify specific risk factors
           - Red flags or concerns
           - Mitigation recommendations
        
        6. LANE SUITABILITY
           - Best matching lanes for this carrier
           - Equipment compatibility
           - Geographic coverage fit
        
        7. OVERALL RECOMMENDATION
           - Approved/Conditional/Rejected
           - Suggested load types
           - Rate guidance (below/at/above market)
           - Special handling requirements
        
        Provide detailed, data-driven analysis with specific action items.
      `;

      const aiAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: vettingPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            safety_score: { type: "number", description: "0-100" },
            reliability_score: { type: "number", description: "0-100" },
            financial_stability: { type: "string", description: "High/Medium/Low" },
            compliance_status: { type: "string", description: "Pass/Fail/Conditional" },
            overall_score: { type: "number", description: "Composite 0-100" },
            recommendation: { type: "string", description: "Approved/Conditional/Rejected" },
            risk_factors: {
              type: "array",
              items: { type: "string" }
            },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            suitable_lanes: {
              type: "array",
              items: { type: "string" }
            },
            rate_guidance: { type: "string" },
            special_notes: { type: "string" },
            action_items: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setResults(aiAnalysis);
      
      // Update carrier with AI vetting results
      if (onVettingComplete) {
        onVettingComplete({
          ai_vetting_score: aiAnalysis.overall_score,
          ai_vetting_date: new Date().toISOString(),
          ai_vetting_status: aiAnalysis.recommendation,
          ai_vetting_details: aiAnalysis
        });
      }

    } catch (error) {
      console.error('AI vetting error:', error);
      alert('Failed to complete AI vetting');
    } finally {
      setVetting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-emerald-600';
    if (score >= 60) return 'bg-blue-600';
    if (score >= 40) return 'bg-amber-600';
    return 'bg-red-600';
  };

  const getRecommendationBadge = (rec) => {
    const styles = {
      'Approved': 'bg-emerald-600',
      'Conditional': 'bg-amber-600',
      'Rejected': 'bg-red-600'
    };
    return styles[rec] || 'bg-slate-600';
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="border-b border-indigo-100">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          AI Carrier Vetting & Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        
        {!vetting && !results && (
          <div>
            <div className="p-4 bg-white rounded-lg border border-indigo-200 mb-4">
              <h4 className="font-semibold text-indigo-900 mb-3">🤖 AI Vetting Includes:</h4>
              <ul className="text-sm text-indigo-800 space-y-2">
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Safety Analysis:</strong> DOT ratings, insurance, authority validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Reliability Scoring:</strong> On-time performance, communication, consistency</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Financial Stability:</strong> Years in business, fleet size, market presence</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Risk Assessment:</strong> Red flags, concerns, mitigation strategies</span>
                </li>
              </ul>
            </div>
            
            <Button
              onClick={runVettingProcess}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6"
            >
              <Brain className="w-5 h-5 mr-2" />
              Run AI Vetting Analysis
            </Button>
          </div>
        )}

        {vetting && (
          <div className="text-center py-8">
            <Brain className="w-16 h-16 text-indigo-600 animate-pulse mx-auto mb-4" />
            <p className="font-semibold text-indigo-900 mb-3">AI Vetting in Progress...</p>
            <div className="space-y-2 text-sm text-indigo-700">
              <p>🔍 Analyzing safety records...</p>
              <p>📊 Evaluating performance metrics...</p>
              <p>💰 Assessing financial stability...</p>
              <p>⚠️ Identifying risk factors...</p>
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            
            {/* Overall Recommendation */}
            <div className={`p-4 rounded-lg border-2 ${
              results.recommendation === 'Approved' ? 'bg-emerald-50 border-emerald-300' :
              results.recommendation === 'Conditional' ? 'bg-amber-50 border-amber-300' :
              'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg">Overall Recommendation</span>
                <Badge className={getRecommendationBadge(results.recommendation)}>
                  {results.recommendation}
                </Badge>
              </div>
              <p className="text-sm">{results.special_notes}</p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 mb-2">Safety Score</p>
                <div className="flex items-center gap-2">
                  <Progress value={results.safety_score} className="flex-1" />
                  <span className="font-bold">{results.safety_score}</span>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 mb-2">Reliability Score</p>
                <div className="flex items-center gap-2">
                  <Progress value={results.reliability_score} className="flex-1" />
                  <span className="font-bold">{results.reliability_score}</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 mb-2">Overall Score</p>
                <div className="text-2xl font-bold text-indigo-600">{results.overall_score}/100</div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 mb-2">Financial Stability</p>
                <Badge className={
                  results.financial_stability === 'High' ? 'bg-emerald-600' :
                  results.financial_stability === 'Medium' ? 'bg-blue-600' :
                  'bg-amber-600'
                }>
                  {results.financial_stability}
                </Badge>
              </div>
            </div>

            {/* Strengths */}
            {results.strengths?.length > 0 && (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {results.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-emerald-800">✓ {strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Factors */}
            {results.risk_factors?.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risk Factors
                </h4>
                <ul className="space-y-1">
                  {results.risk_factors.map((risk, idx) => (
                    <li key={idx} className="text-sm text-red-800">⚠ {risk}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {results.action_items?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Action Items</h4>
                <ul className="space-y-1">
                  {results.action_items.map((item, idx) => (
                    <li key={idx} className="text-sm text-blue-800">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={() => setResults(null)} variant="outline" className="w-full">
              Run Another Analysis
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}