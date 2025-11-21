import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, AlertTriangle } from "lucide-react";

export default function AutomatedAudit() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const auditLoad = (load) => {
    const issues = [];
    if (!load.rate_confirmation_url) issues.push('Missing rate confirmation');
    if (!load.proof_of_delivery_url) issues.push('Missing POD');
    if (load.carrier_cost > load.customer_charge) issues.push('Negative margin');
    if (!load.carrier_id) issues.push('No carrier assigned');
    
    return {
      load,
      passed: issues.length === 0,
      issues
    };
  };

  const auditResults = loads.map(auditLoad);
  const passedAudits = auditResults.filter(a => a.passed).length;
  const failedAudits = auditResults.filter(a => !a.passed).length;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Automated Freight Audit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-50 rounded">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <p className="text-xs text-emerald-900">Passed</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{passedAudits}</p>
          </div>
          <div className="p-3 bg-red-50 rounded">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-xs text-red-900">Failed</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{failedAudits}</p>
          </div>
        </div>

        <div className="space-y-2">
          {auditResults.filter(a => !a.passed).slice(0, 5).map((audit) => (
            <div key={audit.load.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900">{audit.load.load_number}</span>
                <Badge className="bg-red-600">Failed</Badge>
              </div>
              <ul className="text-xs text-red-800 space-y-1">
                {audit.issues.map((issue, idx) => (
                  <li key={idx}>• {issue}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}