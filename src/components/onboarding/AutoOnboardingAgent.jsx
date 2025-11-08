import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, Zap } from "lucide-react";

export default function AutoOnboardingAgent() {
  const automationSteps = [
    { name: "FMCSA Data Pull", status: "active", description: "Automatically fetches MC/DOT data" },
    { name: "Insurance Verification", status: "active", description: "Validates insurance certificates" },
    { name: "Document OCR", status: "active", description: "Extracts data from uploaded documents" },
    { name: "Compliance Check", status: "active", description: "Verifies safety ratings and violations" },
    { name: "Credit Check", status: "active", description: "Runs carrier credit assessment" },
    { name: "Auto-Approval", status: "ready", description: "Approves carriers meeting all criteria" }
  ];

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="border-b border-indigo-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Auto-Onboarding Agent Active
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              AI is automatically processing and vetting new carrier applications
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-4">
          {automationSteps.map((step, index) => (
            <div key={index} className="p-4 bg-white rounded-xl border border-indigo-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 text-sm">{step.name}</h4>
                  <p className="text-xs text-slate-600 mt-1">{step.description}</p>
                </div>
                {step.status === 'active' ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700 border border-blue-300 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-white rounded-xl border border-indigo-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-medium text-slate-900">Automation Status</p>
              <p className="text-sm text-slate-600">
                Average approval time reduced from 24h to 2.5h with AI automation
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}