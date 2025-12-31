import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PredictiveCapacityCrunch from "../components/capacity/PredictiveCapacityCrunch";
import DocumentExpirationCascade from "../components/compliance/DocumentExpirationCascade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, DollarSign, Package, TrendingUp, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button"; // Added for the new alert section

import KPICard from "../components/dashboard/KPICard";
import LoadStatusChart from "../components/dashboard/LoadStatusChart";
import RecentLoads from "../components/dashboard/RecentLoads";
import ComplianceAlerts from "../components/dashboard/ComplianceAlerts";
import RealTimeMetrics from "../components/analytics/RealTimeMetrics";

export default function Dashboard() {
  const [operatingMode, setOperatingMode] = useState(
    localStorage.getItem('tms_operating_mode') || 'broker'
  );
  const [showSpotQuoteModal, setShowSpotQuoteModal] = useState(false);

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: complianceItems, isLoading: complianceLoading } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.ComplianceItem.list('-created_date', 50),
    initialData: [],
  });

  const { data: quotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date', 100),
    initialData: [],
  });

  // Calculate KPIs
  const activeLoads = loads.filter(l => ['assigned', 'dispatched', 'picked_up', 'in_transit'].includes(l.status));
  const deliveredLoads = loads.filter(l => l.status === 'delivered');
  const totalRevenue = loads.reduce((sum, load) => sum + (load.customer_rate || 0), 0);
  const totalMargin = loads.reduce((sum, load) => sum + (load.margin || 0), 0);
  const avgMargin = loads.length > 0 ? (totalMargin / loads.length).toFixed(2) : 0;

  const urgentCompliance = complianceItems.filter(item => 
    item.status === 'expired' || item.status === 'expiring_soon'
  );

  const pendingQuotes = quotes.filter(q => q.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Command Center
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              {operatingMode === 'carrier' ? 'Carrier Operations' : 'Brokerage Operations'} Dashboard
            </p>
          </div>
          <div className="flex gap-2">
            <Link 
              to={createPageUrl("LoadBoard")} 
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 text-sm"
            >
              + New Load
            </Link>
            <Link 
              to={createPageUrl("QuoteManagement")} 
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <Zap className="w-4 h-4" />
              Spot Quote
            </Link>
          </div>
        </div>

        {/* Pending Quotes Alert */}
        {pendingQuotes > 0 && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-blue-900">
                  {pendingQuotes} Spot Quote{pendingQuotes > 1 ? 's' : ''} Awaiting Approval
                </p>
                <p className="text-sm text-blue-700">Review and assign to carriers to create loads</p>
              </div>
            </div>
            <Link to={createPageUrl("QuoteManagement")}>
              <Button className="bg-blue-600 text-white">
                Review Quotes
              </Button>
            </Link>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Active Loads"
            value={activeLoads.length}
            icon={Truck}
            trend="+12% this week"
            trendUp={true}
            gradient="from-blue-500 to-cyan-500"
          />
          <KPICard
            title={operatingMode === 'broker' ? 'Total Revenue' : 'Total Earnings'}
            value={`$${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend="+8% this month"
            trendUp={true}
            gradient="from-emerald-500 to-green-500"
          />
          <KPICard
            title="Completed Loads"
            value={deliveredLoads.length}
            icon={Package}
            trend={`${loads.length} total`}
            trendUp={true}
            gradient="from-purple-500 to-pink-500"
          />
          <KPICard
            title={operatingMode === 'broker' ? 'Avg Margin' : 'Avg Rate/Mile'}
            value={operatingMode === 'broker' ? `$${avgMargin}` : `$2.45`}
            icon={TrendingUp}
            trend="Above target"
            trendUp={true}
            gradient="from-orange-500 to-amber-500"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LoadStatusChart loads={loads} isLoading={loadsLoading} />
          </div>
          <div>
            <ComplianceAlerts items={urgentCompliance} isLoading={complianceLoading} />
          </div>
        </div>

        {/* Recent Loads */}
        <RecentLoads loads={loads.slice(0, 10)} isLoading={loadsLoading} mode={operatingMode} />

      </div>
    </div>
  );
}