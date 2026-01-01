import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, AlertTriangle, Shield, Sparkles, Loader2, Star } from "lucide-react";

import CarrierScoreBreakdown from "../components/carrier-scoring/CarrierScoreBreakdown.jsx";
import ScoringLeaderboard from "../components/carrier-scoring/ScoringLeaderboard.jsx";
import ScoringCriteria from "../components/carrier-scoring/ScoringCriteria.jsx";
import AutoScoreUpdates from "../components/carrier-scoring/AutoScoreUpdates.jsx";

export default function CarrierScoring() {
  const [calculating, setCalculating] = useState(false);
  const [scoreResults, setScoreResults] = useState({});
  const [selectedCarrier, setSelectedCarrier] = useState(null);

  const queryClient = useQueryClient();

  const { data: carriers, isLoading: carriersLoading } = useQuery({
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
    queryFn: () => base44.entities.ComplianceItem.list('-created_date', 100),
    initialData: [],
  });

  const updateCarrierMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Carrier.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
    },
  });

  const calculateCarrierScore = async (carrier) => {
    setCalculating(true);
    setSelectedCarrier(carrier.id);

    try {
      const carrierLoads = loads.filter(l => l.carrier_id === carrier.id);
      const carrierCompliance = complianceItems.filter(c => c.entity_id === carrier.id);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI carrier performance scoring engine. Calculate a comprehensive carrier score.

CARRIER PROFILE:
- Company: ${carrier.company_name}
- MC/DOT: ${carrier.mc_number} / ${carrier.dot_number}
- FMCSA Safety Rating: ${carrier.fmcsa_safety_rating || 'Not Rated'}
- Insurance: $${carrier.insurance_amount?.toLocaleString()}
- Equipment: ${carrier.equipment_types?.join(', ')}
- Status: ${carrier.status}

PERFORMANCE DATA:
- Total Loads: ${carrierLoads.length}
- On-Time %: ${carrier.on_time_percentage || 0}%
- Rating: ${carrier.rating || 0}/5
- Average Margin: ${carrier.average_margin || 0}%
- Total Revenue: $${carrier.total_paid?.toLocaleString() || 0}
- Current Compliance: ${carrier.compliance_score || 0}%

RECENT LOADS:
${carrierLoads.slice(0, 10).map(l => `
- Load ${l.load_number}: ${l.status} | Rate: $${l.carrier_pay || 0} | ${l.pickup_location?.city} → ${l.dropoff_location?.city}
`).join('\n')}

COMPLIANCE STATUS:
${carrierCompliance.length > 0 ? carrierCompliance.map(c => `
- ${c.compliance_type}: ${c.status} (Expires: ${c.expiration_date || 'N/A'})
`).join('\n') : 'No compliance items recorded'}

CALCULATE COMPREHENSIVE SCORE (0-100):

1. **Reliability Score (0-100)** - 30% weight
   - On-time delivery performance
   - Load completion rate
   - Communication responsiveness
   - Issue resolution track record

2. **Safety Score (0-100)** - 25% weight
   - FMCSA safety rating
   - Accident history
   - Compliance with regulations
   - Driver qualifications

3. **Financial Score (0-100)** - 20% weight
   - Insurance coverage adequacy
   - Payment reliability (if receiving payment)
   - Credit standing
   - Financial stability indicators

4. **Service Quality Score (0-100)** - 15% weight
   - Customer/broker ratings
   - Equipment condition
   - Professional conduct
   - Value-added services

5. **Compliance Score (0-100)** - 10% weight
   - Document currency
   - Regulatory adherence
   - Required certifications
   - Audit readiness

Provide:
- Overall Score (0-100) - weighted average
- Individual category scores
- Performance tier (Platinum/Gold/Silver/Bronze/Needs Improvement)
- Score trend (improving/stable/declining)
- Strengths (top 3)
- Areas for improvement (top 3)
- Risk level (Low/Medium/High/Critical)
- Recommendation (continue partnership/monitor/reduce volume/terminate)
- Detailed explanation of scoring
- Comparison to industry benchmarks`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            reliability_score: { type: "number" },
            safety_score: { type: "number" },
            financial_score: { type: "number" },
            service_quality_score: { type: "number" },
            compliance_score: { type: "number" },
            performance_tier: { type: "string" },
            score_trend: { type: "string" },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            areas_for_improvement: {
              type: "array",
              items: { type: "string" }
            },
            risk_level: { type: "string" },
            recommendation: { type: "string" },
            detailed_explanation: { type: "string" },
            industry_benchmark_comparison: { type: "string" }
          }
        }
      });

      setScoreResults(prev => ({
        ...prev,
        [carrier.id]: result
      }));

      // Auto-update carrier with new score
      updateCarrierMutation.mutate({
        id: carrier.id,
        data: {
          compliance_score: result.overall_score,
          rating: Math.min(5, Math.round((result.overall_score / 100) * 5))
        }
      });

    } catch (error) {
      console.error('Carrier scoring error:', error);
      alert('Failed to calculate carrier score');
    } finally {
      setCalculating(false);
      setSelectedCarrier(null);
    }
  };

  const calculateAllScores = async () => {
    setCalculating(true);

    for (const carrier of carriers.slice(0, 10)) {
      await calculateCarrierScore(carrier);
    }

    setCalculating(false);
    alert('Batch scoring complete!');
  };

  const activeCarriers = carriers.filter(c => c.status === 'active');
  const avgScore = carriers.length > 0
    ? carriers.reduce((sum, c) => sum + (c.compliance_score || 0), 0) / carriers.length
    : 0;
  const topPerformers = carriers.filter(c => (c.compliance_score || 0) >= 90).length;
  const needsImprovement = carriers.filter(c => (c.compliance_score || 0) < 70).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-yellow-500/30">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-yellow-900 to-orange-900 bg-clip-text text-transparent mb-2">
            AI Carrier Performance Scoring
          </h1>
          <p className="text-slate-600 text-lg">
            Comprehensive carrier evaluation with automated scoring and benchmarking
          </p>
          <Badge className="mt-3 bg-yellow-600">Smart Analytics</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Carriers</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{activeCarriers.length}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 flex-1 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${(activeCarriers.length / Math.max(carriers.length, 1)) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-500">{((activeCarriers.length / Math.max(carriers.length, 1)) * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Score</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{avgScore.toFixed(0)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {avgScore >= 85 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : avgScore >= 70 ? (
                      <span className="w-4 h-4 text-amber-500">→</span>
                    ) : (
                      <span className="w-4 h-4 text-red-500">↓</span>
                    )}
                    <span className={`text-xs font-semibold ${avgScore >= 85 ? 'text-emerald-600' : avgScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                      {avgScore >= 85 ? 'Excellent' : avgScore >= 70 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Top Performers</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{topPerformers}</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-2">
                    {carriers.length > 0 ? `${((topPerformers / carriers.length) * 100).toFixed(0)}% of carriers` : 'No data'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Needs Review</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{needsImprovement}</p>
                  {needsImprovement > 0 && (
                    <Badge className="mt-2 bg-amber-100 text-amber-700 text-xs">Action Required</Badge>
                  )}
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Batch Actions */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Automated Scoring</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Calculate comprehensive performance scores for all carriers
                </p>
              </div>
              <Button
                onClick={calculateAllScores}
                disabled={calculating || carriersLoading}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:shadow-lg"
              >
                {calculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Score All Carriers
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scoring Criteria */}
        <ScoringCriteria />

        {/* Leaderboard */}
        <ScoringLeaderboard 
          carriers={carriers}
          scoreResults={scoreResults}
          onCalculateScore={calculateCarrierScore}
          calculating={calculating}
          selectedCarrier={selectedCarrier}
        />

        {/* Detailed Score Breakdowns */}
        {Object.keys(scoreResults).length > 0 && (
          <>
            {carriers
              .filter(c => scoreResults[c.id])
              .slice(0, 5)
              .map(carrier => (
                <CarrierScoreBreakdown
                  key={carrier.id}
                  carrier={carrier}
                  scoreData={scoreResults[carrier.id]}
                  loads={loads.filter(l => l.carrier_id === carrier.id)}
                />
              ))}
          </>
        )}

        {/* Auto-Updates Info */}
        <AutoScoreUpdates />

      </div>
    </div>
  );
}