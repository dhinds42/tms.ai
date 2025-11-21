import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Lock,
  History,
  FileText
} from "lucide-react";

import LaneRateForm from "../components/lane-rates/LaneRateForm";
import LaneRateTable from "../components/lane-rates/LaneRateTable";
import ComplianceDashboard from "../components/lane-rates/ComplianceDashboard";
import AuditLogViewer from "../components/lane-rates/AuditLogViewer";
import MarginAnalysis from "../components/lane-rates/MarginAnalysis";

export default function LaneRateManagement() {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("rates");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: laneRates, isLoading } = useQuery({
    queryKey: ['laneRates'],
    queryFn: () => base44.entities.LaneRate.list('-created_date', 200),
    initialData: [],
  });

  const { data: history } = useQuery({
    queryKey: ['laneRateHistory'],
    queryFn: () => base44.entities.LaneRateHistory.list('-timestamp', 100),
    initialData: [],
  });

  // Check if user is broker (admin role)
  const isBroker = user?.role === 'admin';

  // Stats
  const activeRates = laneRates.filter(r => r.status === 'active').length;
  const pendingApproval = laneRates.filter(r => !r.compliance_approved).length;
  const flaggedRates = laneRates.filter(r => r.flagged).length;
  const avgMargin = laneRates.reduce((sum, r) => sum + (r.margin_percentage || 0), 0) / laneRates.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Lane Rate Management
            </h1>
            <p className="text-slate-600 mt-2">TMS-A: Core Internal Rate Management System</p>
            {isBroker && (
              <Badge className="mt-2 bg-purple-600">Broker Access - Full Visibility</Badge>
            )}
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-indigo-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Lane Rate
          </Button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Active Lanes</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{activeRates}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending Approval</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingApproval}</p>
                </div>
                <Lock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Flagged</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{flaggedRates}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Avg Margin</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{avgMargin.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lane Rate Form */}
        {showForm && (
          <LaneRateForm onClose={() => setShowForm(false)} isBroker={isBroker} />
        )}

        {/* Main Tabs */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="rates">Lane Rates</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="margin">Margin Analysis</TabsTrigger>
                <TabsTrigger value="audit">Audit Log</TabsTrigger>
                <TabsTrigger value="sync">TMS-B Sync</TabsTrigger>
              </TabsList>

              <TabsContent value="rates">
                <LaneRateTable laneRates={laneRates} isBroker={isBroker} />
              </TabsContent>

              <TabsContent value="compliance">
                <ComplianceDashboard laneRates={laneRates} />
              </TabsContent>

              <TabsContent value="margin">
                <MarginAnalysis laneRates={laneRates} isBroker={isBroker} />
              </TabsContent>

              <TabsContent value="audit">
                <AuditLogViewer history={history} />
              </TabsContent>

              <TabsContent value="sync">
                <div className="space-y-4">
                  <Card className="border border-indigo-200 bg-indigo-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-8 h-8 text-indigo-600" />
                        <div>
                          <h3 className="font-bold text-indigo-900">TMS-B Sync Status</h3>
                          <p className="text-sm text-indigo-700">Driver-facing system synchronization</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-indigo-700">Synced Rates</p>
                          <p className="text-2xl font-bold text-indigo-900">
                            {laneRates.filter(r => r.synced_to_tms_b).length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-indigo-700">Pending Sync</p>
                          <p className="text-2xl font-bold text-amber-600">
                            {laneRates.filter(r => !r.synced_to_tms_b && r.compliance_approved).length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}