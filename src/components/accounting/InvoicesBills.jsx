import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Send, DollarSign, Clock, CheckCircle } from "lucide-react";

export default function InvoicesBills({ loads, shippers, carriers, isLoading, operatingMode }) {
  const [activeTab, setActiveTab] = useState('invoices');

  // Invoices (AR - money customers owe us)
  const invoiceLoads = loads.filter(l => l.invoice_number || l.invoice_status);
  const pendingInvoices = invoiceLoads.filter(l => l.invoice_status === 'pending');
  const sentInvoices = invoiceLoads.filter(l => l.invoice_status === 'sent');
  const overdueInvoices = invoiceLoads.filter(l => l.invoice_status === 'overdue');
  const paidInvoices = invoiceLoads.filter(l => l.invoice_status === 'paid');

  // Bills (AP - money we owe carriers/drivers)
  const billLoads = loads.filter(l => l.status === 'delivered' && (l.carrier_pay || 0) > 0);
  const unpaidBills = billLoads.filter(l => !l.payment_received_date);
  const paidBills = billLoads.filter(l => l.payment_received_date);

  return (
    <div className="space-y-6 mt-6">
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="invoices">Invoices (AR)</TabsTrigger>
          <TabsTrigger value="bills">Bills (AP)</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          
          {/* Invoice Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">{pendingInvoices.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Send className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Sent</p>
                    <p className="text-2xl font-bold text-blue-600">{sentInvoices.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{overdueInvoices.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Paid</p>
                    <p className="text-2xl font-bold text-emerald-600">{paidInvoices.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice List */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle>Invoice List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="text-left p-3 font-semibold">Invoice #</th>
                      <th className="text-left p-3 font-semibold">Customer</th>
                      <th className="text-left p-3 font-semibold">Load #</th>
                      <th className="text-left p-3 font-semibold">Date</th>
                      <th className="text-left p-3 font-semibold">Due Date</th>
                      <th className="text-right p-3 font-semibold">Amount</th>
                      <th className="text-center p-3 font-semibold">Status</th>
                      <th className="text-center p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceLoads.slice(0, 50).map(load => {
                      const shipper = shippers.find(s => s.id === load.shipper_id);
                      return (
                        <tr key={load.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-mono text-xs">
                            {load.invoice_number || `INV-${load.id.slice(0, 8)}`}
                          </td>
                          <td className="p-3 font-medium">{shipper?.company_name || 'Unknown'}</td>
                          <td className="p-3 font-mono text-xs">{load.load_number || load.id.slice(0, 8)}</td>
                          <td className="p-3">{new Date(load.created_date).toLocaleDateString()}</td>
                          <td className="p-3">
                            {load.invoice_due_date ? new Date(load.invoice_due_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-600">
                            ${(load.customer_rate || 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-center">
                            <Badge className={
                              load.invoice_status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                              load.invoice_status === 'sent' ? 'bg-blue-100 text-blue-800' :
                              load.invoice_status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }>
                              {load.invoice_status || 'pending'}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              {load.invoice_status !== 'paid' && (
                                <>
                                  <Button size="sm" variant="outline">
                                    <Send className="w-3 h-3 mr-1" />
                                    Send
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    View
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* Bills Tab */}
        <TabsContent value="bills" className="space-y-6">
          
          {/* Bill Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Total Bills</p>
                    <p className="text-2xl font-bold text-purple-600">{billLoads.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Unpaid</p>
                    <p className="text-2xl font-bold text-red-600">{unpaidBills.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Paid</p>
                    <p className="text-2xl font-bold text-emerald-600">{paidBills.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bills List */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle>Bills to Pay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="text-left p-3 font-semibold">Carrier/Driver</th>
                      <th className="text-left p-3 font-semibold">Load #</th>
                      <th className="text-left p-3 font-semibold">Delivery Date</th>
                      <th className="text-right p-3 font-semibold">Amount</th>
                      <th className="text-center p-3 font-semibold">Status</th>
                      <th className="text-center p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billLoads.slice(0, 50).map(load => {
                      const carrier = carriers.find(c => c.id === load.carrier_id);
                      return (
                        <tr key={load.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-medium">{carrier?.company_name || 'Unknown'}</td>
                          <td className="p-3 font-mono text-xs">{load.load_number || load.id.slice(0, 8)}</td>
                          <td className="p-3">
                            {load.actual_delivery ? new Date(load.actual_delivery).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-3 text-right font-bold text-red-600">
                            ${(load.carrier_pay || 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-center">
                            <Badge className={
                              load.payment_received_date ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }>
                              {load.payment_received_date ? 'Paid' : 'Unpaid'}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            {!load.payment_received_date && (
                              <Button size="sm" className="bg-emerald-600 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Mark Paid
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

      </Tabs>

    </div>
  );
}