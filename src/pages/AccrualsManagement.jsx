import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useOrgQueryKey } from "@/components/hooks/useOrgQueryKey";
import { scopedList } from "@/components/api/scopedEntities";
import { useCurrentOrgId } from "@/components/hooks/useCurrentOrg";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader, EmptyState, FormField, SkeletonCard } from "@/components/design-system";
import {
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  RefreshCw,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AccrualsManagement() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const orgId = useCurrentOrgId();
  const accrualsKey = useOrgQueryKey('accruals');
  const loadsKey = useOrgQueryKey('loads');

  const { data: accruals } = useQuery({
    queryKey: accrualsKey,
    queryFn: () => scopedList(base44.entities.AccrualEntry, orgId, { sort: '-created_date', limit: 500 }),
    initialData: [],
  });

  const { data: loads } = useQuery({
    queryKey: loadsKey,
    queryFn: () => scopedList(base44.entities.Load, orgId, { sort: '-created_date', limit: 200 }),
    initialData: [],
  });

  const filteredAccruals = accruals.filter(a => {
    const statusMatch = filterStatus === 'all' || a.accrual_status === filterStatus;
    const typeMatch = filterType === 'all' || a.accrual_type === filterType;
    const dateMatch = new Date(a.created_date) >= new Date(dateRange.start) && 
                      new Date(a.created_date) <= new Date(dateRange.end);
    return statusMatch && typeMatch && dateMatch;
  });

  const openAccruals = accruals.filter(a => a.accrual_status === 'OPEN');
  const postedAccruals = accruals.filter(a => a.accrual_status === 'POSTED');
  const reversedAccruals = accruals.filter(a => a.accrual_status === 'REVERSED');
  
  const totalOpenAmount = openAccruals.reduce((sum, a) => sum + (a.amount_cents || 0), 0) / 100;
  const totalPostedAmount = postedAccruals.reduce((sum, a) => sum + (a.amount_cents || 0), 0) / 100;

  const handleExport = () => {
    const csv = filteredAccruals.map(a => ({
      load_id: a.load_id,
      type: a.accrual_type,
      amount: (a.amount_cents / 100).toFixed(2),
      status: a.accrual_status,
      event: a.event_basis,
      period: a.accounting_period,
      created: a.created_date
    }));
    
    const headers = Object.keys(csv[0] || {}).join(',');
    const rows = csv.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accruals_${dateRange.start}_${dateRange.end}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Accruals Management"
        subtitle={`Revenue recognition tracking • ${openAccruals.length} open accruals`}
        icon={DollarSign}
        primaryAction={{
          label: 'Export',
          icon: Download,
          onClick: handleExport
        }}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-blue-600">{openAccruals.length}</p>
              <p className="text-xs text-slate-500">Open</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-600">{postedAccruals.length}</p>
              <p className="text-xs text-slate-500">Posted</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-purple-600">${(totalOpenAmount / 1000).toFixed(0)}K</p>
              <p className="text-xs text-slate-500">Open $</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-cyan-600">${(totalPostedAmount / 1000).toFixed(0)}K</p>
              <p className="text-xs text-slate-500">Posted $</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <FormField label="Status">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="POSTED">Posted</SelectItem>
                    <SelectItem value="REVERSED">Reversed</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Type">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="AR_REVENUE">AR Revenue</SelectItem>
                    <SelectItem value="AP_CARRIER_COST">AP Carrier Cost</SelectItem>
                    <SelectItem value="ACCESSORIAL_ESTIMATE">Accessorial</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Start Date">
                <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
              </FormField>
              <FormField label="End Date">
                <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Accruals List */}
        <Card>
          <CardHeader>
            <CardTitle>Accrual Entries ({filteredAccruals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAccruals.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No accruals found"
                description="Accruals are generated automatically on load events"
              />
            ) : (
              <div className="space-y-2">
                {filteredAccruals.map(accrual => (
                  <div key={accrual.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={
                            accrual.accrual_status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                            accrual.accrual_status === 'POSTED' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-100 text-slate-800'
                          }>
                            {accrual.accrual_status}
                          </Badge>
                          <Badge variant="outline">{accrual.accrual_type}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">Load: {accrual.load_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">${((accrual.amount_cents || 0) / 100).toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{accrual.event_basis}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Period: {accrual.accounting_period || 'N/A'}</span>
                      <span>Created: {new Date(accrual.created_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}