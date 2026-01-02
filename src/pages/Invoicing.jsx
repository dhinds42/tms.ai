import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, DollarSign, TrendingUp, AlertTriangle, Download, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageHeader, EmptyState, SkeletonCard } from "@/components/design-system";

import InvoiceCard from "../components/invoicing/InvoiceCard";
import CreateInvoiceModal from "../components/invoicing/CreateInvoiceModal";
import InvoiceStats from "../components/invoicing/InvoiceStats";
import InvoiceAgingChart from "../components/invoicing/InvoiceAgingChart";
import { logDocumentAction } from "../components/utils/documentFormatHandler.jsx";

export default function Invoicing() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const queryClient = useQueryClient();

  const { data: loads, isLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: shippers, isLoading: shippersLoading } = useQuery({
    queryKey: ['shippers'],
    queryFn: () => base44.entities.Shipper.list('-created_date', 100),
    initialData: [],
  });

  const updateLoadMutation = useMutation({
    mutationFn: async ({ id, data, logAction }) => {
      // Get current user
      const user = await base44.auth.me();
      
      // Update load
      const updated = await base44.entities.Load.update(id, data);
      
      // Log action if provided
      if (logAction) {
        await logDocumentAction({
          documentId: id,
          documentName: `Invoice_${data.invoice_number || updated.invoice_number}`,
          documentType: 'invoice',
          actionType: logAction.type,
          actionBy: user.email,
          module: 'Invoicing',
          feature: logAction.feature || 'Invoice Management',
          notes: logAction.notes,
          loadId: id,
          invoiceNumber: data.invoice_number || updated.invoice_number
        });
      }
      
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      queryClient.invalidateQueries({ queryKey: ['documentHistory'] });
      setShowCreateModal(false);
      setSelectedInvoice(null);
    },
  });

  const handleCreateInvoice = (invoiceData) => {
    const { load_id, ...invoiceFields } = invoiceData;
    
    updateLoadMutation.mutate({
      id: load_id,
      data: {
        invoice_status: invoiceFields.invoice_status || 'sent',
        invoice_number: invoiceFields.invoice_number,
        invoice_due_date: invoiceFields.invoice_due_date,
        status: 'invoiced'
      },
      logAction: {
        type: 'generated',
        feature: 'Invoice Generation',
        notes: `Invoice ${invoiceFields.invoice_number} created and ${invoiceFields.invoice_status === 'sent' ? 'sent to customer' : 'saved as draft'}`
      }
    });
  };

  const handleUpdateInvoiceStatus = (loadId, newStatus) => {
    const load = loads.find(l => l.id === loadId);
    
    updateLoadMutation.mutate({
      id: loadId,
      data: { invoice_status: newStatus },
      logAction: {
        type: 'edited',
        feature: 'Status Update',
        notes: `Invoice status changed from ${load?.invoice_status || 'unknown'} to ${newStatus}`
      }
    });
  };

  const handleBulkExport = async () => {
    try {
      const user = await base44.auth.me();
      
      // Log bulk export
      await logDocumentAction({
        documentId: 'bulk_' + Date.now(),
        documentName: `Bulk_Invoices_${new Date().toISOString().split('T')[0]}.xlsx`,
        documentType: 'invoice',
        actionType: 'exported',
        actionBy: user.email,
        fileFormat: 'xlsx',
        module: 'Invoicing',
        feature: 'Bulk Export',
        notes: `Exported ${filteredInvoices.length} invoices to Excel`
      });

      alert(`Exporting ${filteredInvoices.length} invoices to Excel...`);
      // In production, would generate actual Excel file
    } catch (error) {
      console.error('Bulk export error:', error);
    }
  };

  // Get invoiceable loads (delivered but not invoiced)
  const invoiceableLoads = loads.filter(l => 
    l.status === 'delivered' && !l.invoice_number
  );

  // Get invoiced loads
  const invoicedLoads = loads.filter(l => l.invoice_number);

  // Filter invoiced loads
  const filteredInvoices = invoicedLoads.filter(load => {
    const statusMatch = statusFilter === 'all' || load.invoice_status === statusFilter;
    const searchMatch = searchTerm === '' ||
      load.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.load_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.shipper_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  const statusCounts = {
    all: invoicedLoads.length,
    pending: invoicedLoads.filter(l => l.invoice_status === 'pending').length,
    sent: invoicedLoads.filter(l => l.invoice_status === 'sent').length,
    partial: invoicedLoads.filter(l => l.invoice_status === 'partial').length,
    paid: invoicedLoads.filter(l => l.invoice_status === 'paid').length,
    overdue: invoicedLoads.filter(l => l.invoice_status === 'overdue').length
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Invoices"
        subtitle="Generate and track customer invoices with payment status"
        icon={DollarSign}
        primaryAction={{
          label: 'Create Invoice',
          icon: Plus,
          onClick: () => {
            setSelectedInvoice(null);
            setShowCreateModal(true);
          }
        }}
        secondaryActions={[
          { label: 'Export All', icon: Download, onClick: handleBulkExport }
        ]}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <InvoiceStats loads={invoicedLoads} isLoading={isLoading} />

        {/* Aging Chart */}
        <InvoiceAgingChart invoices={invoicedLoads} isLoading={isLoading} />

        {/* Invoiceable Loads Alert */}
        {invoiceableLoads.length > 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  <div>
                    <h3 className="font-semibold text-amber-900">
                      {invoiceableLoads.length} loads ready to invoice
                    </h3>
                    <p className="text-sm text-amber-700 mt-1">
                      These loads have been delivered but not yet invoiced
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Create Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search invoices by number, load, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all">
                All ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({statusCounts.pending})
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent ({statusCounts.sent})
              </TabsTrigger>
              <TabsTrigger value="partial">
                Partial ({statusCounts.partial})
              </TabsTrigger>
              <TabsTrigger value="paid">
                Paid ({statusCounts.paid})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({statusCounts.overdue})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Invoices Grid */}
        {isLoading || shippersLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No invoices found"
            description={searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : invoiceableLoads.length > 0
              ? 'You have delivered loads ready to invoice'
              : 'Deliver loads to generate invoices'}
            action={invoiceableLoads.length > 0 && {
              label: 'Create Invoice',
              icon: Plus,
              onClick: () => setShowCreateModal(true)
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInvoices.map((load) => {
              const shipper = shippers.find(s => s.id === load.shipper_id);
              return (
                <InvoiceCard
                  key={load.id}
                  load={load}
                  shipper={shipper}
                  onUpdateStatus={(status) => handleUpdateInvoiceStatus(load.id, status)}
                  onEdit={(load) => {
                    setSelectedInvoice(load);
                    setShowCreateModal(true);
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <CreateInvoiceModal
            invoice={selectedInvoice}
            loads={invoiceableLoads}
            shippers={shippers}
            onSave={handleCreateInvoice}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedInvoice(null);
            }}
            isLoading={updateLoadMutation.isPending}
          />
        )}

      </div>
    </div>
  );
}