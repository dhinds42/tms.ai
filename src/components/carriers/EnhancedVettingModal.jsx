import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Shield, AlertTriangle, CheckCircle, Loader2, Award, TrendingDown } from "lucide-react";

export default function EnhancedVettingModal({ carrier, loads, complianceItems, onClose, onApprove, onReject }) {
  const [vetting, setVetting] = useState(false);
  const [vettingData, setVettingData] = useState(null);

  const carrierLoads = loads?.filter(l => l.carrier_id === carrier.id) || [];
  const carrierCompliance = complianceItems?.filter(c => c.entity_id === carrier.id && c.entity_type === 'carrier') || [];

  const handleVet = async () => {
    setVetting(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Comprehensive carrier vetting for ${carrier.company_name}:

CARRIER DATA:
- MC: ${carrier.mc_number} | DOT: ${carrier.dot_number}
- Performance Score: ${carrier.compliance_score || 0}%
- On-Time: ${carrier.on_time_percentage || 0}%
- Tier: ${carrier.performance_tier || 'Not Scored'}
- Insurance Expires: ${carrier.insurance_expiration || 'Unknown'}

COMPLIANCE STATUS:
${carrierCompliance.map(c => `- ${c.compliance_type}: ${c.status}`).join('\n') || 'No records'}

LOAD HISTORY: ${carrierLoads.length} total loads

Provide:
1. Vetting score (0-100)
2. Approval status (approved/conditional/rejected)
3. Key strengths (3 items)
4. Risk factors (3 items)
5. Requirements for approval
6. Recommendation`,
        response_json_schema: {
          type: "object",
          properties: {
            vetting_score: { type: "number" },
            approval_status: { type: "string", enum: ["approved", "conditional", "rejected"] },
            strengths: { type: "array", items: { type: "string" } },
            risk_factors: { type: "array", items: { type: "string" } },
            requirements: { type: "array", items: { type: "string" } },
            recommendation: { type: "string" }
          }
        }
      });

      setVettingData(result);
    } catch (error) {
      console.error('Vetting error:', error);
      alert('Vetting failed');
    } finally {
      setVetting(false);
    }
  };

  React.useEffect(() => {
    handleVet();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Carrier Vetting</h2>
            <p className="text-sm text-slate-500 mt-1">{carrier.company_name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {vetting ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
              <p className="text-slate-600 font-medium">Running AI vetting analysis...</p>
            </div>
          ) : vettingData ? (
            <>
              {/* Vetting Score */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-indigo-50">
                <CardContent className="p-6 text-center">
                  <p className="text-sm font-semibold text-slate-500 uppercase mb-2">Vetting Score</p>
                  <div className="text-5xl font-bold text-slate-900 mb-2">{vettingData.vetting_score}</div>
                  <Badge className={`text-lg px-4 py-2 ${
                    vettingData.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    vettingData.approval_status === 'conditional' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {vettingData.approval_status?.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>

              {/* Strengths */}
              <Card className="border-l-4 border-l-emerald-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {vettingData.strengths?.map((strength, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-emerald-50 rounded">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span className="text-sm text-emerald-900">{strength}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Risk Factors */}
              {vettingData.risk_factors?.length > 0 && (
                <Card className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {vettingData.risk_factors.map((risk, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                        <span className="text-sm text-red-900">{risk}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {vettingData.requirements?.length > 0 && (
                <Card className="border-l-4 border-l-amber-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="w-5 h-5 text-amber-600" />
                      Requirements for Approval
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {vettingData.requirements.map((req, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 rounded">
                        <span className="text-amber-700 font-bold">{i + 1}.</span>
                        <span className="text-sm text-amber-900">{req}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recommendation */}
              <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">AI Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{vettingData.recommendation}</p>
                </CardContent>
              </Card>
            </>
          ) : null}

        </div>

        <div className="border-t border-slate-200 p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {vettingData?.approval_status === 'approved' && (
            <Button
              onClick={() => onApprove(vettingData)}
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Carrier
            </Button>
          )}
          {vettingData?.approval_status === 'conditional' && (
            <Button
              onClick={() => onApprove({ ...vettingData, conditional: true })}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Conditional Approval
            </Button>
          )}
          {vettingData?.approval_status === 'rejected' && (
            <Button
              onClick={() => onReject(vettingData)}
              variant="outline"
              className="border-red-300 text-red-700"
            >
              Reject
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}