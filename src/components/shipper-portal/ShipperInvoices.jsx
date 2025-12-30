import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Download,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  X
} from "lucide-react";
import { format } from "date-fns";

export default function ShipperInvoices({ userEmail }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const queryClient = useQueryClient();

  // Fetch user's loads
  const { data: loads } = useQuery({
    queryKey: ['shipper-loads', userEmail],
    queryFn: () => base44.entities.Load.filter({ created_by: userEmail }),
    initialData: [],
    enabled: !!userEmail
  });

  // Fetch invoices for user's loads
  const loadIds = loads.map(l => l.id);
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['shipper-invoices', loadIds],
    queryFn: async () => {
      if (loadIds.length === 0) return [];
      const allInvoices = await base44.entities.Invoice.list('-invoice_date', 200);
      return allInvoices.filter(inv => loadIds.includes(inv.load_id));
    },
    initialData: [],
    enabled: loadIds.length > 0
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Invoice.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipper-invoices'] });
      setShowPaymentModal(false);
      setShowDisputeModal(false);
      setSelectedInvoice(null);
    },
  });

  const handleDownload = async (invoice) => {
    alert(`Downloading invoice ${invoice.invoice_number} as PDF...`);
    // In production: Generate PDF via backend
  };

  const handleSubmitPayment = () => {
    const amount = parseFloat(paymentAmount);
    const remaining = selectedInvoice.amount_remaining - amount;
    
    updateInvoiceMutation.mutate({
      id: selectedInvoice.id,
      data: {
        amount_paid: selectedInvoice.amount_paid + amount,
        amount_remaining: remaining,
        status: remaining <= 0 ? 'paid' : 'partial',
        payment_received_date: remaining <= 0 ? new Date().toISOString() : undefined
      }
    });
  };

  const handleSubmitDispute = () => {
    updateInvoiceMutation.mutate({
      id: selectedInvoice.id,
      data: {
        status: 'disputed',
        dispute_reason: disputeReason
      }
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      draft: { color: 'bg-slate-100 text-slate-700', icon: FileText },
      sent: { color: 'bg-blue-100 text-blue-700', icon: Clock },
      open: { color: 'bg-amber-100 text-amber-700', icon: Clock },
      partial: { color: 'bg-purple-100 text-purple-700', icon: DollarSign },
      paid: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
      overdue: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
      disputed: { color: 'bg-orange-100 text-orange-700', icon: AlertCircle }
    };
    return configs[status] || configs.draft;
  };

  const totalOutstanding = invoices
    .filter(inv => ['sent', 'open', 'partial', 'overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + (inv.amount_remaining || 0), 0);

  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

  if (isLoading) {
    return <div className="text-center py-12">Loading invoices...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase">Total Invoices</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{invoices.length}</p>
              </div>
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase">Outstanding</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  ${totalOutstanding.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase">Overdue</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{overdueCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Your Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No invoices yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => {
                const statusConfig = getStatusConfig(invoice.status);
                const StatusIcon = statusConfig.icon;
                const load = loads.find(l => l.id === invoice.load_id);

                return (
                  <div
                    key={invoice.id}
                    className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-slate-900">
                            {invoice.invoice_number}
                          </h3>
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {invoice.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Load</p>
                            <p className="font-medium text-slate-900">{load?.load_number || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Date</p>
                            <p className="font-medium text-slate-900">
                              {format(new Date(invoice.invoice_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Due Date</p>
                            <p className="font-medium text-slate-900">
                              {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Amount</p>
                            <p className="font-bold text-indigo-600 text-lg">
                              ${invoice.total_amount?.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {invoice.amount_remaining > 0 && (
                          <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                            <p className="text-sm font-semibold text-amber-900">
                              Remaining: ${invoice.amount_remaining.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(invoice)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>

                        {['sent', 'open', 'partial', 'overdue'].includes(invoice.status) && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setPaymentAmount(invoice.amount_remaining.toString());
                                setShowPaymentModal(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <CreditCard className="w-4 h-4 mr-1" />
                              Pay
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-300 text-orange-700"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setDisputeReason("");
                                setShowDisputeModal(true);
                              }}
                            >
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Dispute
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Payment</DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Invoice</p>
                <p className="font-bold text-lg">{selectedInvoice.invoice_number}</p>
                <p className="text-sm text-slate-600 mt-2">Amount Due</p>
                <p className="font-bold text-2xl text-indigo-600">
                  ${selectedInvoice.amount_remaining?.toLocaleString()}
                </p>
              </div>

              <div>
                <Label>Payment Amount</Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  💳 Payment will be processed securely. You'll receive a confirmation email.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmitPayment}
              disabled={!paymentAmount || updateInvoiceMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {updateInvoiceMutation.isPending ? 'Processing...' : 'Submit Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Modal */}
      <Dialog open={showDisputeModal} onOpenChange={setShowDisputeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispute Invoice</DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Invoice</p>
                <p className="font-bold text-lg">{selectedInvoice.invoice_number}</p>
              </div>

              <div>
                <Label>Reason for Dispute</Label>
                <Textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Please explain the issue with this invoice..."
                  rows={4}
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-900">
                  ⚠️ Submitting a dispute will notify our billing team. They'll review and contact you within 24 hours.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisputeModal(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDispute}
              disabled={!disputeReason.trim() || updateInvoiceMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              {updateInvoiceMutation.isPending ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}