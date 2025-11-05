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

export default function CreateLoadModal({ load, onSave, onClose, isLoading, mode }) {
  const [formData, setFormData] = useState({
    load_number: '',
    pickup_location: { city: '', state: '', zip: '', address: '' },
    dropoff_location: { city: '', state: '', zip: '', address: '' },
    pickup_date: '',
    delivery_date: '',
    commodity: '',
    weight: '',
    equipment_type: 'cargo_van',
    customer_rate: '',
    carrier_pay: '',
    distance_miles: '',
    rate_per_mile: '',
    special_instructions: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (load) {
      setFormData({
        load_number: load.load_number || '',
        pickup_location: load.pickup_location || { city: '', state: '', zip: '', address: '' },
        dropoff_location: load.dropoff_location || { city: '', state: '', zip: '', address: '' },
        pickup_date: load.pickup_date || '',
        delivery_date: load.delivery_date || '',
        commodity: load.commodity || '',
        weight: load.weight || '',
        equipment_type: load.equipment_type || 'cargo_van',
        customer_rate: load.customer_rate || '',
        carrier_pay: load.carrier_pay || '',
        distance_miles: load.distance_miles || '',
        rate_per_mile: load.rate_per_mile || '',
        special_instructions: load.special_instructions || '',
        priority: load.priority || 'medium'
      });
    }
  }, [load]);

  const handleLocationChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const calculateMargin = () => {
    const customerRate = parseFloat(formData.customer_rate) || 0;
    const carrierPay = parseFloat(formData.carrier_pay) || 0;
    return customerRate - carrierPay;
  };

  const handleSubmit = () => {
    const margin = mode === 'broker' ? calculateMargin() : 0;
    onSave({
      ...formData,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      customer_rate: formData.customer_rate ? parseFloat(formData.customer_rate) : null,
      carrier_pay: formData.carrier_pay ? parseFloat(formData.carrier_pay) : null,
      distance_miles: formData.distance_miles ? parseFloat(formData.distance_miles) : null,
      rate_per_mile: formData.rate_per_mile ? parseFloat(formData.rate_per_mile) : null,
      margin: margin > 0 ? margin : null
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent">
            {load ? 'Edit Load' : 'Create New Load'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Load Number</Label>
              <Input
                value={formData.load_number}
                onChange={(e) => setFormData({...formData, load_number: e.target.value})}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pickup Location */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <h3 className="font-semibold text-emerald-900 mb-3">Pickup Location</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="City"
                value={formData.pickup_location.city}
                onChange={(e) => handleLocationChange('pickup_location', 'city', e.target.value)}
              />
              <Input
                placeholder="State"
                value={formData.pickup_location.state}
                onChange={(e) => handleLocationChange('pickup_location', 'state', e.target.value)}
              />
              <Input
                placeholder="ZIP Code"
                value={formData.pickup_location.zip}
                onChange={(e) => handleLocationChange('pickup_location', 'zip', e.target.value)}
              />
              <Input
                type="datetime-local"
                value={formData.pickup_date}
                onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
              />
            </div>
          </div>

          {/* Dropoff Location */}
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <h3 className="font-semibold text-red-900 mb-3">Dropoff Location</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="City"
                value={formData.dropoff_location.city}
                onChange={(e) => handleLocationChange('dropoff_location', 'city', e.target.value)}
              />
              <Input
                placeholder="State"
                value={formData.dropoff_location.state}
                onChange={(e) => handleLocationChange('dropoff_location', 'state', e.target.value)}
              />
              <Input
                placeholder="ZIP Code"
                value={formData.dropoff_location.zip}
                onChange={(e) => handleLocationChange('dropoff_location', 'zip', e.target.value)}
              />
              <Input
                type="datetime-local"
                value={formData.delivery_date}
                onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
              />
            </div>
          </div>

          {/* Load Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Commodity</Label>
              <Input
                value={formData.commodity}
                onChange={(e) => setFormData({...formData, commodity: e.target.value})}
                placeholder="e.g., Auto parts, Electronics"
              />
            </div>
            <div>
              <Label>Equipment Type</Label>
              <Select value={formData.equipment_type} onValueChange={(value) => setFormData({...formData, equipment_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cargo_van">Cargo Van</SelectItem>
                  <SelectItem value="sprinter">Sprinter</SelectItem>
                  <SelectItem value="box_truck">Box Truck</SelectItem>
                  <SelectItem value="dry_van">Dry Van</SelectItem>
                  <SelectItem value="reefer">Reefer</SelectItem>
                  <SelectItem value="flatbed">Flatbed</SelectItem>
                  <SelectItem value="step_deck">Step Deck</SelectItem>
                  <SelectItem value="lowboy">Lowboy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Weight (lbs)</Label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                placeholder="e.g., 2000"
              />
            </div>
            <div>
              <Label>Distance (miles)</Label>
              <Input
                type="number"
                value={formData.distance_miles}
                onChange={(e) => setFormData({...formData, distance_miles: e.target.value})}
                placeholder="e.g., 350"
              />
            </div>
          </div>

          {/* Financial Details */}
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
            <h3 className="font-semibold text-indigo-900 mb-3">Financial Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer Rate ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.customer_rate}
                  onChange={(e) => setFormData({...formData, customer_rate: e.target.value})}
                  placeholder="e.g., 550.00"
                />
              </div>
              {mode === 'broker' && (
                <div>
                  <Label>Carrier Pay ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.carrier_pay}
                    onChange={(e) => setFormData({...formData, carrier_pay: e.target.value})}
                    placeholder="e.g., 400.00"
                  />
                </div>
              )}
              <div>
                <Label>Rate per Mile ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.rate_per_mile}
                  onChange={(e) => setFormData({...formData, rate_per_mile: e.target.value})}
                  placeholder="e.g., 2.45"
                />
              </div>
              {mode === 'broker' && formData.customer_rate && formData.carrier_pay && (
                <div>
                  <Label>Calculated Margin</Label>
                  <div className="p-2 bg-emerald-100 rounded-lg border border-emerald-300 text-center">
                    <span className="text-lg font-bold text-emerald-700">
                      ${calculateMargin().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <Label>Special Instructions</Label>
            <Textarea
              value={formData.special_instructions}
              onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}
              placeholder="Any special handling, delivery instructions, or notes..."
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
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : (load ? 'Update Load' : 'Create Load')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}