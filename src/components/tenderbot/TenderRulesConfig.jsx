import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, CheckCircle } from "lucide-react";

export default function TenderRulesConfig() {
  const rules = [
    { name: "Minimum Margin", value: "15%", enabled: true },
    { name: "Carrier On-Time Threshold", value: "90%", enabled: true },
    { name: "Compliance Score Minimum", value: "80%", enabled: true },
    { name: "Max Tender Attempts", value: "3 carriers", enabled: true },
    { name: "Lane Fit Requirement", value: "50% match", enabled: true },
    { name: "Auto-Tender Priority Loads", value: "High & Urgent only", enabled: true }
  ];

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="border-b border-indigo-200 pb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-indigo-600" />
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              TenderBot Rules & Configuration
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Active automation rules and thresholds
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule, index) => (
            <div key={index} className="p-4 bg-white rounded-xl border border-indigo-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{rule.name}</p>
                  <p className="text-sm text-indigo-600 mt-1">{rule.value}</p>
                </div>
                {rule.enabled && (
                  <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}