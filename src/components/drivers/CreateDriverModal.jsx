import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, CheckCircle, AlertCircle } from "lucide-react";
import AddressValidator from "../usps/AddressValidator";

export default function CreateDriverModal({ driver, onSave, onClose, isLoading }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [showAddressValidator, setShowAddressValidator] = useState(false);
  
  const [formData, setFormData] = useState(driver || {
    full_name: '',
    email: '',
    phone: '',
    cdl_number: '',
    cdl_expiration: '',
    home_terminal: {
      city: '',
      state: '',
      validated: false
    },
    payment_structure: 'per_load',
    payment_rate: '',
    status: 'available'
  });

  const handleAddressValidated = (validatedAddress) => {
    setFormData({
      ...formData,
      home_terminal: {
        street: validatedAddress.streetAddress,
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
            {driver ? 'Edit Driver' : 'Add New Driver'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="terminal">
                Home Terminal
                {formData.home_terminal?.validated && (
                  <CheckCircle className="w-3 h-3 ml-1 text-emerald-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="John Doe"
                  className="mt-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john.doe@example.com"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CDL Number *</Label>
                  <Input
                    value={formData.cdl_number}
                    onChange={(e) => setFormData({...formData, cdl_number: e.target.value})}
                    placeholder="CDL123456"
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label>CDL Expiration *</Label>
                  <Input
                    type="date"
                    value={formData.cdl_expiration}
                    onChange={(e) => setFormData({...formData, cdl_expiration: e.target.value})}
                    className="mt-2"
                    required
                  />
                </div>
              </div>
            </TabsContent>

            {/* Home Terminal Tab */}
            <TabsContent value="terminal" className="space-y-4">
              {formData.home_terminal?.validated ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-emerald-900">Validated Home Terminal</h3>
                    </div>
                    {formData.home_terminal.dpvConfirmed && (
                      <Badge className="bg-blue-100 text-blue-800">DPV ✓</Badge>
                    )}
                  </div>
                  <div className="text-sm text-slate-900">
                    {formData.home_terminal.street && (
                      <p className="font-semibold">{formData.home_terminal.street}</p>
                    )}
                    <p>
                      {formData.home_terminal.city}, {formData.home_terminal.state}
                      {formData.home_terminal.zip && ` ${formData.home_terminal.zip}`}
                      {formData.home_terminal.zipPlus4 && `-${formData.home_terminal.zipPlus4}`}
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
                    city: formData.home_terminal?.city,
                    state: formData.home_terminal?.state
                  }}
                />
              ) : (
                <>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900">Home Terminal Not Validated</p>
                      <p className="text-sm text-amber-800">Validate address for accurate route planning</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>City</Label>
                      <Input
                        value={formData.home_terminal?.city || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          home_terminal: {...formData.home_terminal, city: e.target.value}
                        })}
                        placeholder="Dallas"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        value={formData.home_terminal?.state || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          home_terminal: {...formData.home_terminal, state: e.target.value}
                        })}
                        placeholder="TX"
                        maxLength={2}
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
                    Validate Home Terminal with USPS
                  </Button>
                </>
              )}
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-4">
              <div>
                <Label>Payment Structure *</Label>
                <select
                  value={formData.payment_structure}
                  onChange={(e) => setFormData({...formData, payment_structure: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border rounded-lg"
                >
                  <option value="percentage">Percentage</option>
                  <option value="per_mile">Per Mile</option>
                  <option value="per_load">Per Load</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>

              <div>
                <Label>Payment Rate *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.payment_rate}
                  onChange={(e) => setFormData({...formData, payment_rate: e.target.value})}
                  placeholder="0.45"
                  className="mt-2"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.payment_structure === 'percentage' && '% of revenue'}
                  {formData.payment_structure === 'per_mile' && '$ per mile'}
                  {formData.payment_structure === 'per_load' && '$ per load'}
                  {formData.payment_structure === 'hourly' && '$ per hour'}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-emerald-600 text-white">
              {isLoading ? 'Saving...' : (driver ? 'Update Driver' : 'Add Driver')}
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