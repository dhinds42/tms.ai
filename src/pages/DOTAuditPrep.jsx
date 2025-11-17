import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, CheckCircle, AlertTriangle } from "lucide-react";

export default function DOTAuditPrep() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            DOT Audit Preparation
          </h1>
          <p className="text-slate-600 mt-2">Compliance readiness and audit documentation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Readiness Score</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">94%</p>
                </div>
                <Shield className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Documents Ready</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">1,247</p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Compliant Items</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">87</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Action Items</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">7</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Audit Checklist</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-slate-900">Driver Qualification Files</span>
                </div>
                <Badge className="bg-emerald-600">Complete</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-slate-900">HOS Records</span>
                </div>
                <Badge className="bg-emerald-600">Complete</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-slate-900">Vehicle Maintenance Records</span>
                </div>
                <Badge className="bg-emerald-600">Complete</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-slate-900">Drug & Alcohol Testing</span>
                </div>
                <Badge className="bg-amber-600">Action Required</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-slate-900">Insurance Documentation</span>
                </div>
                <Badge className="bg-emerald-600">Complete</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}