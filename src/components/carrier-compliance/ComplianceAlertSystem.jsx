import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const statusColors = {
  COMPLIANT: "bg-emerald-100 text-emerald-700 border-emerald-300",
  AT_RISK: "bg-amber-100 text-amber-700 border-amber-300",
  NON_COMPLIANT: "bg-red-100 text-red-700 border-red-300"
};

export default function ComplianceAlertSystem({ auditResults }) {
  const critical = auditResults.filter(r => r.compliance_status === 'NON_COMPLIANT');
  const warnings = auditResults.filter(r => r.compliance_status === 'AT_RISK');

  return (
    <div className="space-y-6">
      
      {/* Critical Alerts */}
      {critical.length > 0 && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-500">
          <CardHeader className="border-b border-red-200 pb-6">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <XCircle className="w-6 h-6" />
              Critical Compliance Issues ({critical.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {critical.map((result) => (
                <div key={result.carrier_id} className="p-5 bg-white rounded-xl border-2 border-red-300">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{result.carrier_name}</h4>
                      <Badge className="mt-2 bg-red-600 text-white">
                        Risk: {result.risk_level}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-red-600">{result.compliance_score}</div>
                      <p className="text-xs text-slate-600">Score</p>
                    </div>
                  </div>

                  {result.critical_issues && result.critical_issues.length > 0 && (
                    <div className="mb-3 p-3 bg-red-50 rounded-lg">
                      <h5 className="text-sm font-semibold text-red-900 mb-2">Critical Issues:</h5>
                      <ul className="space-y-1">
                        {result.critical_issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-red-800">• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.action_items && result.action_items.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <h5 className="text-sm font-semibold text-amber-900 mb-2">Required Actions:</h5>
                      <ul className="space-y-1">
                        {result.action_items.map((action, idx) => (
                          <li key={idx} className="text-sm text-amber-800">• {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-6">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Carriers Needing Attention ({warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {warnings.map((result) => (
                <div key={result.carrier_id} className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h4 className="font-semibold text-slate-900 mb-2">{result.carrier_name}</h4>
                  <div className="mb-3">
                    <Badge className="bg-amber-600 text-white">
                      Score: {result.compliance_score}
                    </Badge>
                  </div>
                  {result.expiring_soon && result.expiring_soon.length > 0 && (
                    <div className="text-sm text-amber-900">
                      <p className="font-medium mb-1">Expiring Soon:</p>
                      <ul className="space-y-1">
                        {result.expiring_soon.slice(0, 2).map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}