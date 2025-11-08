import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle, Bell, Shield } from "lucide-react";

export default function AutoComplianceMonitor({ carriers }) {
  const monitoringFeatures = [
    { name: "FMCSA Data Sync", status: "active", description: "Daily sync with FMCSA database" },
    { name: "Insurance Monitoring", status: "active", description: "Auto-alert 30 days before expiration" },
    { name: "Document Expiration Alerts", status: "active", description: "Email notifications to carriers" },
    { name: "Compliance Score Updates", status: "active", description: "Real-time score recalculation" },
    { name: "Auto-Suspension Trigger", status: "ready", description: "Auto-suspend non-compliant carriers" }
  ];

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
      <CardHeader className="border-b border-emerald-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl">
            <Zap className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-xl text-emerald-900">
              Automated Compliance Monitoring
            </CardTitle>
            <p className="text-sm text-emerald-700 mt-1">
              AI continuously monitors all carriers for compliance issues
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-4">
          {monitoringFeatures.map((feature, index) => (
            <div key={index} className="p-4 bg-white rounded-xl border border-emerald-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 text-sm">{feature.name}</h4>
                  <p className="text-xs text-slate-600 mt-1">{feature.description}</p>
                </div>
                <Badge className={`${
                  feature.status === 'active' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-blue-600 text-white'
                } text-xs ml-2`}>
                  {feature.status === 'active' ? (
                    <>
                      <Zap className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready
                    </>
                  )}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-white rounded-xl border border-emerald-300">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-medium text-slate-900">Monitoring {carriers.length} carriers</p>
              <p className="text-sm text-slate-600">Next compliance check in 6 hours</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}