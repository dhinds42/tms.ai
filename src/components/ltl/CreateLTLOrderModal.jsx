
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Save, X, Plus, Trash2, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client"; // Assuming this path is correct
import { logDocumentAction, generateDocument } from "@/utils/documentFormatHandler"; // Assuming this path is correct

export default function CreateLTLOrderModal({ order, onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState(order || {
    commodity: "",
    branch: "",
    cargo_condition: "new",
    cargo_description: "",
    declared_value: "",
    equipment_type: "",
    reference_numbers: [],
    pickup_location: {
      company_name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      location_class: "commercial",
      contact_name: "",
      contact_phone: ""
    },
    pickup_date: "",
    pickup_time_start: "11:00",
    pickup_time_end: "17:00",
    delivery_location: {
      company_name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      location_class: "commercial",
      contact_name: "",
      contact_phone: ""
    },
    delivery_date: "",
    items: [{
      packaging_type: "pallet",
      quantity: 1,
      length: "",
      width: "",
      height: "",
      weight: "",
      description: "",
      freight_class: "",
      nmfc_number: ""
    }],
    special_instructions: "",
    export_format: "pdf", // Added new field
    auto_generate_bol: false // Added new field
  });

  const [generating, setGenerating] = useState(false);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        packaging_type: "pallet",
        quantity: 1,
        length: "",
        width: "",
        height: "",
        weight: "",
        description: "",
        freight_class: "",
        nmfc_number: ""
      }]
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e, triggerBOLGeneration = false) => {
    e.preventDefault();
    
    // Determine if BOL generation should occur
    const shouldGenerateBOL = triggerBOLGeneration || formData.auto_generate_bol;

    if (shouldGenerateBOL) {
      setGenerating(true);
      try {
        const user = await base44.auth.me(); // Fetch current user for logging

        // First, save the order. Assuming onSave returns the saved order object with an ID.
        const savedOrder = await onSave(formData);
        
        if (!savedOrder || !savedOrder.id || !savedOrder.order_number) {
          throw new Error("Order was not saved or missing ID/order_number for BOL generation.");
        }

        // Then, generate BOL
        const result = await generateDocument('ltl_bol', {
          order_id: savedOrder.id,
          order_data: formData, // Pass formData directly for BOL content
          module: 'LTL Management',
          feature: 'BOL Generation'
        }, formData.export_format);

        if (result.success) {
          // Log generation
          await logDocumentAction({
            documentId: result.document.id,
            documentName: `LTL_BOL_${savedOrder.order_number}.${formData.export_format}`,
            documentType: 'bol',
            actionType: 'generated',
            actionBy: user.email,
            fileFormat: formData.export_format,
            module: 'LTL Management',
            feature: 'BOL Generation',
            notes: `Auto-generated LTL BOL in ${formData.export_format.toUpperCase()} format`
          });

          alert(`✅ Order saved and BOL generated in ${formData.export_format.toUpperCase()} format!`);
          window.open(result.document.file_url, '_blank');
        } else {
          console.error('BOL generation failed:', result.message);
          alert(`❌ Order saved, but BOL generation failed: ${result.message}`);
        }
      } catch (error) {
        console.error('BOL generation error:', error);
        alert(`❌ An error occurred during BOL generation: ${error.message}`);
      } finally {
        setGenerating(false);
      }
    } else {
      // If not generating BOL, just save the order
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-slate-900">
            {order ? 'Edit LTL Order' : 'Build an LTL Order'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-8">
          
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Required Fields - Left Side */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Required Information</h3>
              
              <div>
                <Label htmlFor="commodity">Commodity *</Label>
                <Input
                  id="commodity"
                  value={formData.commodity}
                  onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="branch">Branch *</Label>
                <Input
                  id="branch"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cargo_condition">Cargo Condition *</Label>
                <select
                  id="cargo_condition"
                  value={formData.cargo_condition}
                  onChange={(e) => setFormData({ ...formData, cargo_condition: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"
                  required
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
            </div>

            {/* Optional Fields - Right Side */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Optional Information</h3>
              
              <div>
                <Label htmlFor="cargo_description">Cargo Description</Label>
                <Textarea
                  id="cargo_description"
                  value={formData.cargo_description}
                  onChange={(e) => setFormData({ ...formData, cargo_description: e.target.value })}
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="declared_value">Declared Value ($)</Label>
                <Input
                  id="declared_value"
                  type="number"
                  value={formData.declared_value}
                  onChange={(e) => setFormData({ ...formData, declared_value: parseFloat(e.target.value) })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="equipment_type">Equipment Type</Label>
                <Input
                  id="equipment_type"
                  value={formData.equipment_type}
                  onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Pickup Location */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-bold text-lg text-slate-900">Pickup Location *</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Company Name *</Label>
                <Input
                  value={formData.pickup_location.company_name}
                  onChange={(e) => setFormData({
                    ...formData,
                    pickup_location: { ...formData.pickup_location, company_name: e.target.value }
                  })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Address *</Label>
                <Input
                  value={formData.pickup_location.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    pickup_location: { ...formData.pickup_location, address: e.target.value }
                  })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>City *</Label>
                <Input
                  value={formData.pickup_location.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    pickup_location: { ...formData.pickup_location, city: e.target.value }
                  })}
                  required
                  className="mt-1"
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
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Zip Code *</Label>
                <Input
                  value={formData.pickup_location.zip}
                  onChange={(e) => setFormData({
                    ...formData,
                    pickup_location: { ...formData.pickup_location, zip: e.target.value }
                  })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Location Class *</Label>
                <select
                  value={formData.pickup_location.location_class}
                  onChange={(e) => setFormData({
                    ...formData,
                    pickup_location: { ...formData.pickup_location, location_class: e.target.value }
                  })}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="commercial">Commercial</option>
                  <option value="residential">Residential</option>
                  <option value="limited_access">Limited Access</option>
                </select>
              </div>
              <div>
                <Label>Contact Name</Label>
                <Input
                  value={formData.pickup_location.contact_name}
                  onChange={(e) => setFormData({
                    ...formData,
                    pickup_location: { ...formData.pickup_location, contact_name: e.target.value }
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  value={formData.pickup_location.contact_phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    pickup_location: { ...formData.pickup_location, contact_phone: e.target.value }
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Pickup Date *</Label>
                <Input
                  type="date"
                  value={formData.pickup_date}
                  onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pickup Time Start</Label>
                <Input
                  type="time"
                  value={formData.pickup_time_start}
                  onChange={(e) => setFormData({ ...formData, pickup_time_start: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Pickup Time End</Label>
                <Input
                  type="time"
                  value={formData.pickup_time_end}
                  onChange={(e) => setFormData({ ...formData, pickup_time_end: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            {(formData.pickup_time_start < "11:00" || formData.pickup_time_end > "17:00") && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                ⚠️ Note: Pickup times outside 11:00 AM - 5:00 PM may incur additional charges from LTL carriers.
              </div>
            )}
          </div>

          {/* Delivery Location */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-bold text-lg text-slate-900">Delivery Location *</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Company Name *</Label>
                <Input
                  value={formData.delivery_location.company_name}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery_location: { ...formData.delivery_location, company_name: e.target.value }
                  })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Address *</Label>
                <Input
                  value={formData.delivery_location.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery_location: { ...formData.delivery_location, address: e.target.value }
                  })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>City *</Label>
                <Input
                  value={formData.delivery_location.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery_location: { ...formData.delivery_location, city: e.target.value }
                  })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>State *</Label>
                <Input
                  value={formData.delivery_location.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery_location: { ...formData.delivery_location, state: e.target.value }
                  })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Zip Code *</Label>
                <Input
                  value={formData.delivery_location.zip}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery_location: { ...formData.delivery_location, zip: e.target.value }
                  })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Location Class *</Label>
                <select
                  value={formData.delivery_location.location_class}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery_location: { ...formData.delivery_location, location_class: e.target.value }
                  })}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="commercial">Commercial</option>
                  <option value="residential">Residential</option>
                  <option value="limited_access">Limited Access</option>
                </select>
              </div>
              <div>
                <Label>Contact Name</Label>
                <Input
                  value={formData.delivery_location.contact_name}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery_location: { ...formData.delivery_location, contact_name: e.target.value }
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  value={formData.delivery_location.contact_phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery_location: { ...formData.delivery_location, contact_phone: e.target.value }
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Delivery Date</Label>
                <Input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Items *</h3>
              <Button
                type="button"
                onClick={handleAddItem}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Item
              </Button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">Item {index + 1}</h4>
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Packaging Type *</Label>
                    <select
                      value={item.packaging_type}
                      onChange={(e) => handleItemChange(index, 'packaging_type', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"
                      required
                    >
                      <option value="pallet">Pallet</option>
                      <option value="carton">Carton</option>
                      <option value="crate">Crate</option>
                      <option value="drum">Drum</option>
                      <option value="bundle">Bundle</option>
                      <option value="bag">Bag</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      required
                      min="1"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Length (in) *</Label>
                    <Input
                      type="number"
                      value={item.length}
                      onChange={(e) => handleItemChange(index, 'length', parseFloat(e.target.value))}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Width (in) *</Label>
                    <Input
                      type="number"
                      value={item.width}
                      onChange={(e) => handleItemChange(index, 'width', parseFloat(e.target.value))}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Height (in) *</Label>
                    <Input
                      type="number"
                      value={item.height}
                      onChange={(e) => handleItemChange(index, 'height', parseFloat(e.target.value))}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Weight (lbs) *</Label>
                    <Input
                      type="number"
                      value={item.weight}
                      onChange={(e) => handleItemChange(index, 'weight', parseFloat(e.target.value))}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Freight Class</Label>
                    <Input
                      value={item.freight_class}
                      onChange={(e) => handleItemChange(index, 'freight_class', e.target.value)}
                      placeholder="50-500"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>NMFC Number</Label>
                    <Input
                      value={item.nmfc_number}
                      onChange={(e) => handleItemChange(index, 'nmfc_number', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Label>Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Special Instructions */}
          <div>
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Document Generation Options - NEW SECTION */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-bold text-lg text-slate-900">Document Generation</h3>
            
            {/* Auto-generate BOL checkbox */}
            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <input
                type="checkbox"
                id="auto_generate_bol"
                checked={formData.auto_generate_bol}
                onChange={(e) => setFormData({...formData, auto_generate_bol: e.target.checked})}
                className="w-5 h-5 text-indigo-600 rounded"
              />
              <div className="flex-1">
                <Label htmlFor="auto_generate_bol" className="font-semibold text-indigo-900">Auto-Generate LTL Bill of Lading</Label>
                <p className="text-sm text-indigo-700 mt-1">
                  Automatically create and download a BOL after saving this order
                </p>
              </div>
            </div>

            {/* Format Selection */}
            {formData.auto_generate_bol && (
              <div>
                <Label>BOL Document Format *</Label>
                <Select 
                  value={formData.export_format} 
                  onValueChange={(value) => setFormData({...formData, export_format: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-600" />
                        <span>📄 PDF - Carrier-Ready BOL</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="xlsx">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        <span>📊 Excel - Editable BOL</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="docx">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>📝 Word - Customizable BOL</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

        </form>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex justify-end gap-3 rounded-b-2xl">
          <Button variant="outline" onClick={onClose} disabled={isLoading || generating}>
            Cancel
          </Button>
          <Button
            type="submit" // Changed to submit type to trigger form onSubmit
            onClick={(e) => handleSubmit(e, false)} // Explicitly pass false for direct BOL generation
            disabled={isLoading || generating}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          >
            {generating && formData.auto_generate_bol ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving & Generating...
              </>
            ) : (
              'Save Order'
            )}
          </Button>
          <Button
            type="submit" // Changed to submit type to trigger form onSubmit
            onClick={(e) => handleSubmit(e, false)} // This button also relies on auto_generate_bol for BOL gen
            disabled={isLoading || generating}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Save & Get Rates'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
