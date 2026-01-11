import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, UserPlus } from "lucide-react";

export default function AddMemberModal({ isOpen, onClose, onSave, isLoading, organizations = [] }) {
  const [email, setEmail] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !selectedOrgId) return;
    
    onSave({
      user_email: email,
      org_id: selectedOrgId,
      title: title || undefined,
      status: 'invited'
    });

    // Reset form
    setEmail("");
    setSelectedOrgId("");
    setTitle("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite New Member
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@company.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="org">Organization</Label>
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select organization..." />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Job Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Dispatcher, Operations Manager"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !email || !selectedOrgId}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Inviting...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}