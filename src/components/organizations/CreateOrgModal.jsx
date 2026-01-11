import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/design-system";

export default function CreateOrgModal({ isOpen, onClose, onSave, isLoading, organization }) {
  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    org_type: 'BROKER',
    mc_number: '',
    dot_number: '',
    scac: '',
    tax_id: '',
    state: '',
    billing_email: ''
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        legal_name: organization.legal_name || '',
        org_type: organization.org_type || 'BROKER',
        mc_number: organization.mc_number || '',
        dot_number: organization.dot_number || '',
        scac: organization.scac || '',
        tax_id: organization.tax_id || '',
        state: organization.state || '',
        billing_email: organization.billing_email || ''
      });
    } else {
      setFormData({
        name: '',
        legal_name: '',
        org_type: 'BROKER',
        mc_number: '',
        dot_number: '',
        scac: '',
        tax_id: '',
        state: '',
        billing_email: ''
      });
    }
  }, [organization, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanData = {
      ...formData,
      legal_name: formData.legal_name || undefined,
      mc_number: formData.mc_number || undefined,
      dot_number: formData.dot_number || undefined,
      scac: formData.scac || undefined,
      tax_id: formData.tax_id || undefined,
      state: formData.state || undefined,
      billing_email: formData.billing_email || undefined
    };
    onSave(cleanData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{organization ? 'Edit Organization' : 'Create Organization'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Organization Name" required>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="ABC Logistics"
                required
              />
            </FormField>
            <FormField label="Legal Name">
              <Input
                value={formData.legal_name}
                onChange={(e) => setFormData({...formData, legal_name: e.target.value})}
                placeholder="ABC Logistics LLC"
              />
            </FormField>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Organization Type *</label>
            <Select
              value={formData.org_type}
              onValueChange={(value) => setFormData({...formData, org_type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BROKER">Broker</SelectItem>
                <SelectItem value="CARRIER">Carrier</SelectItem>
                <SelectItem value="OWNER_OPERATOR">Owner Operator</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="DOT Number">
              <Input
                value={formData.dot_number}
                onChange={(e) => setFormData({...formData, dot_number: e.target.value})}
                placeholder="12345678"
              />
            </FormField>
            <FormField label="MC Number">
              <Input
                value={formData.mc_number}
                onChange={(e) => setFormData({...formData, mc_number: e.target.value})}
                placeholder="MC-123456"
              />
            </FormField>
            <FormField label="SCAC">
              <Input
                value={formData.scac}
                onChange={(e) => setFormData({...formData, scac: e.target.value})}
                placeholder="ABCD"
                maxLength={4}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tax ID / EIN">
              <Input
                value={formData.tax_id}
                onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                placeholder="12-3456789"
              />
            </FormField>
            <FormField label="State">
              <Input
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                placeholder="CA"
                maxLength={2}
              />
            </FormField>
          </div>

          <FormField label="Billing Email">
            <Input
              type="email"
              value={formData.billing_email}
              onChange={(e) => setFormData({...formData, billing_email: e.target.value})}
              placeholder="billing@company.com"
            />
          </FormField>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (organization ? 'Update Organization' : 'Create Organization')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}