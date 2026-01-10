import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, TrendingUp, Users, Download, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/design-system";

import PayrollSummary from "../components/payroll/PayrollSummary";
import DriverPayStatements from "../components/payroll/DriverPayStatements";
import OwnerOperatorPay from "../components/payroll/OwnerOperatorPay";
import PayrollPeriodSelector from "../components/payroll/PayrollPeriodSelector";

export default function PayrollManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const { data: drivers, isLoading: driversLoading } = useScopedEntity('Driver', { limit: 100 });
  const { data: ownerOperators, isLoading: ooLoading } = useScopedEntity('OwnerOperator', { limit: 100 });
  const { data: loads, isLoading: loadsLoading } = useScopedEntity('Load', { limit: 100 });

  // Calculate payroll data
  const companyDrivers = drivers.filter(d => d.status === 'active');
  const activeOO = ownerOperators.filter(o => o.status === 'active');
  
  // Simplified payroll calculation (in production, this would be more complex)
  const driverPayroll = loads
    .filter(l => l.status === 'delivered' && l.driver_id)
    .reduce((sum, l) => {
      const driver = companyDrivers.find(d => d.id === l.driver_id);
      if (driver) {
        // Assume flat $500 per load for company drivers
        return sum + 500;
      }
      return sum;
    }, 0);

  const ooPayroll = loads
    .filter(l => l.status === 'delivered' && l.driver_id)
    .reduce((sum, l) => {
      const oo = activeOO.find(o => o.id === l.driver_id);
      if (oo && l.carrier_pay) {
        // Owner operators get percentage of load pay
        const rate = oo.payment_rate || 75;
        return sum + (l.carrier_pay * (rate / 100));
      }
      return sum;
    }, 0);

  const totalPayroll = driverPayroll + ooPayroll;

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Payroll Management"
        subtitle={`Driver and owner operator compensation • $${(totalPayroll / 1000).toFixed(1)}K total`}
        icon={DollarSign}
        primaryAction={{
          label: 'Export Report',
          icon: Download,
          onClick: () => alert('Export coming soon')
        }}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Payroll</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">${(totalPayroll / 1000).toFixed(1)}K</p>
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
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Company Drivers</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">${(driverPayroll / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-slate-500 mt-1">{companyDrivers.length} drivers</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Owner Operators</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">${(ooPayroll / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-slate-500 mt-1">{activeOO.length} operators</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pay Period</p>
                  <p className="text-lg font-bold text-slate-900 mt-2">Jan 1-15</p>
                  <p className="text-xs text-slate-500 mt-1">Current period</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Selector */}
        <PayrollPeriodSelector 
          selectedPeriod={selectedPeriod} 
          onPeriodChange={setSelectedPeriod} 
        />

        {/* Payroll Summary */}
        <PayrollSummary 
          drivers={companyDrivers} 
          ownerOperators={activeOO} 
          loads={loads}
          isLoading={driversLoading || ooLoading || loadsLoading}
        />

        {/* Driver Pay Statements */}
        <DriverPayStatements drivers={companyDrivers} loads={loads} />

        {/* Owner Operator Pay */}
        <OwnerOperatorPay ownerOperators={activeOO} loads={loads} />

      </div>
    </div>
  );
}