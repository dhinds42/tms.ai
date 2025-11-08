import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, Truck, DollarSign } from "lucide-react";

export default function ShipperLoadForm({ onSubmit, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    pickup_location: { address: '', city: '', state: '', zip: '' },
    dropoff_location: { address: '', city: '', state: '', zip: '' },
    pickup_date: '',
    pickup_time_window_start: '',
    pickup_time_window_end: '',
    delivery_date: '',
    delivery_time_window_start: '',
    delivery_time_window_end: '',
    commodity: '',
    weight: '',
    equipment_type: 'dry_van',
    customer_rate: '',
    special_instructions: '',
    accessorials: [],
    priority: 'medium',
    temperature_controlled: false,
    hazmat: false,
    dimensions: { length: '', width: '', height: '' }
  });

  const accessorialOptions = [
    'liftgate', 'inside_delivery', 'residential', 'appointment',
    'lumper', 'detention', 'layover', 'tarp', 'team_service'
  ];

  const toggleAccessorial = (acc) => {
    setFormData(prev => ({
      ...prev,
      accessorials: prev.accessorials.includes(acc)
        ? prev.accessorials.filter(a => a !== acc)
        : [...prev.accessorials, acc]
    }));
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      customer_rate: formData.customer_rate ? parseFloat(formData.customer_rate) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Post New Load
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-1">
            Fill in shipment details and we'll match you with qualified carriers
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* Locations */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 bg-emerald-50 rounded-xl border-2 border-emerald-200">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-emerald-900">Pickup Information</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Address *</Label>
                  <Input
                    value={formData.pickup_location.address}
                    onChange={(e) => setFormData({
                      ...formData,
                      pickup_location: { ...formData.pickup_location, address: e.target.value }
                    })}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>City *</Label>
                    <Input
                      value={formData.pickup_location.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        pickup_location: { ...formData.pickup_location, city: e.target.value }
                      })}
                      placeholder="Chicago"
                    />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Input
                      value={formData.pickup_location.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        pickup_location: { ...formData.pickup_location, state: e.target.value }
                      })}
                      placeholder="IL"
                    />
                  </div>
                </div>
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.pickup_date}
                    onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Window Start</Label>
                    <Input
                      type="time"
                      value={formData.pickup_time_window_start}
                      onChange={(e) => setFormData({...formData, pickup_time_window_start: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Window End</Label>
                    <Input
                      type="time"
                      value={formData.pickup_time_window_end}
                      onChange={(e) => setFormData({...formData, pickup_time_window_end: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-red-50 rounded-xl border-2 border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Delivery Information</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Address *</Label>
                  <Input
                    value={formData.dropoff_location.address}
                    onChange={(e) => setFormData({
                      ...formData,
                      dropoff_location: { ...formData.dropoff_location, address: e.target.value }
                    })}
                    placeholder="456 Oak Ave"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>City *</Label>
                    <Input
                      value={formData.dropoff_location.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        dropoff_location: { ...formData.dropoff_location, city: e.target.value }
                      })}
                      placeholder="Detroit"
                    />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Input
                      value={formData.dropoff_location.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        dropoff_location: { ...formData.dropoff_location, state: e.target.value }
                      })}
                      placeholder="MI"
                    />
                  </div>
                </div>
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Window Start</Label>
                    <Input
                      type="time"
                      value={formData.delivery_time_window_start}
                      onChange={(e) => setFormData({...formData, delivery_time_window_start: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Window End</Label>
                    <Input
                      type="time"
                      value={formData.delivery_time_window_end}
                      onChange={(e) => setFormData({...formData, delivery_time_window_end: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Freight Details */}
          <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Freight Details</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Commodity *</Label>
                <Input
                  value={formData.commodity}
                  onChange={(e) => setFormData({...formData, commodity: e.target.value})}
                  placeholder="Electronics"
                />
              </div>
              <div>
                <Label>Weight (lbs) *</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="20000"
                />
              </div>
              <div>
                <Label>Equipment Type *</Label>
                <Select value={formData.equipment_type} onValueChange={(value) => setFormData({...formData, equipment_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dry_van">Dry Van</SelectItem>
                    <SelectItem value="reefer">Reefer</SelectItem>
                    <SelectItem value="flatbed">Flatbed</SelectItem>
                    <SelectItem value="step_deck">Step Deck</SelectItem>
                    <SelectItem value="lowboy">Lowboy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <Label>Length (ft)</Label>
                <Input
                  type="number"
                  value={formData.dimensions.length}
                  onChange={(e) => setFormData({
                    ...formData,
                    dimensions: { ...formData.dimensions, length: e.target.value }
                  })}
                  placeholder="48"
                />
              </div>
              <div>
                <Label>Width (ft)</Label>
                <Input
                  type="number"
                  value={formData.dimensions.width}
                  onChange={(e) => setFormData({
                    ...formData,
                    dimensions: { ...formData.dimensions, width: e.target.value }
                  })}
                  placeholder="8"
                />
              </div>
              <div>
                <Label>Height (ft)</Label>
                <Input
                  type="number"
                  value={formData.dimensions.height}
                  onChange={(e) => setFormData({
                    ...formData,
                    dimensions: { ...formData.dimensions, height: e.target.value }
                  })}
                  placeholder="8"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.temperature_controlled}
                  onChange={(e) => setFormData({...formData, temperature_controlled: e.target.checked})}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-slate-700">Temperature Controlled</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hazmat}
                  onChange={(e) => setFormData({...formData, hazmat: e.target.checked})}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-slate-700">Hazmat</span>
              </label>
            </div>
          </div>

          {/* Rate & Accessorials */}
          <div className="p-5 bg-indigo-50 rounded-xl border-2 border-indigo-200">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-indigo-900">Rate & Additional Services</h3>
            </div>
            <div className="mb-4">
              <Label>Your Rate ($) *</Label>
              <Input
                type="number"
                value={formData.customer_rate}
                onChange={(e) => setFormData({...formData, customer_rate: e.target.value})}
                placeholder="1500"
              />
            </div>
            <div>
              <Label className="mb-2 block">Accessorials</Label>
              <div className="grid grid-cols-3 gap-2">
                {accessorialOptions.map((acc) => (
                  <div
                    key={acc}
                    onClick={() => toggleAccessorial(acc)}
                    className={`p-2 rounded-lg border-2 cursor-pointer text-center transition-all ${
                      formData.accessorials.includes(acc)
                        ? 'bg-indigo-100 border-indigo-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-medium capitalize">
                      {acc.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <Label>Special Instructions</Label>
            <Textarea
              value={formData.special_instructions}
              onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}
              placeholder="Loading dock instructions, contact information, etc..."
              rows={3}
            />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            {isLoading ? 'Posting...' : 'Post Load'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}