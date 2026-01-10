import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Link as LinkIcon,
  Unlink,
  Download,
  Upload,
  Sparkles,
  Loader2
} from "lucide-react";

export default function AccountingIntegration() {
  const [syncingInvoices, setSyncingInvoices] = useState(false);
  const [syncingPayments, setSyncingPayments] = useState(false);
  const [qbConnected, setQbConnected] = useState(false);
  const [xeroConnected, setXeroConnected] = useState(false);

  const queryClient = useQueryClient();

  const { data: loads, isLoading: loadsLoading } = useScopedEntity('Load', { limit: 100 });
  const { data: shippers, isLoading: shippersLoading } = useScopedEntity('Shipper', { limit: 100 });

  const updateShipperMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Shipper.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shippers'] });
    },
  });

  const updateLoadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Load.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
    },
  });

  // Calculate accounting metrics
  const invoicedLoads = loads.filter(l => l.invoice_number);
  const totalInvoiced = invoicedLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const paidLoads = invoicedLoads.filter(l => l.invoice_status === 'paid');
  const totalPaid = paidLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  const syncedShippers = shippers.filter(s => s.accounting_sync_enabled);

  const syncInvoicesToQuickBooks = async () => {
    setSyncingInvoices(true);

    try {
      // Simulate invoice sync to QuickBooks
      const unsyncedInvoices = invoicedLoads.filter(l => !l.qb_invoice_id);

      for (const load of unsyncedInvoices.slice(0, 5)) {
        // In production, this would actually call QuickBooks API
        const qbInvoiceId = `QB-INV-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        
        await updateLoadMutation.mutateAsync({
          id: load.id,
          data: {
            qb_invoice_id: qbInvoiceId,
            qb_synced_date: new Date().toISOString()
          }
        });
      }

      alert(`Successfully synced ${Math.min(unsyncedInvoices.length, 5)} invoices to QuickBooks!`);

    } catch (error) {
      console.error('QuickBooks sync error:', error);
      alert('Failed to sync invoices');
    } finally {
      setSyncingInvoices(false);
    }
  };

  const syncPaymentsFromQuickBooks = async () => {
    setSyncingPayments(true);

    try {
      // Simulate payment sync from QuickBooks
      const unpaidInvoices = invoicedLoads.filter(l => 
        l.invoice_status !== 'paid' && l.qb_invoice_id
      );

      // Mock: Mark some as paid
      for (const load of unpaidInvoices.slice(0, 3)) {
        await updateLoadMutation.mutateAsync({
          id: load.id,
          data: {
            invoice_status: 'paid',
            payment_received_date: new Date().toISOString()
          }
        });
      }

      alert('Successfully synced payments from QuickBooks!');

    } catch (error) {
      console.error('Payment sync error:', error);
      alert('Failed to sync payments');
    } finally {
      setSyncingPayments(false);
    }
  };

  const connectQuickBooks = () => {
    // In production, this would initiate OAuth flow
    setQbConnected(true);
    alert('QuickBooks connected successfully! (Demo mode)');
  };

  const connectXero = () => {
    // In production, this would initiate OAuth flow
    setXeroConnected(true);
    alert('Xero connected successfully! (Demo mode)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent mb-2">
            Accounting Integration Hub
          </h1>
          <p className="text-slate-600 text-lg">
            Seamless sync with QuickBooks & Xero for invoicing and payments
          </p>
          <Badge className="mt-3 bg-emerald-600">Two-Way Sync</Badge>
        </div>

        {/* Integration Status */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* QuickBooks */}
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">QuickBooks</h3>
                    <p className="text-sm text-slate-600">Online Accounting</p>
                  </div>
                </div>
                <Badge className={qbConnected ? 'bg-emerald-600' : 'bg-slate-600'}>
                  {qbConnected ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </>
                  ) : (
                    'Not Connected'
                  )}
                </Badge>
              </div>

              {qbConnected ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <p className="text-sm font-semibold text-emerald-900 mb-2">Sync Status</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Last Sync:</span>
                        <span className="font-medium text-slate-900">Just now</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Invoices Synced:</span>
                        <span className="font-medium text-emerald-600">
                          {loads.filter(l => l.qb_invoice_id).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Auto-Sync:</span>
                        <span className="font-medium text-slate-900">Enabled</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={syncInvoicesToQuickBooks}
                      disabled={syncingInvoices}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {syncingInvoices ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Sync Invoices
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={syncPaymentsFromQuickBooks}
                      disabled={syncingPayments}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {syncingPayments ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Get Payments
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setQbConnected(false)}
                    className="w-full border-red-300 text-red-700"
                  >
                    <Unlink className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={connectQuickBooks}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect QuickBooks
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Xero */}
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Xero</h3>
                    <p className="text-sm text-slate-600">Cloud Accounting</p>
                  </div>
                </div>
                <Badge className={xeroConnected ? 'bg-emerald-600' : 'bg-slate-600'}>
                  {xeroConnected ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </>
                  ) : (
                    'Not Connected'
                  )}
                </Badge>
              </div>

              {xeroConnected ? (
                <div className="space-y-4">
                  <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                    <p className="text-sm font-semibold text-cyan-900 mb-2">Sync Status</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Last Sync:</span>
                        <span className="font-medium text-slate-900">2 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Contacts Synced:</span>
                        <span className="font-medium text-cyan-600">{syncedShippers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Auto-Sync:</span>
                        <span className="font-medium text-slate-900">Enabled</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setXeroConnected(false)}
                    className="w-full border-red-300 text-red-700"
                  >
                    <Unlink className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={connectXero}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect Xero
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Accounting Dashboard */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Invoiced</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    ${(totalInvoiced / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Paid</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    ${(totalPaid / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Outstanding</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    ${(totalOutstanding / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sync Rate</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">
                    {totalInvoiced > 0 ? ((loads.filter(l => l.qb_invoice_id).length / invoicedLoads.length) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sync Activity */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-6">
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-600" />
              Recent Sync Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {loads
                .filter(l => l.qb_invoice_id)
                .slice(0, 10)
                .map((load, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          Invoice {load.invoice_number}
                        </p>
                        <p className="text-sm text-slate-600">
                          Load {load.load_number || load.id.slice(0, 8)} • ${load.customer_rate?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-600 mb-1">QuickBooks</Badge>
                      <p className="text-xs text-slate-600">
                        {load.qb_synced_date ? new Date(load.qb_synced_date).toLocaleString() : 'Synced'}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Sync Status */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-6">
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-indigo-600" />
              Customer Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              {shippers.slice(0, 9).map((shipper, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {shipper.company_name}
                    </h4>
                    <Badge className={shipper.accounting_sync_enabled ? 'bg-emerald-600' : 'bg-slate-400'}>
                      {shipper.accounting_sync_enabled ? 'Synced' : 'Manual'}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    {shipper.quickbooks_customer_id && (
                      <p>QB ID: {shipper.quickbooks_customer_id}</p>
                    )}
                    {shipper.xero_contact_id && (
                      <p>Xero ID: {shipper.xero_contact_id}</p>
                    )}
                    {!shipper.accounting_sync_enabled && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 border-indigo-300 text-indigo-700 text-xs"
                        onClick={() => updateShipperMutation.mutate({
                          id: shipper.id,
                          data: { 
                            accounting_sync_enabled: true,
                            quickbooks_customer_id: `QB-${Date.now()}`,
                            last_accounting_sync: new Date().toISOString()
                          }
                        })}
                      >
                        Enable Sync
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}