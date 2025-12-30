import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle, FileText, Shield } from "lucide-react";

export default function AutomatedCarrierOnboarding({ carriers }) {
  const [onboardingQueue, setOnboardingQueue] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const processOnboarding = async () => {
      const pendingCarriers = carriers?.filter(c => c.status === 'pending_approval').slice(0, 5) || [];
      if (pendingCarriers.length === 0) return;

      setProcessing(true);
      try {
        const results = await Promise.all(
          pendingCarriers.map(async (carrier) => {
            const result = await base44.integrations.Core.InvokeLLM({
              prompt: `Automated carrier onboarding vetting:

CARRIER: ${carrier.company_name}
MC: ${carrier.mc_number}
DOT: ${carrier.dot_number}
Insurance: $${carrier.insurance_amount} (expires: ${carrier.insurance_expiration})
Equipment: ${carrier.equipment_types?.join(', ')}

Perform automated checks:
1. FMCSA authority verification (active/inactive)
2. Insurance adequacy ($1M minimum for general freight)
3. Safety rating compliance
4. Required document completeness
5. Equipment capability match

Recommend: approve, conditional_approve (with requirements), or reject`,
              response_json_schema: {
                type: "object",
                properties: {
                  recommendation: { type: "string", enum: ["approve", "conditional_approve", "reject"] },
                  confidence: { type: "number" },
                  passed_checks: { type: "array", items: { type: "string" } },
                  failed_checks: { type: "array", items: { type: "string" } },
                  requirements: { type: "array", items: { type: "string" } },
                  reasoning: { type: "string" }
                }
              }
            });

            return { carrier, ...result };
          })
        );

        setOnboardingQueue(results);
      } catch (error) {
        console.error('Onboarding automation error:', error);
      } finally {
        setProcessing(false);
      }
    };

    processOnboarding();
  }, [carriers]);

  if (onboardingQueue.length === 0 && !processing) return null;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="w-5 h-5 text-emerald-600" />
          Automated Onboarding
          {processing && <Badge className="ml-auto bg-emerald-600 animate-pulse">Processing...</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {onboardingQueue.map((item, i) => (
          <div key={i} className={`p-3 rounded-lg border ${
            item.recommendation === 'approve' ? 'bg-emerald-50 border-emerald-300' :
            item.recommendation === 'conditional_approve' ? 'bg-amber-50 border-amber-300' :
            'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  {item.carrier.company_name}
                </h3>
                <p className="text-xs text-slate-600">MC: {item.carrier.mc_number}</p>
              </div>
              <Badge className={
                item.recommendation === 'approve' ? 'bg-emerald-600' :
                item.recommendation === 'conditional_approve' ? 'bg-amber-600' :
                'bg-red-600'
              }>
                {item.confidence}% confidence
              </Badge>
            </div>

            <div className="space-y-2">
              {item.passed_checks?.length > 0 && (
                <div className="space-y-1">
                  {item.passed_checks.slice(0, 2).map((check, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-emerald-700">
                      <CheckCircle className="w-3 h-3" />
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              )}

              {item.failed_checks?.length > 0 && (
                <div className="space-y-1">
                  {item.failed_checks.map((check, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-red-700">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              )}

              {item.requirements?.length > 0 && (
                <div className="p-2 bg-white rounded text-xs text-amber-900">
                  <strong>Required:</strong> {item.requirements[0]}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs">
                {item.recommendation === 'approve' ? 'Auto-Approve' : 'Review'}
              </Button>
              <Button size="sm" variant="outline" className="text-xs">Details</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}