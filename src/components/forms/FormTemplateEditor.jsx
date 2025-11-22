import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Save, Plus, Trash } from "lucide-react";

export default function FormTemplateEditor({ template, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(template || {
    form_name: '',
    form_type: 'bill_of_lading',
    form_category: 'tms',
    version: '1.0',
    fields: [],
    sync_to_crm: false,
    sync_to_tms: true,
    requires_signature: false
  });

  const [newField, setNewField] = useState({
    field_id: '',
    field_name: '',
    field_type: 'text',
    required: false,
    validation_regex: '',
    options: []
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.FormTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['formTemplates']);
      onClose();
    },
  });

  const handleAddField = () => {
    if (!newField.field_id || !newField.field_name) return;
    setFormData({
      ...formData,
      fields: [...formData.fields, {...newField, field_id: newField.field_id || Date.now().toString()}]
    });
    setNewField({
      field_id: '',
      field_name: '',
      field_type: 'text',
      required: false,
      validation_regex: '',
      options: []
    });
  };

  const handleRemoveField = (fieldId) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter(f => f.field_id !== fieldId)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTemplateMutation.mutate(formData);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle>Create Form Template</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Form Name *</Label>
              <Input
                value={formData.form_name}
                onChange={(e) => setFormData({...formData, form_name: e.target.value})}
                placeholder="e.g., Bill of Lading"
                required
              />
            </div>
            <div>
              <Label>Form Type *</Label>
              <Select value={formData.form_type} onValueChange={(value) => setFormData({...formData, form_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carrier_setup">Carrier Setup</SelectItem>
                  <SelectItem value="credit_application">Credit Application</SelectItem>
                  <SelectItem value="rate_confirmation">Rate Confirmation</SelectItem>
                  <SelectItem value="bill_of_lading">Bill of Lading</SelectItem>
                  <SelectItem value="proof_of_delivery">Proof of Delivery</SelectItem>
                  <SelectItem value="equipment_interchange">Equipment Interchange</SelectItem>
                  <SelectItem value="freight_invoice">Freight Invoice</SelectItem>
                  <SelectItem value="customs_entry">Customs Entry</SelectItem>
                  <SelectItem value="hazmat_declaration">Hazmat Declaration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select value={formData.form_category} onValueChange={(value) => setFormData({...formData, form_category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crm">CRM</SelectItem>
                  <SelectItem value="tms">TMS</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Version</Label>
              <Input
                value={formData.version}
                onChange={(e) => setFormData({...formData, version: e.target.value})}
                placeholder="1.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={formData.sync_to_crm}
                  onCheckedChange={(checked) => setFormData({...formData, sync_to_crm: checked})}
                />
                <Label>Sync to CRM</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={formData.sync_to_tms}
                  onCheckedChange={(checked) => setFormData({...formData, sync_to_tms: checked})}
                />
                <Label>Sync to TMS</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={formData.requires_signature}
                  onCheckedChange={(checked) => setFormData({...formData, requires_signature: checked})}
                />
                <Label>Requires Signature</Label>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Form Fields</Label>
            <div className="space-y-2 mb-4">
              {formData.fields.map((field) => (
                <div key={field.field_id} className="p-3 bg-slate-100 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{field.field_name}</p>
                    <p className="text-xs text-slate-600">{field.field_type} {field.required && '(required)'}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveField(field.field_id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  placeholder="Field ID"
                  value={newField.field_id}
                  onChange={(e) => setNewField({...newField, field_id: e.target.value})}
                />
                <Input
                  placeholder="Field Name"
                  value={newField.field_name}
                  onChange={(e) => setNewField({...newField, field_name: e.target.value})}
                />
                <Select value={newField.field_type} onValueChange={(value) => setNewField({...newField, field_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="boolean">Checkbox</SelectItem>
                    <SelectItem value="select">Dropdown</SelectItem>
                    <SelectItem value="file">File Upload</SelectItem>
                    <SelectItem value="signature">Signature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={newField.required}
                  onCheckedChange={(checked) => setNewField({...newField, required: checked})}
                />
                <Label>Required</Label>
              </div>
              <Button type="button" onClick={handleAddField} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-indigo-600">
              <Save className="w-4 h-4 mr-2" />
              Create Template
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}