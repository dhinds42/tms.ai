import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function SafetyMetrics({ drivers }) {
  const complianceIssues = drivers.filter(d => {
    const cdlExpired = d.cdl_expiration && new Date(d.cdl_expiration) < new Date();
    const medicalExpired = d.medical_card_expiration && new Date(d.medical_card_expiration) < new Date();
    return cdlExpired || medicalExpired;
  });

  const hosCompliant = drivers.filter(d => (d.hos_remaining || 0) >= 3);
  const hosAtRisk = drivers.filter(d => (d.hos_remaining || 0) < 3 && (d.hos_remaining || 0) > 0);
  const hosViolation = drivers.filter(d => (d.hos_remaining || 0) <= 0);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      
      {/* HOS Compliance */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            HOS Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-slate-900">Compliant</span>
              </div>
              <Badge className="bg-emerald-600 text-white">
                {hosCompliant.length} drivers
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-slate-900">At Risk (&lt;3h)</span>
              </div>
              <Badge className="bg-amber-600 text-white">
                {hosAtRisk.length} drivers
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-slate-900">Violation</span>
              </div>
              <Badge className="bg-red-600 text-white">
                {hosViolation.length} drivers
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Compliance */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-indigo-600" />
            Document Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-slate-900">All Current</span>
              </div>
              <Badge className="bg-emerald-600 text-white">
                {drivers.length - complianceIssues.length} drivers
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-slate-900">Expired Docs</span>
              </div>
              <Badge className="bg-red-600 text-white">
                {complianceIssues.length} drivers
              </Badge>
            </div>

            {complianceIssues.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900 font-medium mb-2">Immediate Action Required:</p>
                <ul className="space-y-1">
                  {complianceIssues.slice(0, 3).map((driver, idx) => (
                    <li key={idx} className="text-sm text-amber-800">
                      • {driver.full_name} - Update documents
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}