
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
import { base44 } from "@/api/base44Client";

export default function CreateLoadModal({ load, onSave, onClose, isLoading }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [showPickupValidator, setShowPickupValidator] = useState(false);
  const [showDeliveryValidator, setShowDeliveryValidator] = useState(false);
  const [customEquipment, setCustomEquipment] = useState('');
  const [showCustomEquipment, setShowCustomEquipment] = useState(false);
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const [customEquipmentList, setCustomEquipmentList] = useState(() => {
    const saved = localStorage.getItem('custom_equipment_types');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState(load ? {
    ...load,
    mode: load.mode || operatingMode,
    status: load.status || 'available',
    margin: load.margin || '',
    reference_number: load.reference_number || '',
    generate_rate_con: load.generate_rate_con || false,
    rate_con_format: load.rate_con_format || 'pdf',
    pickup_location: load.pickup_location || { address: '', city: '', state: '', zip: '', validated: false },
    dropoff_location: load.dropoff_location || { address: '', city: '', state: '', zip: '', validated: false },
    bill_to: load.bill_to || { company_name: '', country: 'USA', address: '', city: '', state: '', zip: '' },
    contact_person: load.contact_person || { name: '', phone: '', email: '', is_one_time: false },
    accessorial_charges: load.accessorial_charges || []
  } : {
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
    if (!formData.generate_rate_con) {
      onSave(formData);
    } else {
      handleSaveWithRateCon();
    }
  };

  const handleSaveWithRateCon = async () => {
    try {
      const user = await base44.auth.me();

      const savedLoad = await onSave(formData);

      if (formData.generate_rate_con && savedLoad) {
        const { generateDocument, logDocumentAction } = await import('../utils/documentFormatHandler');

        const result = await generateDocument('rate_confirmation', {
          load_id: savedLoad.id,
          load_data: formData,
          module: 'Load Board',
          feature: 'Rate Confirmation'
        }, formData.rate_con_format);

        if (result.success) {
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
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{load ? "Edit Load" : "Create New Load"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
            <TabsList className="grid w-full grid-cols-5 sticky top-0 bg-background z-10 px-6 pt-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="rates">Rates</TabsTrigger>
              <TabsTrigger value="billing">Billing & Contact</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <div className="overflow-y-auto flex-grow p-6">
              <TabsContent value="basic">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="load_number">Load Number</Label>
                    <Input
                      id="load_number"
                      value={formData.load_number}
                      onChange={(e) => setFormData({ ...formData, load_number: e.target.value })}
                      placeholder="e.g., L123456"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mode">Mode</Label>
                    <Select
                      value={formData.mode}
                      onValueChange={(value) => setFormData({ ...formData, mode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="broker">Brokerage</SelectItem>
                        <SelectItem value="asset">Asset-based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="shipment_type">Shipment Type</Label>
                    <Select
                      value={formData.shipment_type}
                      onValueChange={(value) => setFormData({ ...formData, shipment_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shipment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truckload">Truckload</SelectItem>
                        <SelectItem value="less_than_truckload">Less-than-Truckload (LTL)</SelectItem>
                        <SelectItem value="intermodal">Intermodal</SelectItem>
                        <SelectItem value="air_freight">Air Freight</SelectItem>
                        <SelectItem value="ocean_freight">Ocean Freight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="dispatched">Dispatched</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pickup_date">Pickup Date/Time</Label>
                    <Input
                      id="pickup_date"
                      type="datetime-local"
                      value={formData.pickup_date}
                      onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery_date">Delivery Date/Time</Label>
                    <Input
                      id="delivery_date"
                      type="datetime-local"
                      value={formData.delivery_date}
                      onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="equipment_type">Equipment Type</Label>
                    <Select
                      value={formData.equipment_type}
                      onValueChange={(value) => {
                        if (value === 'add_custom') {
                          setShowCustomEquipment(true);
                          setFormData({ ...formData, equipment_type: 'custom' });
                        } else {
                          setFormData({ ...formData, equipment_type: value, custom_equipment_type: '' });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dry_van">Dry Van</SelectItem>
                        <SelectItem value="refrigerated">Refrigerated</SelectItem>
                        <SelectItem value="flatbed">Flatbed</SelectItem>
                        <SelectItem value="step_deck">Step Deck</SelectItem>
                        <SelectItem value="intermodal_container">Intermodal Container</SelectItem>
                        {customEquipmentList.map((eq, index) => (
                          <SelectItem key={`custom-${index}`} value={eq}>{eq}</SelectItem>
                        ))}
                        <SelectItem value="add_custom" className="font-bold text-blue-600">
                          <Plus className="mr-2 h-4 w-4 inline-block" /> Add Custom Type
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {showCustomEquipment && (
                      <div className="flex mt-2">
                        <Input
                          value={customEquipment}
                          onChange={(e) => setCustomEquipment(e.target.value)}
                          placeholder="New equipment type"
                        />
                        <Button type="button" onClick={handleAddCustomEquipment} className="ml-2">
                          Add
                        </Button>
                      </div>
                    )}
                    {formData.equipment_type === 'custom' && formData.custom_equipment_type && (
                      <Input
                        className="mt-2"
                        value={formData.custom_equipment_type}
                        onChange={(e) => setFormData({ ...formData, custom_equipment_type: e.target.value })}
                        placeholder="Custom equipment type"
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="commodity">Commodity</Label>
                    <Input
                      id="commodity"
                      value={formData.commodity}
                      onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                      placeholder="e.g., Electronics, Palletized Goods"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g., 40000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="distance_miles">Distance (miles)</Label>
                    <Input
                      id="distance_miles"
                      type="number"
                      value={formData.distance_miles}
                      onChange={(e) => setFormData({ ...formData, distance_miles: e.target.value })}
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div className="col-span-full">
                    <Label htmlFor="special_instructions">Special Instructions</Label>
                    <Input
                      id="special_instructions"
                      type="textarea"
                      value={formData.special_instructions}
                      onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                      placeholder="Any specific instructions for carrier or driver"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="locations">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pickup Location */}
                  <div className="border p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Pickup Location</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="pickup_address">Address</Label>
                        <Input
                          id="pickup_address"
                          value={formData.pickup_location.address}
                          onChange={(e) => setFormData({ ...formData, pickup_location: { ...formData.pickup_location, address: e.target.value, validated: false } })}
                          placeholder="Street Address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pickup_city">City</Label>
                        <Input
                          id="pickup_city"
                          value={formData.pickup_location.city}
                          onChange={(e) => setFormData({ ...formData, pickup_location: { ...formData.pickup_location, city: e.target.value, validated: false } })}
                          placeholder="City"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="pickup_state">State</Label>
                          <Input
                            id="pickup_state"
                            value={formData.pickup_location.state}
                            onChange={(e) => setFormData({ ...formData, pickup_location: { ...formData.pickup_location, state: e.target.value, validated: false } })}
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pickup_zip">Zip Code</Label>
                          <Input
                            id="pickup_zip"
                            value={formData.pickup_location.zip}
                            onChange={(e) => setFormData({ ...formData, pickup_location: { ...formData.pickup_location, zip: e.target.value, validated: false } })}
                            placeholder="Zip Code"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <Button type="button" onClick={() => setShowPickupValidator(true)} variant="outline">
                          <MapPin className="mr-2 h-4 w-4" /> Validate Address
                        </Button>
                        {formData.pickup_location.validated ? (
                          <Badge variant="success" className="flex items-center">
                            <CheckCircle className="mr-1 h-3 w-3" /> Validated
                          </Badge>
                        ) : (
                          formData.pickup_location.address && formData.pickup_location.city && formData.pickup_location.state && formData.pickup_location.zip && (
                            <Badge variant="warning" className="flex items-center">
                              <AlertCircle className="mr-1 h-3 w-3" /> Not Validated
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Location */}
                  <div className="border p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Delivery Location</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="dropoff_address">Address</Label>
                        <Input
                          id="dropoff_address"
                          value={formData.dropoff_location.address}
                          onChange={(e) => setFormData({ ...formData, dropoff_location: { ...formData.dropoff_location, address: e.target.value, validated: false } })}
                          placeholder="Street Address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dropoff_city">City</Label>
                        <Input
                          id="dropoff_city"
                          value={formData.dropoff_location.city}
                          onChange={(e) => setFormData({ ...formData, dropoff_location: { ...formData.dropoff_location, city: e.target.value, validated: false } })}
                          placeholder="City"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="dropoff_state">State</Label>
                          <Input
                            id="dropoff_state"
                            value={formData.dropoff_location.state}
                            onChange={(e) => setFormData({ ...formData, dropoff_location: { ...formData.dropoff_location, state: e.target.value, validated: false } })}
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dropoff_zip">Zip Code</Label>
                          <Input
                            id="dropoff_zip"
                            value={formData.dropoff_location.zip}
                            onChange={(e) => setFormData({ ...formData, dropoff_location: { ...formData.dropoff_location, zip: e.target.value, validated: false } })}
                            placeholder="Zip Code"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <Button type="button" onClick={() => setShowDeliveryValidator(true)} variant="outline">
                          <MapPin className="mr-2 h-4 w-4" /> Validate Address
                        </Button>
                        {formData.dropoff_location.validated ? (
                          <Badge variant="success" className="flex items-center">
                            <CheckCircle className="mr-1 h-3 w-3" /> Validated
                          </Badge>
                        ) : (
                          formData.dropoff_location.address && formData.dropoff_location.city && formData.dropoff_location.state && formData.dropoff_location.zip && (
                            <Badge variant="warning" className="flex items-center">
                              <AlertCircle className="mr-1 h-3 w-3" /> Not Validated
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {showPickupValidator && (
                  <AddressValidator
                    address={`${formData.pickup_location.address}, ${formData.pickup_location.city}, ${formData.pickup_location.state} ${formData.pickup_location.zip}`}
                    onValidated={handlePickupValidated}
                    onClose={() => setShowPickupValidator(false)}
                  />
                )}
                {showDeliveryValidator && (
                  <AddressValidator
                    address={`${formData.dropoff_location.address}, ${formData.dropoff_location.city}, ${formData.dropoff_location.state} ${formData.dropoff_location.zip}`}
                    onValidated={handleDeliveryValidated}
                    onClose={() => setShowDeliveryValidator(false)}
                  />
                )}
              </TabsContent>

              <TabsContent value="rates">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="rate_type">Rate Type</Label>
                    <Select
                      value={formData.rate_type}
                      onValueChange={(value) => setFormData({ ...formData, rate_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rate type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat Rate</SelectItem>
                        <SelectItem value="per_mile">Per Mile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="customer_rate">Customer Rate</Label>
                    <Input
                      id="customer_rate"
                      type="number"
                      value={formData.customer_rate}
                      onChange={(e) => setFormData({ ...formData, customer_rate: e.target.value })}
                      placeholder="e.g., 1500.00"
                    />
                  </div>
                  {operatingMode === 'broker' && (
                    <div>
                      <Label htmlFor="carrier_pay">Carrier Pay</Label>
                      <Input
                        id="carrier_pay"
                        type="number"
                        value={formData.carrier_pay}
                        onChange={(e) => setFormData({ ...formData, carrier_pay: e.target.value })}
                        placeholder="e.g., 1200.00"
                      />
                    </div>
                  )}
                  {operatingMode === 'broker' && (
                    <div>
                      <Label htmlFor="margin">Margin</Label>
                      <Input
                        id="margin"
                        type="number"
                        value={formData.margin}
                        readOnly
                        placeholder="Calculated Margin"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="line_haul_rate">Line Haul Rate</Label>
                    <Input
                      id="line_haul_rate"
                      type="number"
                      value={formData.line_haul_rate}
                      onChange={(e) => setFormData({ ...formData, line_haul_rate: e.target.value })}
                      placeholder="e.g., 1000.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fuel_rate">Fuel Surcharge</Label>
                    <Input
                      id="fuel_rate"
                      type="number"
                      value={formData.fuel_rate}
                      onChange={(e) => setFormData({ ...formData, fuel_rate: e.target.value })}
                      placeholder="e.g., 200.00"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-3">Accessorial Charges</h3>
                <div className="space-y-4">
                  {formData.accessorial_charges.map((charge, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Charge Name (e.g., Detention, Lumper)"
                        value={charge.name}
                        onChange={(e) => handleAccessorialChange(index, 'name', e.target.value)}
                        className="flex-grow"
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={charge.amount}
                        onChange={(e) => handleAccessorialChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-32"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAccessorial(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" onClick={handleAddAccessorial} variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Accessorial Charge
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="billing">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bill To */}
                  <div className="border p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Bill To (Customer)</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="bill_to_company_name">Company Name</Label>
                        <Input
                          id="bill_to_company_name"
                          value={formData.bill_to.company_name}
                          onChange={(e) => setFormData({ ...formData, bill_to: { ...formData.bill_to, company_name: e.target.value } })}
                          placeholder="Customer Company Name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bill_to_country">Country</Label>
                        <Select
                          value={formData.bill_to.country}
                          onValueChange={(value) => setFormData({ ...formData, bill_to: { ...formData.bill_to, country: value } })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USA">USA</SelectItem>
                            <SelectItem value="CAN">Canada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="bill_to_address">Address</Label>
                        <Input
                          id="bill_to_address"
                          value={formData.bill_to.address}
                          onChange={(e) => setFormData({ ...formData, bill_to: { ...formData.bill_to, address: e.target.value } })}
                          placeholder="Street Address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bill_to_city">City</Label>
                        <Input
                          id="bill_to_city"
                          value={formData.bill_to.city}
                          onChange={(e) => setFormData({ ...formData, bill_to: { ...formData.bill_to, city: e.target.value } })}
                          placeholder="City"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="bill_to_state">State</Label>
                          <Input
                            id="bill_to_state"
                            value={formData.bill_to.state}
                            onChange={(e) => setFormData({ ...formData, bill_to: { ...formData.bill_to, state: e.target.value } })}
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bill_to_zip">Zip Code</Label>
                          <Input
                            id="bill_to_zip"
                            value={formData.bill_to.zip}
                            onChange={(e) => setFormData({ ...formData, bill_to: { ...formData.bill_to, zip: e.target.value } })}
                            placeholder="Zip Code"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Person */}
                  <div className="border p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Contact Person</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="contact_name">Name</Label>
                        <Input
                          id="contact_name"
                          value={formData.contact_person.name}
                          onChange={(e) => setFormData({ ...formData, contact_person: { ...formData.contact_person, name: e.target.value } })}
                          placeholder="Contact Person Name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_phone">Phone</Label>
                        <Input
                          id="contact_phone"
                          type="tel"
                          value={formData.contact_person.phone}
                          onChange={(e) => setFormData({ ...formData, contact_person: { ...formData.contact_person, phone: e.target.value } })}
                          placeholder="e.g., (123) 456-7890"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_email">Email</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_person.email}
                          onChange={(e) => setFormData({ ...formData, contact_person: { ...formData.contact_person, email: e.target.value } })}
                          placeholder="e.g., contact@customer.com"
                        />
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        <input
                          id="is_one_time"
                          type="checkbox"
                          checked={formData.contact_person.is_one_time}
                          onChange={(e) => setFormData({ ...formData, contact_person: { ...formData.contact_person, is_one_time: e.target.checked } })}
                          className="h-4 w-4 text-primary rounded"
                        />
                        <Label htmlFor="is_one_time">One-time Contact</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="reference_number">Reference Number</Label>
                    <Input
                      id="reference_number"
                      value={formData.reference_number}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                      placeholder="e.g., PO-12345, BOL-67890"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <input
                      id="generate_rate_con"
                      type="checkbox"
                      checked={formData.generate_rate_con}
                      onChange={(e) => setFormData({ ...formData, generate_rate_con: e.target.checked })}
                      className="h-4 w-4 text-primary rounded"
                    />
                    <Label htmlFor="generate_rate_con">Generate Rate Confirmation on Save</Label>
                  </div>
                  {formData.generate_rate_con && (
                    <div>
                      <Label htmlFor="rate_con_format">Rate Confirmation Format</Label>
                      <Select
                        value={formData.rate_con_format}
                        onValueChange={(value) => setFormData({ ...formData, rate_con_format: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="docx">DOCX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="p-6 pt-0 mt-auto">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Load
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
