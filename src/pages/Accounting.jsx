import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

import ARAPReport from "../components/accounting/ARAPReport";
import CommissionsManagement from "../components/accounting/CommissionsManagement";
import InvoicesBills from "../components/accounting/InvoicesBills";
import DriverPay from "../components/accounting/DriverPay";
import QuickBooksSync from "../components/accounting/QuickBooksSync";

export default function Accounting() {
  const [activeTab, setActiveTab] = useState("arap");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [qbConnected, setQbConnected] = useState(
    localStorage.getItem('quickbooks_connected') === 'true'
  );
  const [lastSync, setLastSync] = useState(
    localStorage.getItem('quickbooks_last_sync') || null
  );

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

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 200),
    initialData: [],
  });

  const { data: shippers } = useQuery({
    queryKey: ['shippers'],
    queryFn: () => base44.entities.Shipper.list('-created_date', 200),
    initialData: [],
  });

  const { data: ownerOperators } = useQuery({
    queryKey: ['owner-operators'],
    queryFn: () => base44.entities.OwnerOperator.list('-created_date', 100),
    initialData: [],
  });

  const isLoading = loadsLoading || driversLoading;

  // Calculate accounting metrics
  const invoicedLoads = loads.filter(l => l.invoice_status && l.invoice_status !== 'pending');
  const totalAR = invoicedLoads.reduce((sum, l) => {
    if (['sent', 'partial', 'overdue'].includes(l.invoice_status)) {
      return sum + (l.customer_rate || 0);
    }
    return sum;
  }, 0);

  const totalAP = loads.filter(l => l.status === 'delivered').reduce((sum, l) => {
    return sum + (l.carrier_pay || 0);
  }, 0);

  const overdueInvoices = invoicedLoads.filter(l => {
    if (l.invoice_status !== 'overdue') return false;
    if (!l.invoice_due_date) return false;
    return new Date(l.invoice_due_date) < new Date();
  }).length;

  const unpaidDrivers = drivers.filter(d => d.total_loads > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent">
              Accounting Center
            </h1>
            <p className="text-slate-600 mt-2">
              Complete accounting management with QuickBooks integration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={qbConnected ? "bg-emerald-600" : "bg-slate-400"}>
              {qbConnected ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  QuickBooks Connected
                </>
              ) : (
                "QuickBooks Not Connected"
              )}
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2">
              {operatingMode === 'carrier' ? 'Carrier Mode' : 'Broker Mode'}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Accounts Receivable</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">${(totalAR / 1000).toFixed(1)}K</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Accounts Payable</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">${(totalAP / 1000).toFixed(1)}K</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Overdue Invoices</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{overdueInvoices}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    {operatingMode === 'carrier' ? 'Unpaid Drivers' : 'Open Invoices'}
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {operatingMode === 'carrier' ? unpaidDrivers : invoicedLoads.length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QuickBooks Sync Status */}
        {qbConnected && lastSync && (
          <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-l-emerald-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-emerald-900">QuickBooks Synchronized</h3>
                    <p className="text-sm text-emerald-700">
                      Last sync: {new Date(lastSync).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-emerald-300">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accounting Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="arap" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              AR/AP Report
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Invoices & Bills
            </TabsTrigger>
            <TabsTrigger value="commissions" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Commissions Mgmt
            </TabsTrigger>
            {operatingMode === 'carrier' && (
              <TabsTrigger value="driverpay" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Driver Pay
                <Badge className="bg-blue-100 text-blue-800 text-xs">Carrier</Badge>
              </TabsTrigger>
            )}
            <TabsTrigger value="quickbooks" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              QuickBooks
            </TabsTrigger>
          </TabsList>

          {/* AR/AP Report Tab */}
          <TabsContent value="arap">
            <ARAPReport 
              loads={loads}
              shippers={shippers}
              carriers={carriers}
              isLoading={isLoading}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Invoices & Bills Tab */}
          <TabsContent value="invoices">
            <InvoicesBills 
              loads={loads}
              shippers={shippers}
              carriers={carriers}
              isLoading={isLoading}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Commissions Management Tab */}
          <TabsContent value="commissions">
            <CommissionsManagement 
              loads={loads}
              drivers={drivers}
              ownerOperators={ownerOperators}
              carriers={carriers}
              isLoading={isLoading}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Driver Pay Tab (Carrier Only) */}
          {operatingMode === 'carrier' && (
            <TabsContent value="driverpay">
              <DriverPay 
                loads={loads}
                drivers={drivers}
                ownerOperators={ownerOperators}
                isLoading={isLoading}
              />
            </TabsContent>
          )}

          {/* QuickBooks Tab */}
          <TabsContent value="quickbooks">
            <QuickBooksSync 
              loads={loads}
              shippers={shippers}
              carriers={carriers}
              qbConnected={qbConnected}
              setQbConnected={setQbConnected}
              lastSync={lastSync}
              setLastSync={setLastSync}
              operatingMode={operatingMode}
            />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}