
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, DollarSign, TrendingUp, AlertTriangle, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import InvoiceCard from "../components/invoicing/InvoiceCard";
import CreateInvoiceModal from "../components/invoicing/CreateInvoiceModal";
import InvoiceStats from "../components/invoicing/InvoiceStats";
import InvoiceAgingChart from "../components/invoicing/InvoiceAgingChart";
import { logDocumentAction } from "../utils/documentFormatHandler.js";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent">
              Invoice Management
            </h1>
            <p className="text-slate-600 mt-2">
              Generate invoices in PDF/Excel/Word with full audit trails and payment tracking
            </p>
          </div>
          <div className="flex gap-2">
            {filteredInvoices.length > 0 && (
              <Button
                onClick={handleBulkExport}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Bulk Export
              </Button>
            )}
            <Button
              onClick={() => {
                setSelectedInvoice(null);
                setShowCreateModal(true);
              }}
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="mt-4 text-slate-600">Loading invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
            <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No invoices found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : invoiceableLoads.length > 0
                ? 'You have delivered loads ready to invoice'
                : 'Deliver loads to generate invoices'}
            </p>
            {invoiceableLoads.length > 0 && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            )}
          </div>
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
