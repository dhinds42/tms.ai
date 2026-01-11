import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/design-system";

export default function AddMemberModal({ isOpen, onClose, onSave, isLoading, organizations }) {
  const [formData, setFormData] = useState({
    user_email: '',
    org_id: '',
    title: '',
    status: 'invited'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      user_email: formData.user_email,
      org_id: formData.org_id,
      title: formData.title || undefined,
      status: 'invited'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite New Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Email Address" required>
            <Input
              type="email"
              value={formData.user_email}
              onChange={(e) => setFormData({...formData, user_email: e.target.value})}
              placeholder="member@company.com"
              required
            />
          </FormField>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Organization *</label>
            <Select
              value={formData.org_id}
              onValueChange={(value) => setFormData({...formData, org_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization..." />
              </SelectTrigger>
              <SelectContent>
                {organizations?.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FormField label="Job Title (Optional)">
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Dispatcher, Operations Manager"
            />
          </FormField>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Inviting...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}