import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/design-system/PageHeader";
import { GitBranch, Play, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

export default function CICDPipeline() {
  const builds = [
    { id: 1, branch: "main", status: "success", duration: "3m 24s", commit: "Fix carrier scoring", tests: 124 },
    { id: 2, branch: "feature/blockchain", status: "running", duration: "2m 15s", commit: "Add blockchain ledger", tests: 98 },
    { id: 3, branch: "fix/rbac", status: "failed", duration: "1m 45s", commit: "Update RBAC hooks", tests: 56 },
  ];

  const statusConfig = {
    success: { icon: CheckCircle2, color: "bg-emerald-500", text: "Success" },
    running: { icon: Clock, color: "bg-blue-500", text: "Running" },
    failed: { icon: XCircle, color: "bg-red-500", text: "Failed" },
    warning: { icon: AlertTriangle, color: "bg-amber-500", text: "Warning" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="CI/CD Pipeline"
        subtitle="Continuous integration and deployment monitoring"
        icon={GitBranch}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-600">94%</div>
              <p className="text-sm text-slate-600 mt-1">Success Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">3m 24s</div>
              <p className="text-sm text-slate-600 mt-1">Avg Build Time</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">1</div>
              <p className="text-sm text-slate-600 mt-1">Running</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">124</div>
              <p className="text-sm text-slate-600 mt-1">Tests Passing</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Builds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {builds.map(build => {
              const StatusIcon = statusConfig[build.status].icon;
              return (
                <div key={build.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`${statusConfig[build.status].color} text-white`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[build.status].text}
                        </Badge>
                        <span className="font-mono text-sm text-slate-600">{build.branch}</span>
                      </div>
                      <p className="text-sm text-slate-900 mb-1">{build.commit}</p>
                      <div className="flex gap-4 text-sm text-slate-500">
                        <span>Duration: {build.duration}</span>
                        <span>Tests: {build.tests} passing</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Logs</Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}