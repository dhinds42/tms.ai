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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, Plus, Trash2 } from "lucide-react";

export default function CreateShipperModal({ shipper, onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', zip: '' },
    primary_lanes: [],
    commodities: [],
    payment_terms: 'net_30',
    credit_limit: '',
    status: 'active',
    notes: '',
    last_contact_date: '',
    next_follow_up: ''
  });

  const [newLane, setNewLane] = useState({ origin: '', destination: '', frequency: '' });
  const [newCommodity, setNewCommodity] = useState('');

  useEffect(() => {
    if (shipper) {
      setFormData({
        company_name: shipper.company_name || '',
        contact_name: shipper.contact_name || '',
        email: shipper.email || '',
        phone: shipper.phone || '',
        address: shipper.address || { street: '', city: '', state: '', zip: '' },
        primary_lanes: shipper.primary_lanes || [],
        commodities: shipper.commodities || [],
        payment_terms: shipper.payment_terms || 'net_30',
        credit_limit: shipper.credit_limit || '',
        status: shipper.status || 'active',
        notes: shipper.notes || '',
        last_contact_date: shipper.last_contact_date || '',
        next_follow_up: shipper.next_follow_up || ''
      });
    }
  }, [shipper]);

  const handleAddLane = () => {
    if (newLane.origin && newLane.destination) {
      setFormData(prev => ({
        ...prev,
        primary_lanes: [...prev.primary_lanes, newLane]
      }));
      setNewLane({ origin: '', destination: '', frequency: '' });
    }
  };

  const handleRemoveLane = (index) => {
    setFormData(prev => ({
      ...prev,
      primary_lanes: prev.primary_lanes.filter((_, i) => i !== index)
    }));
  };

  const handleAddCommodity = () => {
    if (newCommodity.trim()) {
      setFormData(prev => ({
        ...prev,
        commodities: [...prev.commodities, newCommodity.trim()]
      }));
      setNewCommodity('');
    }
  };

  const handleRemoveCommodity = (index) => {
    setFormData(prev => ({
      ...prev,
      commodities: prev.commodities.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : null,
      total_loads: shipper?.total_loads || 0,
      total_revenue: shipper?.total_revenue || 0,
      average_rate: shipper?.average_rate || 0,
      rating: shipper?.rating || 5
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">
            {shipper ? 'Edit Shipper' : 'Add New Shipper'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-3">Company Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Company Name *</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  placeholder="Acme Manufacturing Co"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Terms</Label>
                <Select value={formData.payment_terms} onValueChange={(value) => setFormData({...formData, payment_terms: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="net_15">Net 15</SelectItem>
                    <SelectItem value="net_30">Net 30</SelectItem>
                    <SelectItem value="net_45">Net 45</SelectItem>
                    <SelectItem value="net_60">Net 60</SelectItem>
                    <SelectItem value="quick_pay">Quick Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Contact Name *</Label>
              <Input
                value={formData.contact_name}
                onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                placeholder="John Smith"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="john@acme.com"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="555-123-4567"
              />
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-4">
              <Label>Street Address</Label>
              <Input
                value={formData.address.street}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, street: e.target.value }
                })}
                placeholder="123 Main St"
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                value={formData.address.city}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value }
                })}
                placeholder="Columbus"
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                value={formData.address.state}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, state: e.target.value }
                })}
                placeholder="OH"
              />
            </div>
            <div className="col-span-2">
              <Label>ZIP Code</Label>
              <Input
                value={formData.address.zip}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, zip: e.target.value }
                })}
                placeholder="43215"
              />
            </div>
          </div>

          {/* Primary Lanes */}
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
            <h3 className="font-semibold text-indigo-900 mb-3">Primary Lanes</h3>
            <div className="space-y-3">
              {formData.primary_lanes.map((lane, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <span className="text-sm flex-1">{lane.origin} → {lane.destination}</span>
                  <span className="text-xs text-slate-500">{lane.frequency}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLane(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              <Input
                placeholder="Origin"
                value={newLane.origin}
                onChange={(e) => setNewLane({...newLane, origin: e.target.value})}
              />
              <Input
                placeholder="Destination"
                value={newLane.destination}
                onChange={(e) => setNewLane({...newLane, destination: e.target.value})}
              />
              <Input
                placeholder="Frequency"
                value={newLane.frequency}
                onChange={(e) => setNewLane({...newLane, frequency: e.target.value})}
              />
              <Button onClick={handleAddLane} variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
          </div>

          {/* Commodities */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Commodities</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.commodities.map((commodity, index) => (
                <Badge key={index} className="bg-indigo-100 text-indigo-700 flex items-center gap-2">
                  {commodity}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleRemoveCommodity(index)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add commodity (e.g., Auto Parts)"
                value={newCommodity}
                onChange={(e) => setNewCommodity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCommodity()}
              />
              <Button onClick={handleAddCommodity} variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
          </div>

          {/* Financial & Schedule */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Credit Limit ($)</Label>
              <Input
                type="number"
                value={formData.credit_limit}
                onChange={(e) => setFormData({...formData, credit_limit: e.target.value})}
                placeholder="50000"
              />
            </div>
            <div>
              <Label>Last Contact Date</Label>
              <Input
                type="date"
                value={formData.last_contact_date}
                onChange={(e) => setFormData({...formData, last_contact_date: e.target.value})}
              />
            </div>
            <div>
              <Label>Next Follow-up</Label>
              <Input
                type="date"
                value={formData.next_follow_up}
                onChange={(e) => setFormData({...formData, next_follow_up: e.target.value})}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Internal notes about this shipper..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : (shipper ? 'Update Shipper' : 'Add Shipper')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}