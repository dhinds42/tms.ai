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
import { Save, X } from "lucide-react";

export default function CreateDriverModal({ driver, onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cdl_number: '',
    cdl_expiration: '',
    medical_card_expiration: '',
    equipment_assigned: '',
    current_location: { city: '', state: '' },
    hos_remaining: 11,
    home_terminal: { city: '', state: '' },
    status: 'available',
    notes: ''
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        full_name: driver.full_name || '',
        email: driver.email || '',
        phone: driver.phone || '',
        cdl_number: driver.cdl_number || '',
        cdl_expiration: driver.cdl_expiration || '',
        medical_card_expiration: driver.medical_card_expiration || '',
        equipment_assigned: driver.equipment_assigned || '',
        current_location: driver.current_location || { city: '', state: '' },
        hos_remaining: driver.hos_remaining || 11,
        home_terminal: driver.home_terminal || { city: '', state: '' },
        status: driver.status || 'available',
        notes: driver.notes || ''
      });
    }
  }, [driver]);

  const handleSubmit = () => {
    onSave({
      ...formData,
      hos_remaining: parseFloat(formData.hos_remaining),
      total_loads: driver?.total_loads || 0,
      on_time_percentage: driver?.on_time_percentage || 100,
      rating: driver?.rating || 5
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-900 to-blue-900 bg-clip-text text-transparent">
            {driver ? 'Edit Driver' : 'Add New Driver'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Full Name *</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="John Smith"
              />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="555-123-4567"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* CDL Info */}
          <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200">
            <h3 className="font-semibold text-cyan-900 mb-3">CDL Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CDL Number *</Label>
                <Input
                  value={formData.cdl_number}
                  onChange={(e) => setFormData({...formData, cdl_number: e.target.value})}
                  placeholder="OH-CDL-123456"
                />
              </div>
              <div>
                <Label>CDL Expiration</Label>
                <Input
                  type="date"
                  value={formData.cdl_expiration}
                  onChange={(e) => setFormData({...formData, cdl_expiration: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label>Medical Card Expiration</Label>
                <Input
                  type="date"
                  value={formData.medical_card_expiration}
                  onChange={(e) => setFormData({...formData, medical_card_expiration: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Equipment & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Equipment Assigned</Label>
              <Input
                value={formData.equipment_assigned}
                onChange={(e) => setFormData({...formData, equipment_assigned: e.target.value})}
                placeholder="Truck #101"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="on_load">On Load</SelectItem>
                  <SelectItem value="off_duty">Off Duty</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Location */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Current Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="City"
                value={formData.current_location.city}
                onChange={(e) => setFormData({
                  ...formData,
                  current_location: { ...formData.current_location, city: e.target.value }
                })}
              />
              <Input
                placeholder="State"
                value={formData.current_location.state}
                onChange={(e) => setFormData({
                  ...formData,
                  current_location: { ...formData.current_location, state: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Home Terminal */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Home Terminal</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="City"
                value={formData.home_terminal.city}
                onChange={(e) => setFormData({
                  ...formData,
                  home_terminal: { ...formData.home_terminal, city: e.target.value }
                })}
              />
              <Input
                placeholder="State"
                value={formData.home_terminal.state}
                onChange={(e) => setFormData({
                  ...formData,
                  home_terminal: { ...formData.home_terminal, state: e.target.value }
                })}
              />
            </div>
          </div>

          {/* HOS */}
          <div>
            <Label>Hours of Service Remaining (0-11)</Label>
            <Input
              type="number"
              min="0"
              max="11"
              step="0.5"
              value={formData.hos_remaining}
              onChange={(e) => setFormData({...formData, hos_remaining: e.target.value})}
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Internal notes..."
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
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : (driver ? 'Update Driver' : 'Add Driver')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}