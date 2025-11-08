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
import { Save, X } from "lucide-react";
import { addDays, format } from "date-fns";

export default function CreateInvoiceModal({ invoice, loads, shippers, onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    load_id: '',
    invoice_number: '',
    invoice_status: 'pending',
    invoice_due_date: ''
  });

  const [selectedLoad, setSelectedLoad] = useState(null);

  useEffect(() => {
    if (invoice) {
      setFormData({
        load_id: invoice.id,
        invoice_number: invoice.invoice_number || '',
        invoice_status: invoice.invoice_status || 'pending',
        invoice_due_date: invoice.invoice_due_date || ''
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
          invoice_due_date: format(dueDate, 'yyyy-MM-dd')
        }));
      }
    }
  };

  const shipper = selectedLoad ? shippers.find(s => s.id === selectedLoad.shipper_id) : null;

  const handleSubmit = () => {
    if (!formData.load_id || !formData.invoice_number) {
      alert('Please select a load and provide an invoice number');
      return;
    }
    onSave(formData);
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
                Invoice will be generated for this amount
              </p>
            </div>
          )}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.load_id || !formData.invoice_number}
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}