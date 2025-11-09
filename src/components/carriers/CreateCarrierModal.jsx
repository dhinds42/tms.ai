import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, CheckCircle, AlertCircle } from "lucide-react";
import AddressValidator from "../usps/AddressValidator";

export default function CreateCarrierModal({ carrier, onSave, onClose, isLoading }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [showAddressValidator, setShowAddressValidator] = useState(false);
  
  const [formData, setFormData] = useState(carrier || {
    company_name: '',
    mc_number: '',
    dot_number: '',
    contact_name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      validated: false
    },
    equipment_types: [],
    insurance_expiration: '',
    status: 'pending_approval'
  });

  const handleAddressValidated = (validatedAddress) => {
    setFormData({
      ...formData,
      address: {
        street: validatedAddress.streetAddress,
        secondary: validatedAddress.secondaryAddress,
        city: validatedAddress.city,
        state: validatedAddress.state,
        zip: validatedAddress.zip,
        zipPlus4: validatedAddress.zipPlus4,
        validated: true,
        dpvConfirmed: validatedAddress.dpvConfirmed
      }
    });
    setShowAddressValidator(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-slate-900">
            {carrier ? 'Edit Carrier' : 'Add New Carrier'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="address">
                Terminal Address
                {formData.address?.validated && (
                  <CheckCircle className="w-3 h-3 ml-1 text-emerald-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label>Company Name *</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  placeholder="ABC Trucking Inc"
                  className="mt-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>MC Number *</Label>
                  <Input
                    value={formData.mc_number}
                    onChange={(e) => setFormData({...formData, mc_number: e.target.value})}
                    placeholder="MC123456"
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label>DOT Number *</Label>
                  <Input
                    value={formData.dot_number}
                    onChange={(e) => setFormData({...formData, dot_number: e.target.value})}
                    placeholder="DOT123456"
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact Name *</Label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                    placeholder="John Doe"
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="dispatch@abctrucking.com"
                  className="mt-2"
                  required
                />
              </div>
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="space-y-4">
              {formData.address?.validated ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-emerald-900">Validated Terminal Address</h3>
                    </div>
                    {formData.address.dpvConfirmed && (
                      <Badge className="bg-blue-100 text-blue-800">DPV ✓</Badge>
                    )}
                  </div>
                  <div className="text-sm text-slate-900">
                    <p className="font-semibold">{formData.address.street}</p>
                    {formData.address.secondary && (
                      <p>{formData.address.secondary}</p>
                    )}
                    <p>
                      {formData.address.city}, {formData.address.state} {formData.address.zip}
                      {formData.address.zipPlus4 && `-${formData.address.zipPlus4}`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowAddressValidator(true)}
                    variant="outline"
                    className="mt-3"
                  >
                    Re-validate Address
                  </Button>
                </div>
              ) : showAddressValidator ? (
                <AddressValidator
                  onValidAddress={handleAddressValidated}
                  initialAddress={{
                    firm: formData.company_name,
                    streetAddress: formData.address?.street,
                    city: formData.address?.city,
                    state: formData.address?.state,
                    ZIPCode: formData.address?.zip
                  }}
                />
              ) : (
                <>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900">Terminal Address Not Validated</p>
                      <p className="text-sm text-amber-800">Validate address for accurate routing and communication</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Terminal Street Address</Label>
                      <Input
                        value={formData.address?.street || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: {...formData.address, street: e.target.value}
                        })}
                        placeholder="789 Terminal Drive"
                        className="mt-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>City</Label>
                        <Input
                          value={formData.address?.city || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            address: {...formData.address, city: e.target.value}
                          })}
                          placeholder="Dallas"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input
                          value={formData.address?.state || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            address: {...formData.address, state: e.target.value}
                          })}
                          placeholder="TX"
                          maxLength={2}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>ZIP Code</Label>
                      <Input
                        value={formData.address?.zip || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: {...formData.address, zip: e.target.value}
                        })}
                        placeholder="75201"
                        maxLength={5}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setShowAddressValidator(true)}
                    className="w-full bg-blue-600 text-white"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Validate Terminal Address with USPS
                  </Button>
                </>
              )}
            </TabsContent>

            {/* Equipment Tab */}
            <TabsContent value="equipment" className="space-y-4">
              <div>
                <Label>Equipment Types</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['dry_van', 'reefer', 'flatbed', 'step_deck'].map(type => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.equipment_types?.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...(formData.equipment_types || []), type]
                            : formData.equipment_types?.filter(t => t !== type);
                          setFormData({...formData, equipment_types: newTypes});
                        }}
                      />
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Insurance Expiration</Label>
                <Input
                  type="date"
                  value={formData.insurance_expiration}
                  onChange={(e) => setFormData({...formData, insurance_expiration: e.target.value})}
                  className="mt-2"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-emerald-600 text-white">
              {isLoading ? 'Saving...' : (carrier ? 'Update Carrier' : 'Add Carrier')}
            </Button>
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>

          {/* Validation Warning */}
          {!formData.address?.validated && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <p className="text-sm text-amber-800">
                ⚠️ Terminal address not validated. Consider validating for better accuracy.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}