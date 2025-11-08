import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { X, Save } from "lucide-react";

export default function QuoteForm({ quote, onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    quote_number: '',
    mode: 'FTL',
    pickup_location: { city: '', state: '', zip: '' },
    dropoff_location: { city: '', state: '', zip: '' },
    pickup_date: '',
    delivery_date: '',
    commodity: '',
    weight: '',
    equipment_type: 'dry_van',
    quoted_rate: '',
    estimated_cost: '',
    fuel_surcharge: '',
    valid_until: '',
    special_requirements: '',
    accessorials: []
  });

  useEffect(() => {
    if (quote) {
      setFormData({
        quote_number: quote.quote_number || '',
        mode: quote.mode || 'FTL',
        pickup_location: quote.pickup_location || { city: '', state: '', zip: '' },
        dropoff_location: quote.dropoff_location || { city: '', state: '', zip: '' },
        pickup_date: quote.pickup_date || '',
        delivery_date: quote.delivery_date || '',
        commodity: quote.commodity || '',
        weight: quote.weight || '',
        equipment_type: quote.equipment_type || 'dry_van',
        quoted_rate: quote.quoted_rate || '',
        estimated_cost: quote.estimated_cost || '',
        fuel_surcharge: quote.fuel_surcharge || '',
        valid_until: quote.valid_until || '',
        special_requirements: quote.special_requirements || '',
        accessorials: quote.accessorials || []
      });
    }
  }, [quote]);

  const margin = formData.quoted_rate && formData.estimated_cost
    ? parseFloat(formData.quoted_rate) - parseFloat(formData.estimated_cost)
    : 0;

  const marginPct = formData.quoted_rate && margin > 0
    ? (margin / parseFloat(formData.quoted_rate)) * 100
    : 0;

  const handleSubmit = () => {
    onSave({
      ...formData,
      quoted_rate: formData.quoted_rate ? parseFloat(formData.quoted_rate) : null,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      fuel_surcharge: formData.fuel_surcharge ? parseFloat(formData.fuel_surcharge) : null,
      margin: margin > 0 ? margin : null,
      margin_percentage: marginPct > 0 ? marginPct : null
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {quote ? 'Edit Quote' : 'Create New Quote'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Quote Number</Label>
              <Input
                value={formData.quote_number}
                onChange={(e) => setFormData({...formData, quote_number: e.target.value})}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div>
              <Label>Transportation Mode *</Label>
              <Select value={formData.mode} onValueChange={(value) => setFormData({...formData, mode: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FTL">FTL (Full Truckload)</SelectItem>
                  <SelectItem value="LTL">LTL (Less Than Truckload)</SelectItem>
                  <SelectItem value="Intermodal">Intermodal</SelectItem>
                  <SelectItem value="Courier">Courier</SelectItem>
                  <SelectItem value="Drayage">Drayage</SelectItem>
                  <SelectItem value="Air">Air Freight</SelectItem>
                  <SelectItem value="Ocean">Ocean Freight</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Pickup Date</Label>
              <Input
                type="datetime-local"
                value={formData.pickup_date}
                onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
              />
            </div>
            <div>
              <Label>Delivery Date</Label>
              <Input
                type="datetime-local"
                value={formData.delivery_date}
                onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Equipment Type</Label>
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
                  <SelectItem value="container">Container</SelectItem>
                  <SelectItem value="box_truck">Box Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Commodity</Label>
              <Input
                value={formData.commodity}
                onChange={(e) => setFormData({...formData, commodity: e.target.value})}
              />
            </div>
            <div>
              <Label>Weight (lbs)</Label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
              />
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
            <h3 className="font-semibold text-indigo-900 mb-4">Pricing</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Quoted Rate ($) *</Label>
                <Input
                  type="number"
                  value={formData.quoted_rate}
                  onChange={(e) => setFormData({...formData, quoted_rate: e.target.value})}
                />
              </div>
              <div>
                <Label>Estimated Cost ($)</Label>
                <Input
                  type="number"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
                />
              </div>
              <div>
                <Label>Fuel Surcharge ($)</Label>
                <Input
                  type="number"
                  value={formData.fuel_surcharge}
                  onChange={(e) => setFormData({...formData, fuel_surcharge: e.target.value})}
                />
              </div>
            </div>

            {margin > 0 && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Expected Margin:</span>
                  <span className="text-xl font-bold text-emerald-600">
                    ${margin.toFixed(2)} ({marginPct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label>Valid Until</Label>
            <Input
              type="date"
              value={formData.valid_until}
              onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
            />
          </div>

          <div>
            <Label>Special Requirements</Label>
            <Textarea
              value={formData.special_requirements}
              onChange={(e) => setFormData({...formData, special_requirements: e.target.value})}
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
            {isLoading ? 'Saving...' : (quote ? 'Update Quote' : 'Create Quote')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}