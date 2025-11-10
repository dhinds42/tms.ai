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
        const { generateDocument, logDocumentAction } = await import('@/utils/documentFormatHandler.js');

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
        {/* ... keep all existing JSX ... */}
      </DialogContent>
    </Dialog>
  );
}