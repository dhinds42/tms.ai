import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, DollarSign, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CommissionsManagement({ loads, drivers, ownerOperators, carriers, isLoading, operatingMode }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const queryClient = useQueryClient();

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Driver.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  // Filter delivered loads
  const deliveredLoads = loads.filter(load => {
    if (load.status !== 'delivered') return false;
    
    const loadDate = new Date(load.actual_delivery || load.delivery_date || load.created_date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    return (!start || loadDate >= start) && (!end || loadDate <= end);
  });

  // Calculate commissions
  const commissionsData = {};
  const allDrivers = operatingMode === 'carrier' ? [...drivers, ...ownerOperators] : carriers;

  deliveredLoads.forEach(load => {
    const resourceId = operatingMode === 'carrier' ? load.driver_id : load.carrier_id;
    if (!resourceId) return;

    const resource = allDrivers.find(d => d.id === resourceId);
    if (!resource) return;

    const revenue = load.customer_rate || 0;
    let commission = 0;

    if (resource.payment_structure === 'percentage') {
      commission = revenue * ((resource.payment_rate || 0) / 100);
    } else if (resource.payment_structure === 'per_mile') {
      commission = (load.distance_miles || 0) * (resource.payment_rate || 0);
    } else if (resource.payment_structure === 'per_load') {
      commission = resource.payment_rate || 0;
    }

    if (!commissionsData[resource.id]) {
      commissionsData[resource.id] = {
        id: resource.id,
        name: resource.full_name || resource.company_name,
        loads: [],
        totalLoads: 0,
        totalRevenue: 0,
        totalCommission: 0,
        payment_structure: resource.payment_structure,
        payment_rate: resource.payment_rate,
        paid: false
      };
    }

    commissionsData[resource.id].loads.push({
      load_id: load.id,
      load_number: load.load_number || load.id.slice(0, 8),
      date: load.actual_delivery || load.delivery_date,
      revenue,
      commission
    });
    commissionsData[resource.id].totalLoads += 1;
    commissionsData[resource.id].totalRevenue += revenue;
    commissionsData[resource.id].totalCommission += commission;
  });

  const commissionsList = Object.values(commissionsData).sort((a, b) => b.totalCommission - a.totalCommission);
  const totalCommissions = commissionsList.reduce((sum, c) => sum + c.totalCommission, 0);
  const paidCommissions = commissionsList.filter(c => c.paid).reduce((sum, c) => sum + c.totalCommission, 0);
  const unpaidCommissions = totalCommissions - paidCommissions;

  // Mark as paid
  const handleMarkPaid = (commissionData) => {
    if (window.confirm(`Mark ${commissionData.name} as paid $${commissionData.totalCommission.toFixed(2)}?`)) {
      commissionData.paid = true;
      // In production, update backend
      alert('Payment marked as processed');
    }
  };

  // Export
  const handleExport = () => {
    const headers = ['Name', 'Loads', 'Revenue', 'Commission', 'Payment Structure', 'Rate', 'Status'];
    const rows = commissionsList.map(c => [
      c.name,
      c.totalLoads,
      c.totalRevenue.toFixed(2),
      c.totalCommission.toFixed(2),
      c.payment_structure,
      c.payment_rate,
      c.paid ? 'Paid' : 'Unpaid'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
      '',
      `TOTAL,${commissionsList.length},${deliveredLoads.length},${totalCommissions.toFixed(2)},,,`
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* Filters */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Commission Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Quick Select</Label>
              <select
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
                onChange={(e) => {
                  const value = e.target.value;
                  const now = new Date();
                  if (value === 'thisWeek') {
                    const start = new Date(now.setDate(now.getDate() - now.getDay()));
                    setStartDate(start.toISOString().split('T')[0]);
                    setEndDate(new Date().toISOString().split('T')[0]);
                  } else if (value === 'lastWeek') {
                    const start = new Date(now.setDate(now.getDate() - now.getDay() - 7));
                    const end = new Date(now.setDate(now.getDate() - now.getDay() - 1));
                    setStartDate(start.toISOString().split('T')[0]);
                    setEndDate(end.toISOString().split('T')[0]);
                  } else if (value === 'thisMonth') {
                    setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
                    setEndDate(new Date().toISOString().split('T')[0]);
                  }
                }}
              >
                <option value="">Select Period</option>
                <option value="thisWeek">This Week</option>
                <option value="lastWeek">Last Week</option>
                <option value="thisMonth">This Month</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleExport} className="w-full bg-emerald-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total Commissions</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">${totalCommissions.toLocaleString()}</p>
            <Badge className="mt-3 bg-emerald-100 text-emerald-800">{deliveredLoads.length} loads</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Paid</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">${paidCommissions.toLocaleString()}</p>
            <Badge className="mt-3 bg-blue-100 text-blue-800">Processed</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Unpaid</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">${unpaidCommissions.toLocaleString()}</p>
            <Badge className="mt-3 bg-amber-100 text-amber-800">Pending</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">
              {operatingMode === 'carrier' ? 'Drivers' : 'Carriers'}
            </p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{commissionsList.length}</p>
            <Badge className="mt-3 bg-purple-100 text-purple-800">Active</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Commissions List */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Commission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commissionsList.map((commission) => (
              <div key={commission.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{commission.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {commission.payment_structure === 'percentage' ? `${commission.payment_rate}% of revenue` :
                       commission.payment_structure === 'per_mile' ? `$${commission.payment_rate}/mile` :
                       `$${commission.payment_rate}/load`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-emerald-600">${commission.totalCommission.toLocaleString()}</p>
                    <p className="text-sm text-slate-600 mt-1">{commission.totalLoads} loads</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">Loads</p>
                    <p className="text-lg font-bold text-slate-900">{commission.totalLoads}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">Revenue</p>
                    <p className="text-lg font-bold text-slate-900">${commission.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">Commission</p>
                    <p className="text-lg font-bold text-emerald-600">${commission.totalCommission.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!commission.paid ? (
                    <Button
                      onClick={() => handleMarkPaid(commission)}
                      className="bg-emerald-600 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Paid
                    </Button>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                      <Check className="w-4 h-4 mr-2" />
                      Paid
                    </Badge>
                  )}
                  <Button variant="outline">
                    View Load Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {commissionsList.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No commissions for selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}