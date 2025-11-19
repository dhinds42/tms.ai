import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, CheckCircle, AlertTriangle } from "lucide-react";

export default function AuditChecklist() {
  const auditItems = [
    { category: 'Driver Files', items: ['CDL Copies', 'Medical Cards', 'MVR Records', 'Employment Applications'], complete: 4, total: 4 },
    { category: 'Vehicle Files', items: ['Annual Inspections', 'Maintenance Records', 'Insurance Certificates'], complete: 3, total: 3 },
    { category: 'Safety Records', items: ['Accident Register', 'Drug Test Results', 'Training Records'], complete: 2, total: 3 },
    { category: 'HOS Compliance', items: ['ELD Logs', 'Paper Log Backups', 'Supporting Documents'], complete: 3, total: 3 }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          DOT Audit Readiness Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {auditItems.map((category, idx) => (
          <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-900">{category.category}</span>
              {category.complete === category.total ? (
                <Badge className="bg-emerald-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              ) : (
                <Badge className="bg-amber-600">
                  {category.complete}/{category.total}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              {category.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Checkbox checked={i < category.complete} />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

      </CardContent>
    </Card>
  );
}