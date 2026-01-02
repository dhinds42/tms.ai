import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  CreditCard
} from "lucide-react";
import { PageHeader, StandardTabs } from "@/components/design-system";

import ARAPReport from "../components/accounting/ARAPReport";
import CommissionsManagement from "../components/accounting/CommissionsManagement";
import InvoicesBills from "../components/accounting/InvoicesBills";
import DriverPay from "../components/accounting/DriverPay";
import QuickBooksSync from "../components/accounting/QuickBooksSync";
import APDashboard from "../components/accounting/APDashboard";
import ARDashboard from "../components/accounting/ARDashboard";
import FactoringManagement from "../components/accounting/FactoringManagement";
import GLReport from "../components/accounting/GLReport";
import PaymentProcessing from "../components/accounting/PaymentProcessing";
import CreditManagement from "../components/accounting/CreditManagement";
import BulkPayments from "../components/accounting/BulkPayments";

export default function Accounting() {
  const [activeTab, setActiveTab] = useState("overview");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 500),
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

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 200),
    initialData: [],
  });

  // Calculate key metrics
  const totalAR = loads.reduce((sum, l) => 
    ['delivered', 'invoiced'].includes(l.status) && l.invoice_status !== 'paid' 
      ? sum + (l.customer_rate || 0) 
      : sum, 0
  );

  const totalAP = loads.reduce((sum, l) => 
    l.status === 'delivered' && !l.carrier_paid 
      ? sum + (l.carrier_pay || 0) 
      : sum, 0
  );

  const overdueInvoices = loads.filter(l => {
    if (!l.invoice_due_date || l.invoice_status === 'paid') return false;
    return new Date(l.invoice_due_date) < new Date();
  }).length;

  const unpaidBills = loads.filter(l => 
    l.status === 'delivered' && !l.carrier_paid
  ).length;

  const quickbooksConnected = localStorage.getItem('quickbooks_connected') === 'true';

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Accounting"
        subtitle="AR/AP, invoicing, payments, and financial reporting"
        icon={CreditCard}
        secondaryActions={[
          { label: 'Export Reports', icon: Download, onClick: () => alert('Export coming soon') }
        ]}
        modeBadge={operatingMode.toUpperCase()}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {quickbooksConnected && (
          <Card className="border border-emerald-200 bg-emerald-50">
            <CardContent className="p-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-800 font-medium">QuickBooks Connected</span>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total AR</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    ${(totalAR / 1000).toFixed(1)}K
                  </p>
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
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total AP</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    ${(totalAP / 1000).toFixed(1)}K
                  </p>
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
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Overdue</p>
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
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Unpaid Bills</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{unpaidBills}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <StandardTabs
          tabs={[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'ap', label: 'AP', icon: null },
            { key: 'ar', label: 'AR', icon: null },
            { key: 'invoices', label: 'Invoices', icon: FileText },
            { key: 'payments', label: 'Payments', icon: DollarSign },
            { key: 'commissions', label: 'Commissions', icon: null },
            ...(operatingMode === 'carrier' ? [{ key: 'driverpay', label: 'Driver Pay', icon: null }] : []),
            { key: 'factoring', label: 'Factoring', icon: null },
            { key: 'gl', label: 'GL Report', icon: null },
            { key: 'credit', label: 'Credit', icon: null },
            { key: 'bulk', label: 'Bulk', icon: null },
            { key: 'quickbooks', label: 'QuickBooks', icon: null }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden">
          <TabsList className="hidden"></TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <ARAPReport 
              loads={loads}
              carriers={carriers}
              shippers={shippers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Accounts Payable Tab */}
          <TabsContent value="ap">
            <APDashboard 
              loads={loads}
              carriers={carriers}
              drivers={drivers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Accounts Receivable Tab */}
          <TabsContent value="ar">
            <ARDashboard 
              loads={loads}
              shippers={shippers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Invoices & Bills Tab */}
          <TabsContent value="invoices">
            <InvoicesBills 
              loads={loads}
              shippers={shippers}
              carriers={carriers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Payment Processing Tab */}
          <TabsContent value="payments">
            <PaymentProcessing 
              loads={loads}
              shippers={shippers}
              carriers={carriers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions">
            <CommissionsManagement 
              loads={loads}
              drivers={drivers}
              carriers={carriers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Driver Pay Tab (Carrier Only) */}
          {operatingMode === 'carrier' && (
            <TabsContent value="driverpay">
              <DriverPay 
                drivers={drivers}
                loads={loads}
                operatingMode={operatingMode}
              />
            </TabsContent>
          )}

          {/* Factoring Tab */}
          <TabsContent value="factoring">
            <FactoringManagement 
              loads={loads}
              shippers={shippers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* GL Reporting Tab */}
          <TabsContent value="gl">
            <GLReport 
              loads={loads}
              shippers={shippers}
              carriers={carriers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Credit & Collections Tab */}
          <TabsContent value="credit">
            <CreditManagement 
              loads={loads}
              shippers={shippers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Bulk Payments Tab */}
          <TabsContent value="bulk">
            <BulkPayments 
              loads={loads}
              carriers={carriers}
              drivers={drivers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* QuickBooks Tab */}
          <TabsContent value="quickbooks">
            <QuickBooksSync 
              loads={loads}
              shippers={shippers}
              carriers={carriers}
              operatingMode={operatingMode}
            />
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}