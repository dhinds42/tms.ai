import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Building } from "lucide-react";

export default function CreateOrgModal({ isOpen, onClose, onSave, isLoading, organization = null }) {
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    legal_name: organization?.legal_name || "",
    org_type: organization?.org_type || "BROKER",
    dot_number: organization?.dot_number || "",
    mc_number: organization?.mc_number || "",
    scac: organization?.scac || "",
    tax_id: organization?.tax_id || "",
    state: organization?.state || "",
    billing_email: organization?.billing_email || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {organization ? 'Edit Organization' : 'Create Organization'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="ABC Logistics"
                required
              />
            </div>

            <div>
              <Label htmlFor="legal_name">Legal Name</Label>
              <Input
                id="legal_name"
                value={formData.legal_name}
                onChange={(e) => handleChange('legal_name', e.target.value)}
                placeholder="ABC Logistics LLC"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="org_type">Organization Type *</Label>
            <Select value={formData.org_type} onValueChange={(val) => handleChange('org_type', val)}>
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
            <div>
              <Label htmlFor="dot_number">DOT Number</Label>
              <Input
                id="dot_number"
                value={formData.dot_number}
                onChange={(e) => handleChange('dot_number', e.target.value)}
                placeholder="12345678"
              />
            </div>

            <div>
              <Label htmlFor="mc_number">MC Number</Label>
              <Input
                id="mc_number"
                value={formData.mc_number}
                onChange={(e) => handleChange('mc_number', e.target.value)}
                placeholder="MC-123456"
              />
            </div>

            <div>
              <Label htmlFor="scac">SCAC</Label>
              <Input
                id="scac"
                value={formData.scac}
                onChange={(e) => handleChange('scac', e.target.value)}
                placeholder="ABCD"
                maxLength={4}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tax_id">Tax ID / EIN</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) => handleChange('tax_id', e.target.value)}
                placeholder="12-3456789"
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="CA"
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="billing_email">Billing Email</Label>
            <Input
              id="billing_email"
              type="email"
              value={formData.billing_email}
              onChange={(e) => handleChange('billing_email', e.target.value)}
              placeholder="billing@company.com"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {organization ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Building className="w-4 h-4 mr-2" />
                  {organization ? 'Update Organization' : 'Create Organization'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}