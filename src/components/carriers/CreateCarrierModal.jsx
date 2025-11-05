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
import { Checkbox } from "@/components/ui/checkbox";

const equipmentOptions = [
  "cargo_van",
  "sprinter",
  "box_truck",
  "dry_van",
  "reefer",
  "flatbed",
  "step_deck",
  "lowboy"
];

export default function CreateCarrierModal({ carrier, onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    company_name: '',
    mc_number: '',
    dot_number: '',
    contact_name: '',
    email: '',
    phone: '',
    equipment_types: [],
    insurance_expiration: '',
    insurance_amount: '',
    fmcsa_safety_rating: 'not_rated',
    on_time_percentage: '',
    compliance_score: '',
    rating: '',
    status: 'pending_approval',
    notes: ''
  });

  useEffect(() => {
    if (carrier) {
      setFormData({
        company_name: carrier.company_name || '',
        mc_number: carrier.mc_number || '',
        dot_number: carrier.dot_number || '',
        contact_name: carrier.contact_name || '',
        email: carrier.email || '',
        phone: carrier.phone || '',
        equipment_types: carrier.equipment_types || [],
        insurance_expiration: carrier.insurance_expiration || '',
        insurance_amount: carrier.insurance_amount || '',
        fmcsa_safety_rating: carrier.fmcsa_safety_rating || 'not_rated',
        on_time_percentage: carrier.on_time_percentage || '',
        compliance_score: carrier.compliance_score || '',
        rating: carrier.rating || '',
        status: carrier.status || 'pending_approval',
        notes: carrier.notes || ''
      });
    }
  }, [carrier]);

  const handleEquipmentToggle = (equipment) => {
    setFormData(prev => ({
      ...prev,
      equipment_types: prev.equipment_types.includes(equipment)
        ? prev.equipment_types.filter(e => e !== equipment)
        : [...prev.equipment_types, equipment]
    }));
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      insurance_amount: formData.insurance_amount ? parseFloat(formData.insurance_amount) : null,
      on_time_percentage: formData.on_time_percentage ? parseFloat(formData.on_time_percentage) : null,
      compliance_score: formData.compliance_score ? parseFloat(formData.compliance_score) : null,
      rating: formData.rating ? parseFloat(formData.rating) : null,
      total_loads: carrier?.total_loads || 0,
      total_paid: carrier?.total_paid || 0
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
            {carrier ? 'Edit Carrier' : 'Add New Carrier'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Company Info */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">Company Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Company Name *</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  placeholder="ABC Trucking Co"
                />
              </div>
              <div>
                <Label>MC Number *</Label>
                <Input
                  value={formData.mc_number}
                  onChange={(e) => setFormData({...formData, mc_number: e.target.value})}
                  placeholder="MC-123456"
                />
              </div>
              <div>
                <Label>DOT Number *</Label>
                <Input
                  value={formData.dot_number}
                  onChange={(e) => setFormData({...formData, dot_number: e.target.value})}
                  placeholder="DOT-987654"
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
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>FMCSA Safety Rating</Label>
                <Select value={formData.fmcsa_safety_rating} onValueChange={(value) => setFormData({...formData, fmcsa_safety_rating: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                    <SelectItem value="unsatisfactory">Unsatisfactory</SelectItem>
                    <SelectItem value="not_rated">Not Rated</SelectItem>
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
                placeholder="john@abctrucking.com"
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

          {/* Equipment Types */}
          <div>
            <Label className="mb-3 block">Equipment Types</Label>
            <div className="grid grid-cols-4 gap-3">
              {equipmentOptions.map((equipment) => (
                <div key={equipment} className="flex items-center space-x-2">
                  <Checkbox
                    id={equipment}
                    checked={formData.equipment_types.includes(equipment)}
                    onCheckedChange={() => handleEquipmentToggle(equipment)}
                  />
                  <label
                    htmlFor={equipment}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                  >
                    {equipment.replace(/_/g, ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Insurance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Insurance Expiration</Label>
              <Input
                type="date"
                value={formData.insurance_expiration}
                onChange={(e) => setFormData({...formData, insurance_expiration: e.target.value})}
              />
            </div>
            <div>
              <Label>Insurance Amount ($)</Label>
              <Input
                type="number"
                value={formData.insurance_amount}
                onChange={(e) => setFormData({...formData, insurance_amount: e.target.value})}
                placeholder="1000000"
              />
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
            <h3 className="font-semibold text-indigo-900 mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>On-Time % (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.on_time_percentage}
                  onChange={(e) => setFormData({...formData, on_time_percentage: e.target.value})}
                  placeholder="95.5"
                />
              </div>
              <div>
                <Label>Compliance Score (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.compliance_score}
                  onChange={(e) => setFormData({...formData, compliance_score: e.target.value})}
                  placeholder="98.0"
                />
              </div>
              <div>
                <Label>Rating (1-5)</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: e.target.value})}
                  placeholder="4.5"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Internal notes about this carrier..."
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
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : (carrier ? 'Update Carrier' : 'Add Carrier')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}