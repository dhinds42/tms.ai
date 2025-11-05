import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X } from "lucide-react";

export default function AddComplianceModal({ onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    entity_type: 'carrier',
    entity_id: '',
    entity_name: '',
    compliance_type: 'insurance',
    status: 'current',
    expiration_date: '',
    document_url: '',
    notes: ''
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-900 to-green-900 bg-clip-text text-transparent">
            Add Compliance Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Entity Type</Label>
              <Select value={formData.entity_type} onValueChange={(value) => setFormData({...formData, entity_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carrier">Carrier</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Entity Name</Label>
              <Input
                value={formData.entity_name}
                onChange={(e) => setFormData({...formData, entity_name: e.target.value})}
                placeholder="e.g., ABC Trucking"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Compliance Type</Label>
              <Select value={formData.compliance_type} onValueChange={(value) => setFormData({...formData, compliance_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="mc_dot">MC/DOT</SelectItem>
                  <SelectItem value="cdl">CDL</SelectItem>
                  <SelectItem value="medical_card">Medical Card</SelectItem>
                  <SelectItem value="ifta">IFTA</SelectItem>
                  <SelectItem value="drug_consortium">Drug Consortium</SelectItem>
                  <SelectItem value="vehicle_inspection">Vehicle Inspection</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Expiration Date</Label>
            <Input
              type="date"
              value={formData.expiration_date}
              onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
            />
          </div>

          <div>
            <Label>Document URL (Optional)</Label>
            <Input
              value={formData.document_url}
              onChange={(e) => setFormData({...formData, document_url: e.target.value})}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional information..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Add Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}