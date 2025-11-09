import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, Users, DollarSign, Check } from "lucide-react";

export default function DriverPay({ loads, drivers, ownerOperators, isLoading }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentRun, setPaymentRun] = useState(null);

  // Filter delivered loads
  const deliveredLoads = loads.filter(load => {
    if (load.status !== 'delivered') return false;
    
    const loadDate = new Date(load.actual_delivery || load.delivery_date || load.created_date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    return (!start || loadDate >= start) && (!end || loadDate <= end);
  });

  // Calculate driver pay
  const driverPayData = {};
  const allDrivers = [...drivers, ...ownerOperators];

  deliveredLoads.forEach(load => {
    if (!load.driver_id) return;

    const driver = allDrivers.find(d => d.id === load.driver_id);
    if (!driver) return;

    const revenue = load.customer_rate || 0;
    let pay = 0;

    if (driver.payment_structure === 'percentage') {
      pay = revenue * ((driver.payment_rate || 0) / 100);
    } else if (driver.payment_structure === 'per_mile') {
      pay = (load.distance_miles || 0) * (driver.payment_rate || 0);
    } else if (driver.payment_structure === 'per_load') {
      pay = driver.payment_rate || 0;
    }

    if (!driverPayData[driver.id]) {
      driverPayData[driver.id] = {
        id: driver.id,
        name: driver.full_name || driver.company_name,
        type: driver.hasOwnProperty('lease_agreement_date') ? 'Owner Operator' : 'Company Driver',
        loads: [],
        totalLoads: 0,
        totalMiles: 0,
        totalPay: 0,
        payment_structure: driver.payment_structure,
        payment_rate: driver.payment_rate
      };
    }

    driverPayData[driver.id].loads.push({
      load_id: load.id,
      load_number: load.load_number || load.id.slice(0, 8),
      date: load.actual_delivery || load.delivery_date,
      miles: load.distance_miles || 0,
      revenue,
      pay
    });
    driverPayData[driver.id].totalLoads += 1;
    driverPayData[driver.id].totalMiles += load.distance_miles || 0;
    driverPayData[driver.id].totalPay += pay;
  });

  const payList = Object.values(driverPayData).sort((a, b) => b.totalPay - a.totalPay);
  const totalPayroll = payList.reduce((sum, d) => sum + d.totalPay, 0);

  // Generate payment run
  const handleGeneratePayRun = () => {
    setPaymentRun({
      date: new Date().toISOString(),
      period: `${startDate} to ${endDate}`,
      drivers: payList,
      total: totalPayroll
    });
    alert('Payment run generated successfully');
  };

  // Export
  const handleExport = () => {
    const headers = ['Driver', 'Type', 'Loads', 'Miles', 'Payment Structure', 'Rate', 'Total Pay'];
    const rows = payList.map(d => [
      d.name,
      d.type,
      d.totalLoads,
      d.totalMiles,
      d.payment_structure,
      d.payment_rate,
      d.totalPay.toFixed(2)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
      '',
      `TOTAL,,,,,${totalPayroll.toFixed(2)}`
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `driver-pay-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* Period Selection */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Pay Period</CardTitle>
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
            <div className="flex items-end">
              <Button onClick={handleGeneratePayRun} className="w-full bg-blue-600 text-white">
                <Check className="w-4 h-4 mr-2" />
                Generate Pay Run
              </Button>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total Payroll</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">${totalPayroll.toLocaleString()}</p>
            <Badge className="mt-3 bg-blue-100 text-blue-800">{deliveredLoads.length} loads</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Drivers</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{payList.length}</p>
            <Badge className="mt-3 bg-purple-100 text-purple-800">Active</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Avg Pay/Driver</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              ${payList.length > 0 ? (totalPayroll / payList.length).toFixed(0) : 0}
            </p>
            <Badge className="mt-3 bg-emerald-100 text-emerald-800">Per Period</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Driver Pay List */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Driver Pay Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payList.map((driver) => (
              <div key={driver.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{driver.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={
                        driver.type === 'Owner Operator' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }>
                        {driver.type}
                      </Badge>
                      <p className="text-sm text-slate-600">
                        {driver.payment_structure === 'percentage' ? `${driver.payment_rate}% of revenue` :
                         driver.payment_structure === 'per_mile' ? `$${driver.payment_rate}/mile` :
                         `$${driver.payment_rate}/load`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">${driver.totalPay.toLocaleString()}</p>
                    <p className="text-sm text-slate-600 mt-1">{driver.totalLoads} loads • {driver.totalMiles} miles</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">Loads</p>
                    <p className="text-lg font-bold text-slate-900">{driver.totalLoads}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">Miles</p>
                    <p className="text-lg font-bold text-slate-900">{driver.totalMiles.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">Avg/Load</p>
                    <p className="text-lg font-bold text-slate-900">
                      ${driver.totalLoads > 0 ? (driver.totalPay / driver.totalLoads).toFixed(0) : 0}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">$/Mile</p>
                    <p className="text-lg font-bold text-slate-900">
                      ${driver.totalMiles > 0 ? (driver.totalPay / driver.totalMiles).toFixed(2) : 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {payList.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No driver pay for selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}