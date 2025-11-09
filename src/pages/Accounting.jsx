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
  TrendingUp,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Plus
} from "lucide-react";

import ARAPReport from "../components/accounting/ARAPReport";
import CommissionsManagement from "../components/accounting/CommissionsManagement";
import InvoicesBills from "../components/accounting/InvoicesBills";
import DriverPay from "../components/accounting/DriverPay";
import QuickBooksSync from "../components/accounting/QuickBooksSync";
import APDashboard from "../components/accounting/APDashboard";
import ARDashboard from "../components/accounting/ARDashboard";
import FactoringManagement from "../components/accounting/FactoringManagement";
import GLReport from "../components/accounting/GLReport";
import BillsProcessing from "../components/accounting/BillsProcessing";
import InvoiceProcessing from "../components/accounting/InvoiceProcessing";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent">
              Accounting Center
            </h1>
            <p className="text-slate-600 mt-2">
              Complete AR/AP management, invoicing, payments, and financial reporting
            </p>
          </div>
          <div className="flex items-center gap-3">
            {quickbooksConnected && (
              <Badge className="bg-emerald-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                QuickBooks Connected
              </Badge>
            )}
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ap">Accounts Payable</TabsTrigger>
            <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
            <TabsTrigger value="invoices">Invoices & Bills</TabsTrigger>
            <TabsTrigger value="payments">Payment Processing</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            {operatingMode === 'carrier' && <TabsTrigger value="driverpay">Driver Pay</TabsTrigger>}
            <TabsTrigger value="factoring">Factoring</TabsTrigger>
            <TabsTrigger value="gl">GL Reporting</TabsTrigger>
            <TabsTrigger value="credit">Credit & Collections</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Payments</TabsTrigger>
            <TabsTrigger value="quickbooks">QuickBooks</TabsTrigger>
          </TabsList>

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