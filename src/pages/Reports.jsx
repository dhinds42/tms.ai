import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  DollarSign,
  Fuel,
  TrendingUp,
  Map,
  BarChart2,
  Download
} from "lucide-react";
import { PageHeader, StandardTabs } from "@/components/design-system";

import LoadReports from "../components/reports/LoadReports";
import CommissionsReport from "../components/reports/CommissionsReport";
import IFTAReport from "../components/reports/IFTAReport";
import KPIReport from "../components/reports/KPIReport";
import LaneReport from "../components/reports/LaneReport";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("loads");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const { data: loads, isLoading: loadsLoading } = useScopedEntity('Load', { limit: 500 });
  const { data: drivers, isLoading: driversLoading } = useScopedEntity('Driver', { limit: 200 });
  const { data: carriers, isLoading: carriersLoading } = useScopedEntity('Carrier', { limit: 200 });
  const { data: shippers, isLoading: shippersLoading } = useScopedEntity('Shipper', { limit: 200 });
  const { data: ownerOperators } = useScopedEntity('OwnerOperator', { limit: 100 });

  const isLoading = loadsLoading || driversLoading || carriersLoading || shippersLoading;

  // Calculate quick stats
  const totalRevenue = loads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const totalMargin = loads.reduce((sum, l) => sum + (l.margin || 0), 0);
  const completedLoads = loads.filter(l => l.status === 'delivered').length;
  const avgMargin = loads.length > 0 ? totalMargin / loads.length : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Reports"
        subtitle="Comprehensive reporting for loads, KPIs, and lanes"
        icon={FileText}
        secondaryActions={[
          { label: 'Export', icon: Download, onClick: () => alert('Export coming soon') }
        ]}
        modeBadge={operatingMode.toUpperCase()}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">${(totalRevenue / 1000).toFixed(1)}K</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Margin</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">${(totalMargin / 1000).toFixed(1)}K</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Completed Loads</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{completedLoads}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Margin</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">${avgMargin.toFixed(0)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
                  <BarChart2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Tabs */}
        <StandardTabs
          tabs={[
            { key: 'loads', label: 'Loads', icon: FileText },
            { key: 'commissions', label: 'Commissions', icon: DollarSign },
            ...(operatingMode === 'carrier' ? [{ key: 'ifta', label: 'IFTA', icon: Fuel }] : []),
            { key: 'kpi', label: 'KPI', icon: TrendingUp },
            { key: 'lanes', label: 'Lanes', icon: Map }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden"></TabsList>

          {/* Load Reports Tab */}
          <TabsContent value="loads">
            <LoadReports 
              loads={loads} 
              isLoading={isLoading}
              operatingMode={operatingMode}
              drivers={drivers}
              carriers={carriers}
              shippers={shippers}
            />
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions">
            <CommissionsReport 
              loads={loads}
              drivers={drivers}
              ownerOperators={ownerOperators}
              isLoading={isLoading}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* IFTA Tab (Carrier Only) */}
          {operatingMode === 'carrier' && (
            <TabsContent value="ifta">
              <IFTAReport 
                loads={loads}
                drivers={drivers}
                ownerOperators={ownerOperators}
                isLoading={isLoading}
              />
            </TabsContent>
          )}

          {/* KPI Report Tab */}
          <TabsContent value="kpi">
            <KPIReport 
              loads={loads}
              drivers={drivers}
              carriers={carriers}
              shippers={shippers}
              isLoading={isLoading}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Lane Report Tab */}
          <TabsContent value="lanes">
            <LaneReport 
              loads={loads}
              isLoading={isLoading}
              operatingMode={operatingMode}
            />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}