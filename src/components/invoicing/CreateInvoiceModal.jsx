import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, FileText, FileSpreadsheet } from "lucide-react";
import { addDays, format as formatDate } from "date-fns";
import { logDocumentAction, generateDocument } from "@/utils/documentFormatHandler";
import { base44 } from "@/api/base44Client";

export default function CreateInvoiceModal({ invoice, loads, shippers, onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    load_id: '',
    invoice_number: '',
    invoice_status: 'pending',
    invoice_due_date: '',
    export_format: 'pdf'
  });

  const [selectedLoad, setSelectedLoad] = useState(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  useEffect(() => {
    if (invoice) {
      setFormData({
        load_id: invoice.id,
        invoice_number: invoice.invoice_number || '',
        invoice_status: invoice.invoice_status || 'pending',
        invoice_due_date: invoice.invoice_due_date || '',
        export_format: 'pdf'
      });
      setSelectedLoad(invoice);
    }
  }, [invoice]);

  const handleLoadChange = (loadId) => {
    const load = loads.find(l => l.id === loadId);
    setSelectedLoad(load);
    setFormData(prev => ({
      ...prev,
      load_id: loadId
    }));

    // Auto-generate invoice number if not set
    if (!formData.invoice_number) {
      const timestamp = Date.now().toString().slice(-6);
      setFormData(prev => ({
        ...prev,
        invoice_number: `INV-${timestamp}`
      }));
    }

    // Set due date based on shipper payment terms
    if (load?.shipper_id) {
      const shipper = shippers.find(s => s.id === load.shipper_id);
      if (shipper?.payment_terms) {
        const daysMap = {
          net_15: 15,
          net_30: 30,
          net_45: 45,
          net_60: 60,
          quick_pay: 7
        };
        const days = daysMap[shipper.payment_terms] || 30;
        const dueDate = addDays(new Date(), days);
        setFormData(prev => ({
          ...prev,
          invoice_due_date: formatDate(dueDate, 'yyyy-MM-dd')
        }));
      }
    }
  };

  const shipper = selectedLoad ? shippers.find(s => s.id === selectedLoad.shipper_id) : null;

  const handleSubmit = async () => {
    if (!formData.load_id || !formData.invoice_number) {
      alert('Please select a load and provide an invoice number');
      return;
    }

    setGeneratingInvoice(true);

    try {
      // Get current user
      const user = await base44.auth.me();

      // Generate invoice document
      const result = await generateDocument('invoice', {
        load_id: formData.load_id,
        invoice_number: formData.invoice_number,
        shipper: shipper,
        load: selectedLoad,
        module: 'Invoicing',
        feature: 'Invoice Generation'
      }, formData.export_format);

      if (result.success) {
        // Log generation
        await logDocumentAction({
          documentId: result.document.id,
          documentName: `Invoice_${formData.invoice_number}.${formData.export_format}`,
          documentType: 'invoice',
          actionType: 'generated',
          actionBy: user.email,
          fileFormat: formData.export_format,
          module: 'Invoicing',
          feature: 'Invoice Generation',
          notes: `Generated invoice in ${formData.export_format.toUpperCase()} format`,
          loadId: formData.load_id,
          invoiceNumber: formData.invoice_number
        });

        // Save invoice data
        onSave(formData);
      } else {
        alert(`Failed to generate invoice: ${result.message}`);
      }
    } catch (error) {
      console.error('Invoice generation error:', error);
      alert('Failed to generate invoice');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-900 to-green-900 bg-clip-text text-transparent">
            {invoice ? 'Edit Invoice' : 'Create Invoice'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* Select Load */}
          <div>
            <Label>Select Load *</Label>
            <Select 
              value={formData.load_id} 
              onValueChange={handleLoadChange}
              disabled={!!invoice}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a delivered load..." />
              </SelectTrigger>
              <SelectContent>
                {loads?.map(load => {
                  const loadShipper = shippers.find(s => s.id === load.shipper_id);
                  return (
                    <SelectItem key={load.id} value={load.id}>
                      {load.load_number || `#${load.id.slice(0, 8)}`} - 
                      {loadShipper?.company_name} - 
                      ${(load.customer_rate || 0).toLocaleString()}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Load Details Preview */}
          {selectedLoad && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
              <h3 className="font-semibold text-emerald-900 mb-3">Load Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-emerald-700 font-medium">Customer</p>
                  <p className="text-sm text-emerald-900">{shipper?.company_name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-emerald-700 font-medium">Amount</p>
                  <p className="text-lg font-bold text-emerald-600">
                    ${(selectedLoad.customer_rate || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-700 font-medium">Route</p>
                  <p className="text-sm text-emerald-900">
                    {selectedLoad.pickup_location?.city} → {selectedLoad.dropoff_location?.city}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-700 font-medium">Payment Terms</p>
                  <p className="text-sm text-emerald-900 uppercase">
                    {shipper?.payment_terms?.replace(/_/g, ' ') || 'Net 30'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Invoice Number *</Label>
              <Input
                value={formData.invoice_number}
                onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                placeholder="INV-123456"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select 
                value={formData.invoice_status} 
                onValueChange={(value) => setFormData({...formData, invoice_status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="partial">Partial Payment</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Due Date *</Label>
            <Input
              type="date"
              value={formData.invoice_due_date}
              onChange={(e) => setFormData({...formData, invoice_due_date: e.target.value})}
            />
            {shipper?.payment_terms && (
              <p className="text-xs text-slate-500 mt-1">
                Based on {shipper.payment_terms.replace(/_/g, ' ').toUpperCase()} terms
              </p>
            )}
          </div>

          {/* Export Format Selection */}
          <div>
            <Label>Export Format *</Label>
            <Select 
              value={formData.export_format} 
              onValueChange={(value) => setFormData({...formData, export_format: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span>📄 PDF - Professional Invoice</span>
                  </div>
                </SelectItem>
                <SelectItem value="xlsx">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span>📊 Excel - Editable Spreadsheet</span>
                  </div>
                </SelectItem>
                <SelectItem value="docx">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>📝 Word - Customizable Template</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-2">
              Choose the format for invoice generation and download
            </p>
          </div>

          {/* Summary */}
          {selectedLoad && (
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-indigo-900">Invoice Total</span>
                <span className="text-2xl font-bold text-indigo-600">
                  ${(selectedLoad.customer_rate || 0).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-indigo-700">
                Invoice will be generated in <strong>{formData.export_format.toUpperCase()}</strong> format
              </p>
            </div>
          )}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading || generatingInvoice}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || generatingInvoice || !formData.load_id || !formData.invoice_number}
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {generatingInvoice ? 'Generating...' : (invoice ? 'Update Invoice' : `Create & Download ${formData.export_format.toUpperCase()}`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}