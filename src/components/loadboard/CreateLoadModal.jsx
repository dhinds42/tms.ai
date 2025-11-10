
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, CheckCircle, AlertCircle, Plus, X, Save, FileText } from "lucide-react";
import AddressValidator from "../usps/AddressValidator";
import { base44 } from "@/api/base44Client"; // Updated import path for base44

export default function CreateLoadModal({ load, onSave, onClose, isLoading }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [showPickupValidator, setShowPickupValidator] = useState(false);
  const [showDeliveryValidator, setShowDeliveryValidator] = useState(false);
  const [customEquipment, setCustomEquipment] = useState('');
  const [showCustomEquipment, setShowCustomEquipment] = useState(false);
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  // Load custom equipment types from localStorage
  const [customEquipmentList, setCustomEquipmentList] = useState(() => {
    const saved = localStorage.getItem('custom_equipment_types');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState(load ? {
    // If load exists, use its data and ensure new fields have defaults if missing
    ...load,
    mode: load.mode || operatingMode,
    status: load.status || 'available',
    margin: load.margin || '',
    reference_number: load.reference_number || '',
    generate_rate_con: load.generate_rate_con || false,
    rate_con_format: load.rate_con_format || 'pdf',
    // Ensure nested objects exist, e.g., for location
    pickup_location: load.pickup_location || { address: '', city: '', state: '', zip: '', validated: false },
    dropoff_location: load.dropoff_location || { address: '', city: '', state: '', zip: '', validated: false },
    bill_to: load.bill_to || { company_name: '', country: 'USA', address: '', city: '', state: '', zip: '' },
    contact_person: load.contact_person || { name: '', phone: '', email: '', is_one_time: false },
    accessorial_charges: load.accessorial_charges || []
  } : {
    // If no load, use default values for creating a new load
    load_number: '',
    mode: operatingMode,
    shipment_type: 'truckload',
    status: 'available',
    pickup_location: { address: '', city: '', state: '', zip: '', validated: false },
    dropoff_location: { address: '', city: '', state: '', zip: '', validated: false },
    pickup_date: '',
    delivery_date: '',
    equipment_type: 'dry_van',
    custom_equipment_type: '',
    commodity: '',
    weight: '',
    customer_rate: '',
    carrier_pay: operatingMode === 'broker' ? '' : undefined,
    margin: '',
    distance_miles: '',
    special_instructions: '',
    reference_number: '',
    generate_rate_con: false,
    rate_con_format: 'pdf',
    bill_to: {
      company_name: '',
      country: 'USA',
      address: '',
      city: '',
      state: '',
      zip: ''
    },
    contact_person: {
      name: '',
      phone: '',
      email: '',
      is_one_time: false
    },
    rate_type: 'flat',
    currency: 'USD',
    line_haul_rate: '',
    fuel_rate: '',
    accessorial_charges: []
  });

  // Save custom equipment types to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('custom_equipment_types', JSON.stringify(customEquipmentList));
  }, [customEquipmentList]);

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

  const handleAddCustomEquipment = () => {
    if (customEquipment.trim()) {
      const newEquipment = customEquipment.trim();
      if (!customEquipmentList.includes(newEquipment)) {
        setCustomEquipmentList([...customEquipmentList, newEquipment]);
      }
      setFormData({...formData, custom_equipment_type: newEquipment, equipment_type: 'custom'});
      setCustomEquipment('');
      setShowCustomEquipment(false);
    }
  };

  const handleAddAccessorial = () => {
    setFormData({
      ...formData,
      accessorial_charges: [
        ...formData.accessorial_charges,
        { name: '', amount: 0 }
      ]
    });
  };

  const handleRemoveAccessorial = (index) => {
    setFormData({
      ...formData,
      accessorial_charges: formData.accessorial_charges.filter((_, i) => i !== index)
    });
  };

  const handleAccessorialChange = (index, field, value) => {
    const updated = [...formData.accessorial_charges];
    updated[index][field] = value;
    setFormData({...formData, accessorial_charges: updated});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If rate con generation is not requested, call onSave directly
    if (!formData.generate_rate_con) {
      onSave(formData);
    } else {
      // Otherwise, call the new handler
      handleSaveWithRateCon();
    }
  };

  // NEW: Handler for saving with rate confirmation generation
  const handleSaveWithRateCon = async () => {
    try {
      const user = await base44.auth.me();

      // Save load first
      const savedLoad = await onSave(formData);

      // Generate rate confirmation if requested
      if (formData.generate_rate_con && savedLoad) {
        const { generateDocument, logDocumentAction } = await import('@/utils/documentFormatHandler');

        const result = await generateDocument('rate_confirmation', {
          load_id: savedLoad.id,
          load_data: formData, // Pass formData directly as load_data
          module: 'Load Board',
          feature: 'Rate Confirmation'
        }, formData.rate_con_format);

        if (result.success) {
          // Log generation
          await logDocumentAction({
            documentId: result.document.id,
            documentName: `RateCon_${savedLoad.load_number || savedLoad.id.slice(0, 8)}.${formData.rate_con_format}`,
            documentType: 'rate_confirmation',
            actionType: 'generated',
            actionBy: user.email,
            fileFormat: formData.rate_con_format,
            module: 'Load Board',
            feature: 'Rate Confirmation',
            notes: `Auto-generated with load creation in ${formData.rate_con_format.toUpperCase()} format`,
            loadId: savedLoad.id
          });

          alert(`✅ Load created and Rate Confirmation generated in ${formData.rate_con_format.toUpperCase()} format!`);
        } else {
          console.error('Failed to generate rate confirmation:', result.error);
          alert('❌ Load created, but failed to generate Rate Confirmation.');
        }
      }
    } catch (error) {
      console.error('Error saving load with rate con:', error);
      alert('❌ An error occurred during save or rate confirmation generation.');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {load ? 'Edit Load' : 'Create New Load'}
          </DialogTitle>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 flex-wrap h-auto">
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
              <TabsTrigger value="details">Load Details</TabsTrigger>
              <TabsTrigger value="billing">Billing & Rates</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label>Shipment Type *</Label>
                  <select
                    value={formData.shipment_type}
                    onChange={(e) => setFormData({...formData, shipment_type: e.target.value})}
                    className="w-full mt-2 px-3 py-2 border rounded-lg"
                  >
                    <option value="truckload">Truckload</option>
                    <option value="ltl">LTL</option>
                    <option value="drayage">Drayage</option>
                    <option value="intermodal">Intermodal</option>
                    <option value="expedite">Expedite</option>
                    <option value="multistop">Multistop</option>
                    <option value="package">Package</option>
                    <option value="volume">Volume</option>
                    <option value="empty">Empty</option>
                  </select>
                </div>
                <div>
                  <Label>Equipment Type *</Label>
                  {showCustomEquipment ? (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={customEquipment}
                        onChange={(e) => setCustomEquipment(e.target.value)}
                        placeholder="Enter custom equipment"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomEquipment())}
                      />
                      <Button type="button" onClick={handleAddCustomEquipment} size="sm" className="bg-emerald-600">
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button type="button" onClick={() => setShowCustomEquipment(false)} size="sm" variant="outline">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <select
                        value={formData.equipment_type === 'custom' ? formData.custom_equipment_type : formData.equipment_type}
                        onChange={(e) => {
                          if (e.target.value === 'add_custom') {
                            setShowCustomEquipment(true);
                          } else {
                            setFormData({...formData, equipment_type: e.target.value, custom_equipment_type: ''});
                          }
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="dry_van">Dry Van</option>
                        <option value="reefer">Reefer</option>
                        <option value="flatbed">Flatbed</option>
                        <option value="step_deck">Step Deck</option>
                        <option value="lowboy">Lowboy</option>
                        <option value="cargo_van">Cargo Van</option>
                        <option value="sprinter">Sprinter</option>
                        <option value="box_truck">Box Truck</option>
                        {customEquipmentList.map(eq => (
                          <option key={eq} value={eq}>{eq}</option>
                        ))}
                        <option value="add_custom" className="font-semibold text-blue-600">+ Add Custom Equipment</option>
                      </select>
                    </div>
                  )}
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

            {/* Billing & Rates Tab */}
            <TabsContent value="billing" className="space-y-6">
              {/* Bill-to Location */}
              <div className="p-4 border-2 border-slate-200 rounded-lg">
                <h3 className="font-bold text-slate-900 mb-4">Bill-to Location</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Company Name *</Label>
                    <Input
                      value={formData.bill_to?.company_name || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        bill_to: {...formData.bill_to, company_name: e.target.value}
                      })}
                      placeholder="Company Name"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Country *</Label>
                    <select
                      value={formData.bill_to?.country || 'USA'}
                      onChange={(e) => setFormData({
                        ...formData,
                        bill_to: {...formData.bill_to, country: e.target.value}
                      })}
                      className="w-full mt-2 px-3 py-2 border rounded-lg"
                    >
                      <option value="USA">USA</option>
                      <option value="Canada">Canada</option>
                      <option value="Mexico">Mexico</option>
                    </select>
                  </div>
                  <div>
                    <Label>Address *</Label>
                    <Input
                      value={formData.bill_to?.address || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        bill_to: {...formData.bill_to, address: e.target.value}
                      })}
                      placeholder="Street Address"
                      className="mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>City *</Label>
                      <Input
                        value={formData.bill_to?.city || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          bill_to: {...formData.bill_to, city: e.target.value}
                        })}
                        placeholder="City"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>State *</Label>
                      <Input
                        value={formData.bill_to?.state || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          bill_to: {...formData.bill_to, state: e.target.value}
                        })}
                        placeholder="State"
                        maxLength={2}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Zip *</Label>
                      <Input
                        value={formData.bill_to?.zip || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          bill_to: {...formData.bill_to, zip: e.target.value}
                        })}
                        placeholder="Zip Code"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate Information */}
              <div className="p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50">
                <h3 className="font-bold text-slate-900 mb-4">Rate Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Rate Type *</Label>
                      <select
                        value={formData.rate_type}
                        onChange={(e) => setFormData({...formData, rate_type: e.target.value})}
                        className="w-full mt-2 px-3 py-2 border rounded-lg bg-white"
                      >
                        <option value="flat">Flat</option>
                        <option value="per_mile">Per Mile</option>
                        <option value="per_cwt">Per CWT</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                    <div>
                      <Label>Currency *</Label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                        className="w-full mt-2 px-3 py-2 border rounded-lg bg-white"
                      >
                        <option value="USD">USD</option>
                        <option value="CAD">CAD</option>
                        <option value="MXN">MXN</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Line Haul Rate</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.line_haul_rate}
                        onChange={(e) => setFormData({...formData, line_haul_rate: e.target.value})}
                        placeholder="1200.00"
                        className="mt-2 bg-white"
                      />
                    </div>
                    <div>
                      <Label>Fuel Rate</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.fuel_rate}
                        onChange={(e) => setFormData({...formData, fuel_rate: e.target.value})}
                        placeholder="150.00"
                        className="mt-2 bg-white"
                      />
                    </div>
                  </div>

                  {/* Accessorials */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Accessorials</Label>
                      <Button type="button" onClick={handleAddAccessorial} size="sm" className="bg-blue-600 text-white">
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    {formData.accessorial_charges?.map((acc, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          placeholder="Accessorial name"
                          value={acc.name}
                          onChange={(e) => handleAccessorialChange(index, 'name', e.target.value)}
                          className="flex-1 bg-white"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Amount"
                          value={acc.amount}
                          onChange={(e) => handleAccessorialChange(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-32 bg-white"
                        />
                        <Button type="button" onClick={() => handleRemoveAccessorial(index)} size="sm" variant="outline">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {operatingMode === 'broker' && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-300">
                      <div>
                        <Label>Customer Rate (Total)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.customer_rate}
                          onChange={(e) => setFormData({...formData, customer_rate: e.target.value})}
                          placeholder="1500.00"
                          className="mt-2 bg-white"
                        />
                      </div>
                      <div>
                        <Label>Carrier Pay</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.carrier_pay}
                          onChange={(e) => setFormData({...formData, carrier_pay: e.target.value})}
                          placeholder="1200.00"
                          className="mt-2 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-4">
              <div className="p-4 border-2 border-emerald-200 rounded-lg bg-emerald-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">Contact Person</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.contact_person?.is_one_time || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact_person: {...formData.contact_person, is_one_time: e.target.checked}
                      })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-700">One-time Contact</span>
                  </label>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.contact_person?.name || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact_person: {...formData.contact_person, name: e.target.value}
                      })}
                      placeholder="John Doe"
                      className="mt-2 bg-white"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      value={formData.contact_person?.phone || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact_person: {...formData.contact_person, phone: e.target.value}
                      })}
                      placeholder="(555) 123-4567"
                      className="mt-2 bg-white"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.contact_person?.email || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact_person: {...formData.contact_person, email: e.target.value}
                      })}
                      placeholder="john@company.com"
                      className="mt-2 bg-white"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Rate Confirmation Generation Section */}
          <div className="space-y-6 py-4">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-indigo-900">Auto-Generate Rate Confirmation</h3>
                  <p className="text-sm text-indigo-700 mt-1">
                    Automatically create and download a rate confirmation document
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.generate_rate_con}
                  onChange={(e) => setFormData({...formData, generate_rate_con: e.target.checked})}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </div>

              {formData.generate_rate_con && (
                <div>
                  <Label className="text-indigo-900">Rate Confirmation Format</Label>
                  <Select
                    value={formData.rate_con_format}
                    onValueChange={(value) => setFormData({...formData, rate_con_format: value})}
                  >
                    <SelectTrigger className="mt-2 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-red-600" />
                          <span>📄 PDF - Professional Document</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="docx">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>📝 Word - Editable Template</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
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

        <DialogFooter className="flex gap-3 mt-6 p-6 border-t border-slate-200 bg-white rounded-b-2xl">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit} // Calls the universal handleSubmit
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : (load ? 'Update Load' : formData.generate_rate_con ? `Create Load & Generate ${formData.rate_con_format.toUpperCase()}` : 'Create Load')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
