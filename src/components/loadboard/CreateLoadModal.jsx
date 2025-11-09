import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, CheckCircle, AlertCircle } from "lucide-react";
import AddressValidator from "../usps/AddressValidator";

export default function CreateLoadModal({ load, onSave, onClose, isLoading, mode }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [showPickupValidator, setShowPickupValidator] = useState(false);
  const [showDeliveryValidator, setShowDeliveryValidator] = useState(false);
  
  const [formData, setFormData] = useState(load || {
    load_number: '',
    pickup_location: { address: '', city: '', state: '', zip: '', validated: false },
    dropoff_location: { address: '', city: '', state: '', zip: '', validated: false },
    pickup_date: '',
    delivery_date: '',
    equipment_type: 'dry_van',
    commodity: '',
    weight: '',
    customer_rate: '',
    carrier_pay: mode === 'broker' ? '' : undefined,
    distance_miles: '',
    special_instructions: ''
  });

  const handlePickupValidated = (validatedAddress) => {
    setFormData({
      ...formData,
      pickup_location: {
        address: validatedAddress.streetAddress,
        secondary: validatedAddress.secondaryAddress,
        city: validatedAddress.city,
        state: validatedAddress.state,
        zip: validatedAddress.zip,
        zipPlus4: validatedAddress.zipPlus4,
        validated: true,
        dpvConfirmed: validatedAddress.dpvConfirmed
      }
    });
    setShowPickupValidator(false);
  };

  const handleDeliveryValidated = (validatedAddress) => {
    setFormData({
      ...formData,
      dropoff_location: {
        address: validatedAddress.streetAddress,
        secondary: validatedAddress.secondaryAddress,
        city: validatedAddress.city,
        state: validatedAddress.state,
        zip: validatedAddress.zip,
        zipPlus4: validatedAddress.zipPlus4,
        validated: true,
        dpvConfirmed: validatedAddress.dpvConfirmed
      }
    });
    setShowDeliveryValidator(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-slate-900">
            {load ? 'Edit Load' : 'Create New Load'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pickup">
                Pickup Location
                {formData.pickup_location?.validated && (
                  <CheckCircle className="w-3 h-3 ml-1 text-emerald-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="delivery">
                Delivery Location
                {formData.dropoff_location?.validated && (
                  <CheckCircle className="w-3 h-3 ml-1 text-emerald-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="details">Load Details</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Load Number</Label>
                  <Input
                    value={formData.load_number}
                    onChange={(e) => setFormData({...formData, load_number: e.target.value})}
                    placeholder="Auto-generated if blank"
                    className="mt-2"
                  />
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
            </TabsContent>

            {/* Pickup Location Tab */}
            <TabsContent value="pickup" className="space-y-4">
              {formData.pickup_location?.validated ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-emerald-900">Validated Pickup Address</h3>
                    </div>
                    {formData.pickup_location.dpvConfirmed && (
                      <Badge className="bg-blue-100 text-blue-800">DPV ✓</Badge>
                    )}
                  </div>
                  <div className="text-sm text-slate-900">
                    <p className="font-semibold">{formData.pickup_location.address}</p>
                    {formData.pickup_location.secondary && (
                      <p>{formData.pickup_location.secondary}</p>
                    )}
                    <p>
                      {formData.pickup_location.city}, {formData.pickup_location.state} {formData.pickup_location.zip}
                      {formData.pickup_location.zipPlus4 && `-${formData.pickup_location.zipPlus4}`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowPickupValidator(true)}
                    variant="outline"
                    className="mt-3"
                  >
                    Re-validate Address
                  </Button>
                </div>
              ) : showPickupValidator ? (
                <AddressValidator
                  onValidAddress={handlePickupValidated}
                  initialAddress={{
                    streetAddress: formData.pickup_location?.address,
                    city: formData.pickup_location?.city,
                    state: formData.pickup_location?.state,
                    ZIPCode: formData.pickup_location?.zip
                  }}
                />
              ) : (
                <>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900">Address Not Validated</p>
                      <p className="text-sm text-amber-800">Validate address to ensure accurate delivery and reduce errors</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Street Address</Label>
                      <Input
                        value={formData.pickup_location?.address || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          pickup_location: {...formData.pickup_location, address: e.target.value}
                        })}
                        placeholder="123 Main Street"
                        className="mt-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>City</Label>
                        <Input
                          value={formData.pickup_location?.city || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            pickup_location: {...formData.pickup_location, city: e.target.value}
                          })}
                          placeholder="Los Angeles"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input
                          value={formData.pickup_location?.state || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            pickup_location: {...formData.pickup_location, state: e.target.value}
                          })}
                          placeholder="CA"
                          maxLength={2}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>ZIP Code</Label>
                      <Input
                        value={formData.pickup_location?.zip || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          pickup_location: {...formData.pickup_location, zip: e.target.value}
                        })}
                        placeholder="90210"
                        maxLength={5}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setShowPickupValidator(true)}
                    className="w-full bg-blue-600 text-white"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Validate Pickup Address with USPS
                  </Button>
                </>
              )}
            </TabsContent>

            {/* Delivery Location Tab */}
            <TabsContent value="delivery" className="space-y-4">
              {formData.dropoff_location?.validated ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-emerald-900">Validated Delivery Address</h3>
                    </div>
                    {formData.dropoff_location.dpvConfirmed && (
                      <Badge className="bg-blue-100 text-blue-800">DPV ✓</Badge>
                    )}
                  </div>
                  <div className="text-sm text-slate-900">
                    <p className="font-semibold">{formData.dropoff_location.address}</p>
                    {formData.dropoff_location.secondary && (
                      <p>{formData.dropoff_location.secondary}</p>
                    )}
                    <p>
                      {formData.dropoff_location.city}, {formData.dropoff_location.state} {formData.dropoff_location.zip}
                      {formData.dropoff_location.zipPlus4 && `-${formData.dropoff_location.zipPlus4}`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowDeliveryValidator(true)}
                    variant="outline"
                    className="mt-3"
                  >
                    Re-validate Address
                  </Button>
                </div>
              ) : showDeliveryValidator ? (
                <AddressValidator
                  onValidAddress={handleDeliveryValidated}
                  initialAddress={{
                    streetAddress: formData.dropoff_location?.address,
                    city: formData.dropoff_location?.city,
                    state: formData.dropoff_location?.state,
                    ZIPCode: formData.dropoff_location?.zip
                  }}
                />
              ) : (
                <>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900">Address Not Validated</p>
                      <p className="text-sm text-amber-800">Validate address to ensure accurate delivery and reduce errors</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Street Address</Label>
                      <Input
                        value={formData.dropoff_location?.address || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          dropoff_location: {...formData.dropoff_location, address: e.target.value}
                        })}
                        placeholder="456 Delivery Ave"
                        className="mt-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>City</Label>
                        <Input
                          value={formData.dropoff_location?.city || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            dropoff_location: {...formData.dropoff_location, city: e.target.value}
                          })}
                          placeholder="Phoenix"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input
                          value={formData.dropoff_location?.state || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            dropoff_location: {...formData.dropoff_location, state: e.target.value}
                          })}
                          placeholder="AZ"
                          maxLength={2}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>ZIP Code</Label>
                      <Input
                        value={formData.dropoff_location?.zip || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          dropoff_location: {...formData.dropoff_location, zip: e.target.value}
                        })}
                        placeholder="85001"
                        maxLength={5}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setShowDeliveryValidator(true)}
                    className="w-full bg-blue-600 text-white"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Validate Delivery Address with USPS
                  </Button>
                </>
              )}
            </TabsContent>

            {/* Load Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Commodity</Label>
                  <Input
                    value={formData.commodity}
                    onChange={(e) => setFormData({...formData, commodity: e.target.value})}
                    placeholder="General Freight"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Weight (lbs)</Label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="10000"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer Rate</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.customer_rate}
                    onChange={(e) => setFormData({...formData, customer_rate: e.target.value})}
                    placeholder="1500.00"
                    className="mt-2"
                  />
                </div>
                {mode === 'broker' && (
                  <div>
                    <Label>Carrier Pay</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.carrier_pay}
                      onChange={(e) => setFormData({...formData, carrier_pay: e.target.value})}
                      placeholder="1200.00"
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Special Instructions</Label>
                <textarea
                  value={formData.special_instructions}
                  onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}
                  placeholder="Any special handling instructions..."
                  className="w-full mt-2 px-3 py-2 border rounded-lg h-24"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-emerald-600 text-white">
              {isLoading ? 'Saving...' : (load ? 'Update Load' : 'Create Load')}
            </Button>
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>

          {/* Validation Warning */}
          {(!formData.pickup_location?.validated || !formData.dropoff_location?.validated) && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <p className="text-sm text-amber-800">
                ⚠️ Addresses not validated. Consider validating for better accuracy.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}