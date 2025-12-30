import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, TrendingDown, Loader2, Sparkles, CheckCircle, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AICarrierRisk() {
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState(null);

  const { data: carriers, isLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: complianceItems } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.ComplianceItem.list('-created_date', 200),
    initialData: [],
  });

  const handleAssessRisk = async () => {
    if (!selectedCarrier) return;

    setAnalyzing(true);
    setRiskAssessment(null);

    try {
      const carrierLoads = loads.filter(l => l.carrier_id === selectedCarrier.id);
      const completedLoads = carrierLoads.filter(l => l.status === 'delivered');
      const carrierCompliance = complianceItems.filter(c => c.entity_id === selectedCarrier.id && c.entity_type === 'carrier');
      const avgMargin = completedLoads.length > 0
        ? completedLoads.reduce((sum, l) => sum + (l.margin || 0), 0) / completedLoads.length
        : 0;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI carrier risk assessment agent for freight brokerage.

CARRIER PROFILE:
- Company Name: ${selectedCarrier.company_name}
- MC Number: ${selectedCarrier.mc_number}
- DOT Number: ${selectedCarrier.dot_number}
- Status: ${selectedCarrier.status}
- Contact: ${selectedCarrier.contact_name} (${selectedCarrier.email})

PERFORMANCE METRICS:
- FMCSA Safety Rating: ${selectedCarrier.fmcsa_safety_rating || 'Not Rated'}
- On-Time Percentage: ${selectedCarrier.on_time_percentage || 0}%
- Total Loads: ${selectedCarrier.total_loads || 0}
- Total Paid: $${selectedCarrier.total_paid || 0}
- Average Margin: $${avgMargin.toFixed(2)}
- Compliance Score: ${selectedCarrier.compliance_score || 0}%
- Rating: ${selectedCarrier.rating || 0}/5

INSURANCE & COMPLIANCE:
- Insurance Amount: $${selectedCarrier.insurance_amount || 0}
- Insurance Expiration: ${selectedCarrier.insurance_expiration || 'Unknown'}
- W9 on File: ${selectedCarrier.w9_url ? 'Yes' : 'No'}
- COI on File: ${selectedCarrier.coi_url ? 'Yes' : 'No'}

LOAD HISTORY:
- Completed Loads: ${completedLoads.length}
- Active Loads: ${carrierLoads.filter(l => ['assigned', 'in_transit'].includes(l.status)).length}

PERFORM COMPREHENSIVE RISK ASSESSMENT:

1. **Financial Risk**
   - Payment history analysis
   - Credit risk evaluation
   - Financial stability indicators
   - Fraud risk factors

2. **Safety & Compliance Risk**
   - FMCSA safety rating analysis
   - Compliance score evaluation
   - Insurance adequacy
   - Document compliance
   - DOT inspection history concerns

3. **Performance Risk**
   - On-time delivery reliability
   - Load acceptance/cancellation patterns
   - Communication responsiveness
   - Service quality trends

4. **Operational Risk**
   - Equipment reliability
   - Driver turnover implications
   - Capacity constraints
   - Geographic coverage limitations

5. **Relationship Risk**
   - Business relationship duration
   - Dispute history
   - Contract compliance
   - Partnership stability

6. **Market Risk**
   - Market position/competitiveness
   - Rate volatility exposure
   - Seasonal dependencies
   - Economic sensitivity

7. **Overall Risk Score** (0-100, where 0 = no risk, 100 = extreme risk)
   - Calculate weighted risk score
   - Determine risk tier (Low, Medium, High, Critical)
   - Provide risk rating justification

8. **Risk Mitigation Strategies**
   - Specific actions to reduce identified risks
   - Monitoring recommendations
   - Contingency planning suggestions
   - Relationship management tactics

9. **Recommendations**
   - Continue/pause/terminate relationship
   - Load assignment guidelines
   - Payment terms adjustments
   - Required improvements

Provide a comprehensive, data-driven risk assessment with clear actionable insights.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_risk_score: {
              type: "number",
              description: "0-100"
            },
            risk_tier: {
              type: "string",
              enum: ["low", "medium", "high", "critical"]
            },
            financial_risk: {
              type: "object",
              properties: {
                score: { type: "number" },
                level: { type: "string" },
                factors: {
                  type: "array",
                  items: { type: "string" }
                },
                assessment: { type: "string" }
              }
            },
            safety_compliance_risk: {
              type: "object",
              properties: {
                score: { type: "number" },
                level: { type: "string" },
                factors: {
                  type: "array",
                  items: { type: "string" }
                },
                assessment: { type: "string" }
              }
            },
            performance_risk: {
              type: "object",
              properties: {
                score: { type: "number" },
                level: { type: "string" },
                factors: {
                  type: "array",
                  items: { type: "string" }
                },
                assessment: { type: "string" }
              }
            },
            operational_risk: {
              type: "object",
              properties: {
                score: { type: "number" },
                level: { type: "string" },
                factors: {
                  type: "array",
                  items: { type: "string" }
                },
                assessment: { type: "string" }
              }
            },
            red_flags: {
              type: "array",
              items: { type: "string" }
            },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            mitigation_strategies: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            action_required: {
              type: "string",
              enum: ["none", "monitor", "review", "immediate_action"]
            },
            relationship_recommendation: {
              type: "string",
              enum: ["continue", "continue_with_caution", "pause", "terminate"]
            },
            summary: { type: "string" }
          }
        }
      });

      setRiskAssessment(result);

    } catch (error) {
      console.error('Risk assessment error:', error);
      alert('Failed to assess carrier risk');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (tier) => {
    switch(tier) {
      case 'low': return 'text-emerald-600 bg-emerald-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'none': return 'text-emerald-600 bg-emerald-100';
      case 'monitor': return 'text-blue-600 bg-blue-100';
      case 'review': return 'text-amber-600 bg-amber-100';
      case 'immediate_action': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-red-500/30">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-red-900 to-orange-900 bg-clip-text text-transparent mb-2">
            AI Carrier Risk Assessment
          </h1>
          <p className="text-slate-600 text-lg">
            Comprehensive risk analysis and mitigation for carrier partnerships
          </p>
          <Badge className="mt-3 bg-red-600">AI-Powered</Badge>
        </div>

        {/* Carrier Selection */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 text-lg mb-2">Select Carrier for Risk Assessment</h3>
                <Select value={selectedCarrier?.id} onValueChange={(id) => setSelectedCarrier(carriers.find(c => c.id === id))}>
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Choose a carrier..." />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map((carrier) => (
                      <SelectItem key={carrier.id} value={carrier.id}>
                        {carrier.company_name} - MC {carrier.mc_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAssessRisk}
                disabled={!selectedCarrier || analyzing}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white hover:shadow-lg hover:shadow-red-500/50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Assess Risk
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment Results */}
        {riskAssessment && (
          <>
            {/* Overall Risk Score */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-red-50">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Overall Risk Score</p>
                    <div className="flex items-center gap-4">
                      <div className="text-6xl font-bold text-slate-900">{riskAssessment.overall_risk_score}</div>
                      <div className="text-left">
                        <Badge className={`text-lg px-4 py-2 ${getRiskColor(riskAssessment.risk_tier)}`}>
                          {riskAssessment.risk_tier?.toUpperCase()} RISK
                        </Badge>
                        <p className="text-xs text-slate-500 mt-2">out of 100</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Action Required</p>
                    <Badge className={`text-lg px-4 py-2 ${getActionColor(riskAssessment.action_required)}`}>
                      {riskAssessment.action_required?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Recommendation</p>
                    <Badge className={`text-lg px-4 py-2 ${
                      riskAssessment.relationship_recommendation === 'continue' 
                        ? 'bg-emerald-100 text-emerald-800'
                        : riskAssessment.relationship_recommendation === 'continue_with_caution'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {riskAssessment.relationship_recommendation?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-600" />
                  Risk Assessment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-lg">{riskAssessment.summary}</p>
              </CardContent>
            </Card>

            {/* Risk Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Risk */}
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-amber-600" />
                      Financial Risk
                    </span>
                    <Badge className={getRiskColor(riskAssessment.financial_risk?.level)}>
                      Score: {riskAssessment.financial_risk?.score}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-700">{riskAssessment.financial_risk?.assessment}</p>
                  {riskAssessment.financial_risk?.factors?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Key Factors:</p>
                      <ul className="space-y-1">
                        {riskAssessment.financial_risk.factors.map((factor, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-amber-600">•</span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Safety & Compliance Risk */}
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      Safety & Compliance
                    </span>
                    <Badge className={getRiskColor(riskAssessment.safety_compliance_risk?.level)}>
                      Score: {riskAssessment.safety_compliance_risk?.score}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-700">{riskAssessment.safety_compliance_risk?.assessment}</p>
                  {riskAssessment.safety_compliance_risk?.factors?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Key Factors:</p>
                      <ul className="space-y-1">
                        {riskAssessment.safety_compliance_risk.factors.map((factor, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-red-600">•</span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Risk */}
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-orange-600" />
                      Performance Risk
                    </span>
                    <Badge className={getRiskColor(riskAssessment.performance_risk?.level)}>
                      Score: {riskAssessment.performance_risk?.score}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-700">{riskAssessment.performance_risk?.assessment}</p>
                  {riskAssessment.performance_risk?.factors?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Key Factors:</p>
                      <ul className="space-y-1">
                        {riskAssessment.performance_risk.factors.map((factor, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-orange-600">•</span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Operational Risk */}
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Operational Risk
                    </span>
                    <Badge className={getRiskColor(riskAssessment.operational_risk?.level)}>
                      Score: {riskAssessment.operational_risk?.score}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-700">{riskAssessment.operational_risk?.assessment}</p>
                  {riskAssessment.operational_risk?.factors?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Key Factors:</p>
                      <ul className="space-y-1">
                        {riskAssessment.operational_risk.factors.map((factor, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-red-600">•</span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Red Flags & Strengths */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {riskAssessment.red_flags?.length > 0 && (
                <Card className="border-0 shadow-xl bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-900">
                      <XCircle className="w-5 h-5" />
                      Red Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {riskAssessment.red_flags.map((flag, idx) => (
                        <li key={idx} className="text-sm text-red-900 flex items-start gap-2 p-2 bg-white rounded">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {riskAssessment.strengths?.length > 0 && (
                <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-l-emerald-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-900">
                      <CheckCircle className="w-5 h-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {riskAssessment.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-emerald-900 flex items-start gap-2 p-2 bg-white rounded">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Mitigation Strategies */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Risk Mitigation Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {riskAssessment.mitigation_strategies?.map((strategy, idx) => (
                    <li key={idx} className="text-sm text-slate-700 p-3 bg-white rounded-lg border border-blue-200">
                      <span className="font-bold text-blue-600">{idx + 1}. </span>{strategy}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Final Recommendations */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Strategic Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {riskAssessment.recommendations?.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-700 p-3 bg-white rounded-lg border border-indigo-200">
                      <span className="font-bold text-indigo-600">{idx + 1}. </span>{rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}

      </div>
    </div>
  );
}