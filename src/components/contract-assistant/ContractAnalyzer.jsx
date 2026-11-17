import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Upload, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ContractAnalyzer({ preselectedContract }) {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeContract = async () => {
    if (!file) {
      alert('Please upload a contract file');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Upload file
      const { file_uri: file_url } = await base44.integrations.Core.UploadPrivateFile({ file });

      // Analyze contract
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a legal AI analyzing a freight transportation contract.

Analyze the uploaded contract and provide:

1. CONTRACT SUMMARY
   - Type of agreement
   - Parties involved
   - Effective dates
   - Key terms

2. RISK ASSESSMENT (rate each LOW/MEDIUM/HIGH)
   - Liability exposure
   - Insurance gaps
   - Payment terms risk
   - Termination ease

3. KEY FINDINGS
   - Favorable clauses
   - Unfavorable clauses
   - Missing protections
   - Red flags

4. COMPLIANCE CHECK
   - FMCSA compliance
   - Insurance requirements
   - Standard industry terms

5. RECOMMENDATIONS
   - Suggested modifications
   - Negotiation points
   - Risk mitigation steps

6. OVERALL SCORE (0-100)
   Rate how favorable this contract is

Be thorough, identify legal risks, and provide actionable recommendations.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            contract_type: { type: "string" },
            parties: { type: "string" },
            effective_date: { type: "string" },
            expiration_date: { type: "string" },
            liability_risk: { type: "string" },
            insurance_risk: { type: "string" },
            payment_risk: { type: "string" },
            termination_risk: { type: "string" },
            favorable_clauses: {
              type: "array",
              items: { type: "string" }
            },
            unfavorable_clauses: {
              type: "array",
              items: { type: "string" }
            },
            red_flags: {
              type: "array",
              items: { type: "string" }
            },
            missing_protections: {
              type: "array",
              items: { type: "string" }
            },
            compliance_issues: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            overall_score: { type: "number" },
            summary: { type: "string" }
          }
        }
      });

      setAnalysis(result);

    } catch (error) {
      console.error('Contract analysis error:', error);
      alert('Failed to analyze contract');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'LOW': return 'bg-emerald-100 text-emerald-700';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700';
      case 'HIGH': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      
      {!analysis ? (
        <>
          <div>
            <Label>Upload Contract File</Label>
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className="cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-1">
              Supported: PDF, DOC, DOCX, TXT
            </p>
          </div>

          <Button
            onClick={analyzeContract}
            disabled={!file || isAnalyzing}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Contract...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          {/* Summary Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">Contract Analysis Complete</h3>
                  <p className="text-sm text-slate-600">{analysis.summary}</p>
                </div>
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                    {analysis.overall_score}
                  </div>
                  <p className="text-sm text-slate-600">Overall Score</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Type</p>
                  <p className="font-semibold text-slate-900">{analysis.contract_type}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Parties</p>
                  <p className="font-semibold text-slate-900">{analysis.parties}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Start Date</p>
                  <p className="font-semibold text-slate-900">{analysis.effective_date || 'N/A'}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">End Date</p>
                  <p className="font-semibold text-slate-900">{analysis.expiration_date || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="pt-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Risk Assessment
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Liability Exposure</span>
                    <Badge className={getRiskColor(analysis.liability_risk)}>{analysis.liability_risk}</Badge>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Insurance Coverage</span>
                    <Badge className={getRiskColor(analysis.insurance_risk)}>{analysis.insurance_risk}</Badge>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Payment Terms</span>
                    <Badge className={getRiskColor(analysis.payment_risk)}>{analysis.payment_risk}</Badge>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Termination Terms</span>
                    <Badge className={getRiskColor(analysis.termination_risk)}>{analysis.termination_risk}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Findings */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="pt-6">
                <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Favorable Clauses
                </h3>
                <ul className="space-y-2">
                  {analysis.favorable_clauses?.map((clause, idx) => (
                    <li key={idx} className="text-sm text-slate-700 p-2 bg-emerald-50 rounded">
                      • {clause}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="pt-6">
                <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Unfavorable Clauses
                </h3>
                <ul className="space-y-2">
                  {analysis.unfavorable_clauses?.map((clause, idx) => (
                    <li key={idx} className="text-sm text-slate-700 p-2 bg-red-50 rounded">
                      • {clause}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Red Flags */}
          {analysis.red_flags && analysis.red_flags.length > 0 && (
            <Card className="border-0 shadow-xl bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Red Flags - Immediate Attention Required
                </h3>
                <ul className="space-y-2">
                  {analysis.red_flags.map((flag, idx) => (
                    <li key={idx} className="text-sm text-red-900 p-3 bg-white rounded-lg border border-red-200">
                      <span className="font-bold text-red-600">⚠ </span>{flag}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="pt-6">
              <h3 className="font-bold text-slate-900 mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {analysis.recommendations?.map((rec, idx) => (
                  <li key={idx} className="text-sm text-slate-700 p-3 bg-blue-50 rounded-lg">
                    <span className="font-bold text-blue-600">{idx + 1}. </span>{rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Button
            onClick={() => setAnalysis(null)}
            variant="outline"
            className="w-full"
          >
            Analyze Another Contract
          </Button>
        </>
      )}

    </div>
  );
}