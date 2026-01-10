import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Shield, TrendingUp, AlertTriangle, CheckCircle, Loader2, Award } from "lucide-react";
import { Input } from "@/components/ui/input";

import CarrierScoreCard from "../components/scout/CarrierScoreCard";
import ScoutAnalysis from "../components/scout/ScoutAnalysis";

export default function ScoutAgent() {
  const [mcNumber, setMcNumber] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

  const { data: carriers, isLoading } = useScopedEntity('Carrier', { limit: 100 });

  const updateCarrierMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Carrier.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
    },
  });

  const analyzeCarrier = async (carrier) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Scout, an AI carrier vetting agent for a freight brokerage TMS. 

Analyze the following carrier and provide a comprehensive risk assessment and score:

CARRIER DETAILS:
- Company: ${carrier.company_name}
- MC Number: ${carrier.mc_number}
- DOT Number: ${carrier.dot_number}
- FMCSA Safety Rating: ${carrier.fmcsa_safety_rating || 'Not Rated'}
- Insurance Expiration: ${carrier.insurance_expiration || 'Unknown'}
- Insurance Amount: $${carrier.insurance_amount?.toLocaleString() || 'Unknown'}
- Equipment Types: ${carrier.equipment_types?.join(', ') || 'Not specified'}
- Total Loads: ${carrier.total_loads || 0}
- On-Time Percentage: ${carrier.on_time_percentage || 0}%
- Current Status: ${carrier.status}
- Rating: ${carrier.rating || 'Not rated'}
- Compliance Score: ${carrier.compliance_score || 0}%

ANALYSIS REQUIRED:
1. Overall Carrier Score (0-100) - Composite score based on all factors
2. Safety Score (0-100) - Based on FMCSA rating and compliance
3. Reliability Score (0-100) - Based on on-time %, total loads, and rating
4. Financial Score (0-100) - Based on insurance coverage and status
5. Risk Level (LOW/MEDIUM/HIGH/CRITICAL)
6. Approval Recommendation (APPROVE/CONDITIONAL/REJECT)
7. Key Strengths (list 3-5 positive factors)
8. Key Concerns (list 3-5 risk factors or red flags)
9. Lane Suitability Assessment (which types of loads they're best for)
10. Monitoring Requirements (what to watch for this carrier)
11. Recommended Actions (immediate steps to take)
12. Detailed Analysis Summary

Be thorough and critical. Flag any red flags like expired insurance, poor safety ratings, or low compliance scores.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            safety_score: { type: "number" },
            reliability_score: { type: "number" },
            financial_score: { type: "number" },
            risk_level: { type: "string" },
            approval_recommendation: { type: "string" },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            concerns: {
              type: "array",
              items: { type: "string" }
            },
            lane_suitability: { type: "string" },
            monitoring_requirements: { type: "string" },
            recommended_actions: {
              type: "array",
              items: { type: "string" }
            },
            analysis_summary: { type: "string" }
          }
        }
      });

      setAnalysis({
        ...result,
        carrier_id: carrier.id,
        carrier_name: carrier.company_name
      });

      // Auto-update carrier compliance score with Scout's assessment
      if (result.overall_score) {
        updateCarrierMutation.mutate({
          id: carrier.id,
          data: {
            compliance_score: result.overall_score,
            status: result.approval_recommendation === 'APPROVE' ? 'active' : 
                    result.approval_recommendation === 'CONDITIONAL' ? 'pending_approval' : 'suspended'
          }
        });
      }

    } catch (err) {
      setError(err.message || 'Failed to analyze carrier');
      console.error('Scout analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const searchCarrierByMC = () => {
    const carrier = carriers.find(c => 
      c.mc_number?.toLowerCase().includes(mcNumber.toLowerCase())
    );
    if (carrier) {
      analyzeCarrier(carrier);
    } else {
      setError('Carrier not found. Please add the carrier first.');
    }
  };

  const needsReview = carriers.filter(c => 
    c.status === 'pending_approval' || 
    (c.compliance_score || 0) < 70 ||
    !c.insurance_expiration
  );

  const highPerformers = carriers.filter(c => 
    c.status === 'active' && 
    (c.compliance_score || 0) >= 90 &&
    (c.on_time_percentage || 0) >= 95
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent mb-2">
            Scout: AI Carrier Vetting Agent
          </h1>
          <p className="text-slate-600 text-lg">
            Automated carrier analysis, risk assessment, and compliance scoring
          </p>
          <Badge className="mt-3 bg-emerald-600">Powered by AI</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Needs Review</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{needsReview.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">High Performers</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{highPerformers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Carriers</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{carriers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-6">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-600" />
              Analyze Carrier
            </CardTitle>
            <p className="text-sm text-slate-500 mt-2">
              Enter MC number to run Scout's AI-powered carrier vetting analysis
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input
                placeholder="Enter MC Number (e.g., MC-123456)"
                value={mcNumber}
                onChange={(e) => setMcNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchCarrierByMC()}
                className="flex-1"
              />
              <Button
                onClick={searchCarrierByMC}
                disabled={!mcNumber.trim() || isAnalyzing}
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Run Scout Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Analysis Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && (
          <ScoutAnalysis analysis={analysis} />
        )}

        {/* Carriers Needing Review */}
        {needsReview.length > 0 && (
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-100 pb-6">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Carriers Needing Review ({needsReview.length})
              </CardTitle>
              <p className="text-sm text-slate-500 mt-2">
                These carriers require immediate Scout analysis
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {needsReview.map(carrier => (
                  <CarrierScoreCard
                    key={carrier.id}
                    carrier={carrier}
                    onAnalyze={() => analyzeCarrier(carrier)}
                    isAnalyzing={isAnalyzing}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* High Performers */}
        {highPerformers.length > 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardHeader className="border-b border-emerald-200 pb-6">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Award className="w-5 h-5 text-emerald-600" />
                Top Performing Carriers ({highPerformers.length})
              </CardTitle>
              <p className="text-sm text-emerald-700 mt-2">
                Carriers with excellent compliance and performance scores
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {highPerformers.map(carrier => (
                  <CarrierScoreCard
                    key={carrier.id}
                    carrier={carrier}
                    onAnalyze={() => analyzeCarrier(carrier)}
                    isAnalyzing={isAnalyzing}
                    variant="success"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}