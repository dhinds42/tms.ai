import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Search, 
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Send,
  CreditCard,
  XCircle,
  Download
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ARDashboard({ loads, shippers, operatingMode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("outstanding"); // outstanding, overdue, paid

  // Calculate invoices
  const invoices = loads.filter(l => 
    ['delivered', 'invoiced'].includes(l.status) && l.customer_rate > 0
  ).map(load => ({
    id: load.id,
    load_number: load.load_number || load.id.slice(0, 8),
    shipper_id: load.shipper_id,
    invoice_number: load.invoice_number || `INV-${load.id.slice(0, 8)}`,
    amount: load.customer_rate || 0,
    invoice_date: load.created_date,
    due_date: load.invoice_due_date,
    status: load.invoice_status || 'pending',
    payment_date: load.payment_received_date,
    days_outstanding: load.invoice_due_date ? 
      Math.floor((new Date() - new Date(load.invoice_due_date)) / (1000 * 60 * 60 * 24)) : 
      0
  }));

  const outstandingInvoices = invoices.filter(i => i.status !== 'paid');
  const overdueInvoices = outstandingInvoices.filter(i => i.days_outstanding > 0);
  const paidInvoices = invoices.filter(i => i.status === 'paid');

  const totalOutstanding = outstandingInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPaid = paidInvoices.reduce((sum, i) => sum + i.amount, 0);

  // AR Aging buckets
  const agingData = [
    { 
      name: 'Current', 
      value: outstandingInvoices.filter(i => i.days_outstanding <= 0).length,
      amount: outstandingInvoices.filter(i => i.days_outstanding <= 0).reduce((sum, i) => sum + i.amount, 0)
    },
    { 
      name: '1-30 Days', 
      value: overdueInvoices.filter(i => i.days_outstanding >= 1 && i.days_outstanding <= 30).length,
      amount: overdueInvoices.filter(i => i.days_outstanding >= 1 && i.days_outstanding <= 30).reduce((sum, i) => sum + i.amount, 0)
    },
    { 
      name: '31-60 Days', 
      value: overdueInvoices.filter(i => i.days_outstanding >= 31 && i.days_outstanding <= 60).length,
      amount: overdueInvoices.filter(i => i.days_outstanding >= 31 && i.days_outstanding <= 60).reduce((sum, i) => sum + i.amount, 0)
    },
    { 
      name: '61-90 Days', 
      value: overdueInvoices.filter(i => i.days_outstanding >= 61 && i.days_outstanding <= 90).length,
      amount: overdueInvoices.filter(i => i.days_outstanding >= 61 && i.days_outstanding <= 90).reduce((sum, i) => sum + i.amount, 0)
    },
    { 
      name: '90+ Days', 
      value: overdueInvoices.filter(i => i.days_outstanding > 90).length,
      amount: overdueInvoices.filter(i => i.days_outstanding > 90).reduce((sum, i) => sum + i.amount, 0)
    }
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.load_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesView = viewMode === 'all' || 
      (viewMode === 'outstanding' && invoice.status !== 'paid') ||
      (viewMode === 'overdue' && invoice.status !== 'paid' && invoice.days_outstanding > 0) ||
      (viewMode === 'paid' && invoice.status === 'paid');
    
    return matchesSearch && matchesView;
  });

  const getShipperName = (shipperId) => {
    const shipper = shippers.find(s => s.id === shipperId);
    return shipper?.company_name || 'Unknown Customer';
  };

  const handleSendInvoice = (invoiceId) => {
    alert(`Invoice sent to customer`);
  };

  const handleRecordPayment = (invoiceId) => {
    const amount = prompt('Enter payment amount:');
    if (amount) {
      alert(`Payment of $${amount} recorded for invoice ${invoiceId}`);
    }
  };

  const handleChargeCreditCard = (invoiceId) => {
    alert(`Processing credit card payment for invoice ${invoiceId}`);
  };

  const handleCreditHold = (shipperId) => {
    alert(`Customer placed on credit hold`);
  };

  const handleExportAR = () => {
    const csv = filteredInvoices.map(i => 
      `${i.invoice_number},${getShipperName(i.shipper_id)},${i.amount},${i.status},${i.days_outstanding}`
    ).join('\n');
    
    const blob = new Blob([`Invoice,Customer,Amount,Status,Days Outstanding\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ar_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#991b1b'];

  return (
    <div className="space-y-6 mt-6">
      
      {/* AR Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Outstanding</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  ${(totalOutstanding / 1000).toFixed(1)}K
                </p>
                <p className="text-sm text-slate-600 mt-1">{outstandingInvoices.length} invoices</p>
              </div>
              <Clock className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  ${(totalOverdue / 1000).toFixed(1)}K
                </p>
                <p className="text-sm text-slate-600 mt-1">{overdueInvoices.length} invoices</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Collected</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  ${(totalPaid / 1000).toFixed(1)}K
                </p>
                <p className="text-sm text-slate-600 mt-1">{paidInvoices.length} invoices</p>
              </div>
              <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Avg Collection</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  {Math.round(overdueInvoices.reduce((sum, i) => sum + i.days_outstanding, 0) / (overdueInvoices.length || 1))} days
                </p>
                <p className="text-sm text-slate-600 mt-1">Average DSO</p>
              </div>
              <TrendingUp className="w-12 h-12 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AR Aging Chart */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>AR Aging Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => {
                  if (name === 'value') return [`${value} invoices`, 'Count'];
                  return [`$${props.payload.amount.toLocaleString()}`, 'Amount'];
                }}
              />
              <Bar dataKey="value" name="Invoices">
                {agingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={viewMode === 'outstanding' ? 'default' : 'outline'}
                onClick={() => setViewMode('outstanding')}
              >
                Outstanding ({outstandingInvoices.length})
              </Button>
              <Button
                variant={viewMode === 'overdue' ? 'default' : 'outline'}
                onClick={() => setViewMode('overdue')}
                className="text-red-600"
              >
                Overdue ({overdueInvoices.length})
              </Button>
              <Button
                variant={viewMode === 'paid' ? 'default' : 'outline'}
                onClick={() => setViewMode('paid')}
              >
                Paid ({paidInvoices.length})
              </Button>
            </div>
            <Button onClick={handleExportAR} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Invoices & Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-slate-900">{invoice.invoice_number}</h4>
                      <Badge className={
                        invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        invoice.days_outstanding > 30 ? 'bg-red-100 text-red-800' :
                        invoice.days_outstanding > 0 ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {invoice.status === 'paid' ? 'Paid' : 
                         invoice.days_outstanding > 0 ? `${invoice.days_outstanding} days overdue` :
                         'Current'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      Customer: {getShipperName(invoice.shipper_id)}
                    </p>
                    <p className="text-sm text-slate-600">
                      Load: {invoice.load_number}
                    </p>
                    <p className="text-sm text-slate-600">
                      Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                      ${invoice.amount.toLocaleString()}
                    </p>
                    {invoice.status !== 'paid' && (
                      <div className="flex gap-1 mt-2">
                        <Button 
                          onClick={() => handleSendInvoice(invoice.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Send
                        </Button>
                        <Button 
                          onClick={() => handleRecordPayment(invoice.id)}
                          size="sm"
                          className="bg-emerald-600 text-white"
                        >
                          <DollarSign className="w-3 h-3 mr-1" />
                          Record
                        </Button>
                        <Button 
                          onClick={() => handleChargeCreditCard(invoice.id)}
                          size="sm"
                          variant="outline"
                        >
                          <CreditCard className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No invoices found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}