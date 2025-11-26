import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  DollarSign,
  Fuel,
  TrendingUp,
  Map,
  BarChart2
} from "lucide-react";

import LoadReports from "../components/reports/LoadReports";
import CommissionsReport from "../components/reports/CommissionsReport";
import IFTAReport from "../components/reports/IFTAReport";
import KPIReport from "../components/reports/KPIReport";
import LaneReport from "../components/reports/LaneReport";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("loads");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 500),
    initialData: [],
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 200),
    initialData: [],
  });

  const { data: carriers, isLoading: carriersLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 200),
    initialData: [],
  });

  const { data: shippers, isLoading: shippersLoading } = useQuery({
    queryKey: ['shippers'],
    queryFn: () => base44.entities.Shipper.list('-created_date', 200),
    initialData: [],
  });

  const { data: ownerOperators } = useQuery({
    queryKey: ['owner-operators'],
    queryFn: () => base44.entities.OwnerOperator.list('-created_date', 100),
    initialData: [],
  });

  const isLoading = loadsLoading || driversLoading || carriersLoading || shippersLoading;

  // Calculate quick stats
  const totalRevenue = loads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const totalMargin = loads.reduce((sum, l) => sum + (l.margin || 0), 0);
  const completedLoads = loads.filter(l => l.status === 'delivered').length;
  const avgMargin = loads.length > 0 ? totalMargin / loads.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-slate-600 mt-2">
              Comprehensive reporting across loads, commissions, KPIs, and lanes
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 text-sm">
            {operatingMode === 'carrier' ? 'Carrier Mode' : 'Broker Mode'}
          </Badge>
        </div>

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
                  <BarChart className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="loads" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Load Reports
            </TabsTrigger>
            <TabsTrigger value="commissions" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Commissions
            </TabsTrigger>
            {operatingMode === 'carrier' && (
              <TabsTrigger value="ifta" className="flex items-center gap-2">
                <Fuel className="w-4 h-4" />
                IFTA
                <Badge className="bg-amber-100 text-amber-800 text-xs">Carrier Only</Badge>
              </TabsTrigger>
            )}
            <TabsTrigger value="kpi" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              KPI Report
            </TabsTrigger>
            <TabsTrigger value="lanes" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Lane Report
            </TabsTrigger>
          </TabsList>

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