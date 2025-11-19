import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, CheckCircle, Zap } from "lucide-react";

export default function AutomatedAudit() {
  const [auditing, setAuditing] = useState(false);
  const [auditResults, setAuditResults] = useState(null);

  const runFreightAudit = async () => {
    setAuditing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Perform automated freight audit analysis:

Check for:
1. Rate discrepancies vs contract
2. Accessorial charge validation
3. Duplicate charges
4. Weight/mileage verification
5. Fuel surcharge accuracy

Identify savings opportunities and billing errors.`,
        response_json_schema: {
          type: "object",
          properties: {
            total_invoices_audited: { type: "number" },
            discrepancies_found: { type: "number" },
            potential_savings: { type: "number" },
            issues: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAuditResults(result);
    } catch (error) {
      alert('Audit failed: ' + error.message);
    } finally {
      setAuditing(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Automated Freight Audit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <Button 
          onClick={runFreightAudit}
          disabled={auditing}
          className="w-full bg-blue-600 py-6"
        >
          <Zap className={`w-5 h-5 mr-2 ${auditing ? 'animate-spin' : ''}`} />
          {auditing ? 'Auditing Invoices...' : 'Run Freight Audit'}
        </Button>

        {auditResults && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-900">Invoices Audited</p>
                <p className="text-2xl font-bold text-blue-600">{auditResults.total_invoices_audited}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded border border-amber-200">
                <p className="text-xs text-amber-900">Discrepancies</p>
                <p className="text-2xl font-bold text-amber-600">{auditResults.discrepancies_found}</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-500">
              <h4 className="font-semibold text-emerald-900 mb-1">💰 Potential Savings</h4>
              <p className="text-3xl font-bold text-emerald-600">
                ${auditResults.potential_savings?.toLocaleString()}
              </p>
            </div>

            {auditResults.issues?.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Issues Found
                </h4>
                <ul className="space-y-1">
                  {auditResults.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-red-800">• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}