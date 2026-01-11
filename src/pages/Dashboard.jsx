import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrgQueryKey } from "@/components/hooks/useOrgQueryKey";
import { scopedList } from "@/components/api/scopedEntities";
import { useCurrentOrgId } from "@/components/hooks/useCurrentOrg";
import { useCurrentUser } from "@/components/hooks/useCurrentUser";
import { useScopedEntity } from "@/components/shared/hooks/useScopedEntity";
import PredictiveCapacityCrunch from "../components/capacity/PredictiveCapacityCrunch";
import DocumentExpirationCascade from "../components/compliance/DocumentExpirationCascade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, DollarSign, Package, TrendingUp, AlertTriangle, CheckCircle2, Zap, LayoutDashboard, Plus, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import PageHeader from "../components/design-system/PageHeader";
import { SkeletonCard } from "../components/design-system/SkeletonLoader";

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
  const orgId = useCurrentOrgId();
  const loadsKey = useOrgQueryKey('loads');
  const complianceKey = useOrgQueryKey('compliance');
  const quotesKey = useOrgQueryKey('quotes');

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: loadsKey,
    queryFn: () => scopedList(base44.entities.Load, orgId, { sort: '-created_date', limit: 100 }),
    initialData: [],
  });

  const { data: complianceItems, isLoading: complianceLoading } = useQuery({
    queryKey: complianceKey,
    queryFn: () => scopedList(base44.entities.ComplianceItem, orgId, { sort: '-created_date', limit: 50 }),
    initialData: [],
  });

  const { data: quotes } = useQuery({
    queryKey: quotesKey,
    queryFn: () => scopedList(base44.entities.Quote, orgId, { sort: '-created_date', limit: 100 }),
    initialData: [],
  });

  // Calculate KPIs with null guards
  const activeLoads = loads?.filter(l => ['assigned', 'dispatched', 'picked_up', 'in_transit'].includes(l.status)) || [];
  const deliveredLoads = loads?.filter(l => l.status === 'delivered') || [];
  const totalRevenue = loads?.reduce((sum, load) => sum + (load.customer_rate || 0), 0) || 0;
  const totalMargin = loads?.reduce((sum, load) => sum + (load.margin || 0), 0) || 0;
  const avgMargin = loads?.length > 0 ? (totalMargin / loads.length).toFixed(2) : 0;

  const urgentCompliance = complianceItems?.filter(item => 
    item.status === 'expired' || item.status === 'expiring_soon'
  ) || [];

  const pendingQuotes = quotes?.filter(q => q.status === 'pending').length || 0;

  return (
    <div style={{ backgroundColor: 'var(--bg-default)' }} className="min-h-screen">
      <PageHeader
        title="Dashboard"
        subtitle={`${operatingMode === 'carrier' ? 'Carrier Operations' : 'Brokerage Operations'} overview`}
        icon={LayoutDashboard}
        primaryAction={{
          label: 'Create Load',
          icon: Plus,
          onClick: () => window.location.href = createPageUrl("LoadBoard")
        }}
        secondaryActions={[
          { label: 'Spot Quote', onClick: () => window.location.href = createPageUrl("QuoteManagement"), icon: Zap }
        ]}
        modeBadge={operatingMode.toUpperCase()}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

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
            trend={`${loads?.length || 0} total`}
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
        <RecentLoads loads={loads?.slice(0, 10) || []} isLoading={loadsLoading} mode={operatingMode} />
      </div>
    </div>
  );
}