import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { X, Save } from "lucide-react";

export default function CreateLoadModal({ load, onSave, onClose, isLoading, mode }) {
  const [formData, setFormData] = useState({
    load_number: '',
    pickup_location: { city: '', state: '', zip: '' },
    dropoff_location: { city: '', state: '', zip: '' },
    pickup_date: '',
    delivery_date: '',
    commodity: '',
    weight: '',
    equipment_type: 'dry_van',
    customer_rate: '',
    carrier_pay: '',
    carrier_payment_structure: 'percentage',
    distance_miles: '',
    special_instructions: '',
    priority: 'medium'
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  useEffect(() => {
    if (load) {
      setFormData({
        load_number: load.load_number || '',
        pickup_location: load.pickup_location || { city: '', state: '', zip: '' },
        dropoff_location: load.dropoff_location || { city: '', state: '', zip: '' },
        pickup_date: load.pickup_date || '',
        delivery_date: load.delivery_date || '',
        commodity: load.commodity || '',
        weight: load.weight || '',
        equipment_type: load.equipment_type || 'dry_van',
        customer_rate: load.customer_rate || '',
        carrier_pay: load.carrier_pay || '',
        carrier_payment_structure: load.carrier_payment_structure || 'percentage',
        distance_miles: load.distance_miles || '',
        special_instructions: load.special_instructions || '',
        priority: load.priority || 'medium'
      });
    }
  }, [load]);

  const calculateCarrierPay = () => {
    const customerRate = parseFloat(formData.customer_rate) || 0;
    const structure = formData.carrier_payment_structure;
    
    if (mode === 'broker' && customerRate > 0) {
      if (structure === 'percentage') {
        return customerRate * 0.82;
      } else if (structure === 'per_load') {
        return customerRate * 0.80;
      } else if (structure === 'per_mile') {
        const miles = parseFloat(formData.distance_miles) || 1;
        return (customerRate * 0.82) / miles;
      }
    }
    return '';
  };

  useEffect(() => {
    if (formData.customer_rate && !formData.carrier_pay && mode === 'broker') {
      const calculatedPay = calculateCarrierPay();
      if (calculatedPay) {
        setFormData(prev => ({ ...prev, carrier_pay: calculatedPay.toFixed(2) }));
      }
    }
  }, [formData.customer_rate, formData.carrier_payment_structure, formData.distance_miles]);

  const margin = mode === 'broker' && formData.customer_rate && formData.carrier_pay
    ? parseFloat(formData.customer_rate) - parseFloat(formData.carrier_pay)
    : 0;

  const handleSubmit = () => {
    onSave({
      ...formData,
      customer_rate: formData.customer_rate ? parseFloat(formData.customer_rate) : null,
      carrier_pay: formData.carrier_pay ? parseFloat(formData.carrier_pay) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      distance_miles: formData.distance_miles ? parseFloat(formData.distance_miles) : null,
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
          
          <div>
            <Label>Load Number</Label>
            <Input
              value={formData.load_number}
              onChange={(e) => setFormData({...formData, load_number: e.target.value})}
              placeholder="Auto-generated if empty"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <h3 className="font-semibold text-emerald-900 mb-3">Pickup Location</h3>
              <div className="space-y-3">
                <div>
                  <Label>City *</Label>
                  <Input
                    value={formData.pickup_location.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      pickup_location: { ...formData.pickup_location, city: e.target.value }
                    })}
                    placeholder="Cleveland"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>State *</Label>
                    <Input
                      value={formData.pickup_location.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        pickup_location: { ...formData.pickup_location, state: e.target.value }
                      })}
                      placeholder="OH"
                    />
                  </div>
                  <div>
                    <Label>ZIP</Label>
                    <Input
                      value={formData.pickup_location.zip}
                      onChange={(e) => setFormData({
                        ...formData,
                        pickup_location: { ...formData.pickup_location, zip: e.target.value }
                      })}
                      placeholder="44101"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <h3 className="font-semibold text-red-900 mb-3">Dropoff Location</h3>
              <div className="space-y-3">
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
                <div className="grid grid-cols-2 gap-2">
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
                  <div>
                    <Label>ZIP</Label>
                    <Input
                      value={formData.dropoff_location.zip}
                      onChange={(e) => setFormData({
                        ...formData,
                        dropoff_location: { ...formData.dropoff_location, zip: e.target.value }
                      })}
                      placeholder="48201"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Pickup Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.pickup_date}
                onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
              />
            </div>
            <div>
              <Label>Delivery Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.delivery_date}
                onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Equipment Type *</Label>
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
              <Label>Commodity</Label>
              <Input
                value={formData.commodity}
                onChange={(e) => setFormData({...formData, commodity: e.target.value})}
                placeholder="General freight"
              />
            </div>
            <div>
              <Label>Weight (lbs)</Label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                placeholder="10000"
              />
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
            <h3 className="font-semibold text-indigo-900 mb-4">Financial Details</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Customer Rate ($)</Label>
                <Input
                  type="number"
                  value={formData.customer_rate}
                  onChange={(e) => setFormData({...formData, customer_rate: e.target.value})}
                  placeholder="1500"
                />
              </div>
              
              {mode === 'broker' && (
                <>
                  <div>
                    <Label>Carrier Payment Type</Label>
                    <Select 
                      value={formData.carrier_payment_structure} 
                      onValueChange={(value) => setFormData({...formData, carrier_payment_structure: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage of Revenue</SelectItem>
                        <SelectItem value="per_load">Flat Rate Per Load</SelectItem>
                        <SelectItem value="per_mile">Rate Per Mile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>
                      Carrier Pay 
                      {formData.carrier_payment_structure === 'percentage' && ' (%)'}
                      {formData.carrier_payment_structure === 'per_mile' && ' ($/mile)'}
                    </Label>
                    <Input
                      type="number"
                      value={formData.carrier_pay}
                      onChange={(e) => setFormData({...formData, carrier_pay: e.target.value})}
                      placeholder={
                        formData.carrier_payment_structure === 'percentage' ? '82' :
                        formData.carrier_payment_structure === 'per_mile' ? '1.50' :
                        '1200'
                      }
                    />
                  </div>
                </>
              )}

              <div>
                <Label>Distance (miles)</Label>
                <Input
                  type="number"
                  value={formData.distance_miles}
                  onChange={(e) => setFormData({...formData, distance_miles: e.target.value})}
                  placeholder="250"
                />
              </div>
            </div>

            {mode === 'broker' && margin > 0 && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Projected Margin:</span>
                  <span className={`text-xl font-bold ${margin >= (formData.customer_rate * 0.15) ? 'text-emerald-600' : 'text-amber-600'}`}>
                    ${margin.toFixed(2)} ({((margin / formData.customer_rate) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
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

          <div>
            <Label>Special Instructions</Label>
            <Textarea
              value={formData.special_instructions}
              onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}
              placeholder="Any special handling or delivery requirements..."
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