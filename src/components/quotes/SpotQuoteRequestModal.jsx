import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Zap, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import AddressValidator from "../usps/AddressValidator";

export default function SpotQuoteRequestModal({ onSubmit, onClose, isLoading }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [showPickupValidator, setShowPickupValidator] = useState(false);
  const [showDeliveryValidator, setShowDeliveryValidator] = useState(false);
  
  const [formData, setFormData] = useState({
    mode: 'FTL',
    pickup_location: { address: '', city: '', state: '', zip: '', validated: false },
    dropoff_location: { address: '', city: '', state: '', zip: '', validated: false },
    pickup_date: '',
    delivery_date: '',
    commodity: '',
    weight: '',
    equipment_type: 'dry_van',
    special_requirements: '',
    requested_rate: '',
    urgency: 'standard'
  });

  const handlePickupValidated = (validatedAddress) => {
    setFormData({
      ...formData,
      pickup_location: {
        address: validatedAddress.streetAddress,
        city: validatedAddress.city,
        state: validatedAddress.state,
        zip: validatedAddress.zip,
        zipPlus4: validatedAddress.zipPlus4,
        validated: true
      }
    });
    setShowPickupValidator(false);
  };

  const handleDeliveryValidated = (validatedAddress) => {
    setFormData({
      ...formData,
      dropoff_location: {
        address: validatedAddress.streetAddress,
        city: validatedAddress.city,
        state: validatedAddress.state,
        zip: validatedAddress.zip,
        zipPlus4: validatedAddress.zipPlus4,
        validated: true
      }
    });
    setShowDeliveryValidator(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quote_number: `SPOT-${Date.now()}`,
      status: 'pending'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Request Spot Freight Quote</h2>
              <p className="text-indigo-100 text-sm">Get competitive rates from carriers quickly</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pickup">
                Pickup
                {formData.pickup_location?.validated && (
                  <CheckCircle className="w-3 h-3 ml-1 text-emerald-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="delivery">
                Delivery
                {formData.dropoff_location?.validated && (
                  <CheckCircle className="w-3 h-3 ml-1 text-emerald-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mode *</Label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({...formData, mode: e.target.value})}
                    className="w-full mt-2 px-3 py-2 border rounded-lg"
                  >
                    <option value="FTL">FTL (Full Truckload)</option>
                    <option value="LTL">LTL (Less Than Truckload)</option>
                    <option value="Intermodal">Intermodal</option>
                    <option value="Drayage">Drayage</option>
                  </select>
                </div>
                <div>
                  <Label>Equipment Type *</Label>
                  <select
                    value={formData.equipment_type}
                    onChange={(e) => setFormData({...formData, equipment_type: e.target.value})}
                    className="w-full mt-2 px-3 py-2 border rounded-lg"
                  >
                    <option value="dry_van">Dry Van</option>
                    <option value="reefer">Reefer</option>
                    <option value="flatbed">Flatbed</option>
                    <option value="step_deck">Step Deck</option>
                    <option value="lowboy">Lowboy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pickup Date *</Label>
                  <Input
                    type="date"
                    value={formData.pickup_date}
                    onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label>Delivery Date</Label>
                  <Input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Urgency *</Label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border rounded-lg"
                >
                  <option value="standard">Standard (24-48 hours)</option>
                  <option value="urgent">Urgent (4-12 hours)</option>
                  <option value="immediate">Immediate (ASAP)</option>
                </select>
              </div>
            </TabsContent>

            {/* Pickup Tab */}
            <TabsContent value="pickup" className="space-y-4">
              {formData.pickup_location?.validated ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-emerald-900">Validated Pickup Address</h3>
                  </div>
                  <div className="text-sm text-slate-900">
                    <p className="font-semibold">{formData.pickup_location.address}</p>
                    <p>{formData.pickup_location.city}, {formData.pickup_location.state} {formData.pickup_location.zip}</p>
                  </div>
                  <Button type="button" onClick={() => setShowPickupValidator(true)} variant="outline" className="mt-3">
                    Re-validate
                  </Button>
                </div>
              ) : showPickupValidator ? (
                <AddressValidator onValidAddress={handlePickupValidated} />
              ) : (
                <>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900">Address Not Validated</p>
                      <p className="text-sm text-amber-800">Validate for accurate quotes</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Input
                      placeholder="Street Address"
                      value={formData.pickup_location?.address || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        pickup_location: {...formData.pickup_location, address: e.target.value}
                      })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="City"
                        value={formData.pickup_location?.city || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          pickup_location: {...formData.pickup_location, city: e.target.value}
                        })}
                      />
                      <Input
                        placeholder="State"
                        value={formData.pickup_location?.state || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          pickup_location: {...formData.pickup_location, state: e.target.value}
                        })}
                        maxLength={2}
                      />
                    </div>
                    <Input
                      placeholder="ZIP Code"
                      value={formData.pickup_location?.zip || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        pickup_location: {...formData.pickup_location, zip: e.target.value}
                      })}
                      maxLength={5}
                    />
                  </div>
                  <Button type="button" onClick={() => setShowPickupValidator(true)} className="w-full bg-blue-600 text-white">
                    <MapPin className="w-4 h-4 mr-2" />
                    Validate Pickup with USPS
                  </Button>
                </>
              )}
            </TabsContent>

            {/* Delivery Tab */}
            <TabsContent value="delivery" className="space-y-4">
              {formData.dropoff_location?.validated ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-emerald-900">Validated Delivery Address</h3>
                  </div>
                  <div className="text-sm text-slate-900">
                    <p className="font-semibold">{formData.dropoff_location.address}</p>
                    <p>{formData.dropoff_location.city}, {formData.dropoff_location.state} {formData.dropoff_location.zip}</p>
                  </div>
                  <Button type="button" onClick={() => setShowDeliveryValidator(true)} variant="outline" className="mt-3">
                    Re-validate
                  </Button>
                </div>
              ) : showDeliveryValidator ? (
                <AddressValidator onValidAddress={handleDeliveryValidated} />
              ) : (
                <>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900">Address Not Validated</p>
                      <p className="text-sm text-amber-800">Validate for accurate quotes</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Input
                      placeholder="Street Address"
                      value={formData.dropoff_location?.address || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        dropoff_location: {...formData.dropoff_location, address: e.target.value}
                      })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="City"
                        value={formData.dropoff_location?.city || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          dropoff_location: {...formData.dropoff_location, city: e.target.value}
                        })}
                      />
                      <Input
                        placeholder="State"
                        value={formData.dropoff_location?.state || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          dropoff_location: {...formData.dropoff_location, state: e.target.value}
                        })}
                        maxLength={2}
                      />
                    </div>
                    <Input
                      placeholder="ZIP Code"
                      value={formData.dropoff_location?.zip || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        dropoff_location: {...formData.dropoff_location, zip: e.target.value}
                      })}
                      maxLength={5}
                    />
                  </div>
                  <Button type="button" onClick={() => setShowDeliveryValidator(true)} className="w-full bg-blue-600 text-white">
                    <MapPin className="w-4 h-4 mr-2" />
                    Validate Delivery with USPS
                  </Button>
                </>
              )}
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Commodity *</Label>
                  <Input
                    value={formData.commodity}
                    onChange={(e) => setFormData({...formData, commodity: e.target.value})}
                    placeholder="General Freight"
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label>Weight (lbs) *</Label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="10000"
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Requested Rate (Optional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.requested_rate}
                  onChange={(e) => setFormData({...formData, requested_rate: e.target.value})}
                  placeholder="Target rate for carrier bids"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Special Requirements</Label>
                <textarea
                  value={formData.special_requirements}
                  onChange={(e) => setFormData({...formData, special_requirements: e.target.value})}
                  placeholder="Any special handling, equipment needs, or instructions..."
                  className="w-full mt-2 px-3 py-2 border rounded-lg h-24"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              {isLoading ? 'Submitting...' : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Request Spot Quote
                </>
              )}
            </Button>
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}