import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Clock, FileText, Plus, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, StandardTabs, StatusBadge } from "@/components/design-system";

import ComplianceChecklist from "../components/compliance/ComplianceChecklist";
import ComplianceTimeline from "../components/compliance/ComplianceTimeline";
import AddComplianceModal from "../components/compliance/AddComplianceModal";

export default function Compliance() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const queryClient = useQueryClient();

  const { data: complianceItems, isLoading } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.ComplianceItem.list('-expiration_date', 100),
    initialData: [],
  });

  const createComplianceMutation = useMutation({
    mutationFn: (data) => base44.entities.ComplianceItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
      setShowAddModal(false);
    },
  });

  const updateComplianceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ComplianceItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
    },
  });

  const filteredItems = statusFilter === "all" 
    ? complianceItems 
    : complianceItems.filter(item => item.status === statusFilter);

  const statusCounts = {
    all: complianceItems.length,
    current: complianceItems.filter(i => i.status === 'current').length,
    expiring_soon: complianceItems.filter(i => i.status === 'expiring_soon').length,
    expired: complianceItems.filter(i => i.status === 'expired').length,
    missing: complianceItems.filter(i => i.status === 'missing').length
  };

  const overallScore = complianceItems.length > 0
    ? ((statusCounts.current / complianceItems.length) * 100).toFixed(0)
    : 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Compliance"
        subtitle="Monitor FMCSA, insurance, and regulatory compliance"
        icon={Shield}
        primaryAction={{
          label: 'Add Item',
          icon: Plus,
          onClick: () => setShowAddModal(true)
        }}
        secondaryActions={[
          { label: 'Export Report', icon: Download, onClick: () => alert('Export coming soon') }
        ]}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Score Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">{overallScore}%</div>
                      <div className="text-xs text-slate-500">Compliant</div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900">Overall Compliance Score</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-slate-600">
                        {statusCounts.current} Current
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-slate-600">
                        {statusCounts.expiring_soon} Expiring Soon
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-slate-600">
                        {statusCounts.expired} Expired
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-emerald-600 text-white text-sm px-4 py-2">
                  <FileText className="w-4 h-4 mr-2" />
                  {complianceItems.length} Items Tracked
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <StandardTabs
              tabs={[
                { key: 'all', label: `All (${statusCounts.all})`, icon: Shield },
                { key: 'current', label: `Current (${statusCounts.current})`, icon: CheckCircle },
                { key: 'expiring_soon', label: `Expiring Soon (${statusCounts.expiring_soon})`, icon: Clock },
                { key: 'expired', label: `Expired (${statusCounts.expired})`, icon: AlertTriangle },
                { key: 'missing', label: `Missing (${statusCounts.missing})`, icon: FileText }
              ]}
              activeTab={statusFilter}
              onTabChange={setStatusFilter}
            />
            
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="hidden">
              <TabsList className="hidden"></TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Compliance Checklist */}
        <ComplianceChecklist 
          items={filteredItems} 
          isLoading={isLoading}
          onUpdateItem={(id, data) => updateComplianceMutation.mutate({ id, data })}
        />

        {/* Timeline */}
        <ComplianceTimeline items={complianceItems} isLoading={isLoading} />

        {/* Add Modal */}
        {showAddModal && (
          <AddComplianceModal
            onSave={(data) => createComplianceMutation.mutate(data)}
            onClose={() => setShowAddModal(false)}
            isLoading={createComplianceMutation.isPending}
          />
        )}

      </div>
    </div>
  );
}