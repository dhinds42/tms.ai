import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, AlertTriangle, Loader2, Sparkles } from "lucide-react";

export default function CreditCheckModule({ shippers, isLoading, operatingMode }) {
  const [checking, setChecking] = useState(null);
  const [results, setResults] = useState({});

  const runCreditCheck = async (shipper) => {
    setChecking(shipper.id);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a credit analysis AI for a ${operatingMode} operation.

Perform a comprehensive credit check for the following shipper:

SHIPPER DETAILS:
- Company: ${shipper.company_name}
- Contact: ${shipper.contact_name}
- Email: ${shipper.email}
- DUNS: ${shipper.duns_number || 'Not provided'}
- Tax ID: ${shipper.tax_id || 'Not provided'}
- Industry: ${shipper.industry || 'Unknown'}
- Company Size: ${shipper.company_size || 'Unknown'}
- Annual Volume: $${shipper.annual_volume || 'Unknown'}
- Payment Terms: ${shipper.payment_terms || 'Not set'}

CREDIT CHECK ANALYSIS REQUIRED:

1. **Credit Score** (0-850 scale):
   - Estimate based on available information
   - Industry benchmarks
   - Payment history indicators

2. **Risk Assessment**:
   - Risk Level: LOW/MEDIUM/HIGH/CRITICAL
   - Risk Factors (list key concerns)
   - Payment Risk Score (0-100)

3. **Recommended Credit Limit**:
   - Based on company size and industry
   - Conservative estimate
   - Maximum exposure recommendation

4. **Payment Behavior Analysis**:
   - Expected payment patterns
   - Historical payment indicators
   - Days sales outstanding (DSO) estimate

5. **Financial Health Indicators**:
   - Business stability assessment
   - Industry position
   - Growth trajectory

6. **Approval Recommendation**:
   - APPROVE / CONDITIONAL / REJECT
   - Required conditions if conditional
   - Justification for decision

7. **Monitoring Requirements**:
   - What to watch for
   - Red flags to monitor
   - Review frequency recommendation

Provide realistic credit assessment based on business context and industry standards.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            credit_score: { type: "number" },
            risk_level: { type: "string" },
            risk_factors: {
              type: "array",
              items: { type: "string" }
            },
            payment_risk_score: { type: "number" },
            recommended_credit_limit: { type: "number" },
            expected_dso: { type: "number" },
            financial_health: { type: "string" },
            approval_recommendation: { type: "string" },
            conditions: {
              type: "array",
              items: { type: "string" }
            },
            monitoring_requirements: {
              type: "array",
              items: { type: "string" }
            },
            analysis_summary: { type: "string" }
          }
        }
      });

      setResults(prev => ({
        ...prev,
        [shipper.id]: result
      }));

    } catch (error) {
      console.error('Credit check error:', error);
      alert('Failed to perform credit check');
    } finally {
      setChecking(null);
    }
  };

  const pendingShippers = shippers.filter(s => s.credit_status === 'pending' || !s.credit_status);
  const approvedShippers = shippers.filter(s => s.credit_status === 'approved');
  const requiresReview = shippers.filter(s => s.credit_status === 'requires_review');

  const getCreditBadge = (status) => {
    switch (status) {
      case 'approved': return <Badge className="bg-emerald-600">Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-600">Rejected</Badge>;
      case 'requires_review': return <Badge className="bg-amber-600">Requires Review</Badge>;
      default: return <Badge className="bg-slate-600">Pending</Badge>;
    }
  };

  const getRiskColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'LOW': return 'text-emerald-600 bg-emerald-50';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50';
      case 'HIGH': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading credit check data...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-900 mb-1">Approved</p>
                <p className="text-3xl font-bold text-emerald-600">{approvedShippers.length}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-emerald-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">Requires Review</p>
                <p className="text-3xl font-bold text-amber-600">{requiresReview.length}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-1">Pending</p>
                <p className="text-3xl font-bold text-slate-600">{pendingShippers.length}</p>
              </div>
              <Shield className="w-12 h-12 text-slate-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shippers Requiring Credit Check */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-6">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Credit Check Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {shippers.map((shipper) => {
              const checkResult = results[shipper.id];
              
              return (
                <div key={shipper.id} className="p-5 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-1">
                        {shipper.company_name}
                      </h4>
                      <p className="text-sm text-slate-600">{shipper.contact_name}</p>
                      <div className="mt-2">
                        {getCreditBadge(shipper.credit_status)}
                      </div>
                    </div>
                    <Button
                      onClick={() => runCreditCheck(shipper)}
                      disabled={checking === shipper.id}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    >
                      {checking === shipper.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Run Credit Check
                        </>
                      )}
                    </Button>
                  </div>

                  {checkResult && (
                    <div className="mt-4 space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">Credit Score</p>
                          <p className="text-3xl font-bold text-blue-600">
                            {checkResult.credit_score}
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">Risk Level</p>
                          <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getRiskColor(checkResult.risk_level)}`}>
                            {checkResult.risk_level}
                          </div>
                        </div>
                        <div className="p-4 bg-white rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">Recommended Limit</p>
                          <p className="text-3xl font-bold text-emerald-600">
                            ${checkResult.recommended_credit_limit?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-xl">
                        <h5 className="font-semibold text-slate-900 mb-2">Analysis Summary</h5>
                        <p className="text-sm text-slate-700 mb-3">{checkResult.analysis_summary}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="font-semibold text-slate-900 text-sm mb-2">Risk Factors</h6>
                            <ul className="text-sm text-slate-700 space-y-1">
                              {checkResult.risk_factors?.map((factor, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                  <span>{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-semibold text-slate-900 text-sm mb-2">Monitoring</h6>
                            <ul className="text-sm text-slate-700 space-y-1">
                              {checkResult.monitoring_requirements?.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-indigo-900 mb-1">
                              Recommendation: {checkResult.approval_recommendation}
                            </p>
                            {checkResult.conditions && checkResult.conditions.length > 0 && (
                              <ul className="text-sm text-indigo-700 mt-2 space-y-1">
                                {checkResult.conditions.map((condition, idx) => (
                                  <li key={idx}>• {condition}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}