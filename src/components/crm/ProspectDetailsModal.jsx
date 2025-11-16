import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
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
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  ArrowRight,
  UserPlus,
  CheckCircle
} from "lucide-react";

export default function ProspectDetailsModal({ prospect, onClose, onStatusChange }) {
  const [selectedStatus, setSelectedStatus] = useState(prospect.status);
  
  const queryClient = useQueryClient();

  const updateProspectMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Prospect.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
    },
  });

  const createShipperMutation = useMutation({
    mutationFn: (data) => base44.entities.Shipper.create(data),
    onSuccess: (newShipper) => {
      // Mark prospect as converted
      updateProspectMutation.mutate({
        id: prospect.id,
        data: {
          status: 'converted',
          converted_to_id: newShipper.id,
          converted_at: new Date().toISOString()
        }
      });
      queryClient.invalidateQueries({ queryKey: ['shippers'] });
      alert('✅ Prospect converted to customer!');
      onClose();
    },
  });

  const createCarrierMutation = useMutation({
    mutationFn: (data) => base44.entities.Carrier.create(data),
    onSuccess: (newCarrier) => {
      updateProspectMutation.mutate({
        id: prospect.id,
        data: {
          status: 'converted',
          converted_to_id: newCarrier.id,
          converted_at: new Date().toISOString()
        }
      });
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
      alert('✅ Prospect converted to carrier!');
      onClose();
    },
  });

  const handleConvertToCustomer = () => {
    if (!confirm('Convert this prospect to a customer?')) return;

    const shipperData = {
      company_name: prospect.company_name,
      contact_name: prospect.contact_name,
      email: prospect.email,
      phone: prospect.phone,
      address: prospect.address?.street || '',
      city: prospect.address?.city || '',
      state: prospect.address?.state || '',
      zip: prospect.address?.zip || '',
      industry: prospect.industry,
      status: 'active',
      notes: `Converted from prospect. ${prospect.notes || ''}`
    };

    createShipperMutation.mutate(shipperData);
  };

  const handleConvertToCarrier = () => {
    if (!confirm('Convert this prospect to a carrier?')) return;

    const carrierData = {
      company_name: prospect.company_name,
      contact_name: prospect.contact_name || 'To Be Updated',
      email: prospect.email || 'update@carrier.com',
      phone: prospect.phone || '',
      status: 'pending_approval',
      notes: `Converted from prospect. ${prospect.notes || ''}`
    };

    createCarrierMutation.mutate(carrierData);
  };

  const handleStatusUpdate = () => {
    onStatusChange(prospect.id, selectedStatus);
    alert('Status updated!');
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-600" />
            Prospect Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-1">COMPANY</p>
              <p className="text-slate-900 font-medium">{prospect.company_name || 'N/A'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-1">CONTACT</p>
              <p className="text-slate-900 font-medium">{prospect.contact_name || 'N/A'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-1">EMAIL</p>
              <p className="text-slate-900 font-medium">{prospect.email || 'N/A'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-1">PHONE</p>
              <p className="text-slate-900 font-medium">{prospect.phone || 'N/A'}</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-1">TYPE</p>
              <Badge className="mt-1 capitalize">{prospect.prospect_type}</Badge>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-1">INDUSTRY</p>
              <p className="text-slate-900 font-medium">{prospect.industry || 'N/A'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-1">SOURCE</p>
              <p className="text-slate-900 font-medium capitalize">{prospect.source?.replace('_', ' ')}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-1">CONFIDENCE</p>
              <p className="text-slate-900 font-medium">{prospect.extraction_confidence || 0}%</p>
            </div>
          </div>

          {/* Address */}
          {prospect.address && prospect.address.city && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-2">ADDRESS</p>
              <p className="text-slate-900">
                {prospect.address.street && <>{prospect.address.street}<br /></>}
                {prospect.address.city}, {prospect.address.state} {prospect.address.zip}
              </p>
            </div>
          )}

          {/* Tags */}
          {prospect.tags && prospect.tags.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-2">TAGS</p>
              <div className="flex flex-wrap gap-2">
                {prospect.tags.map((tag, idx) => (
                  <Badge key={idx} className="bg-purple-100 text-purple-800">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {prospect.notes && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-2">NOTES</p>
              <p className="text-sm text-slate-900 whitespace-pre-wrap">{prospect.notes}</p>
            </div>
          )}

          {/* Status Update */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Label className="text-sm font-semibold text-slate-700 mb-2 block">
              Update Pipeline Status
            </Label>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intake">Intake</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
                  <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                  <SelectItem value="negotiating">Negotiating</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="disqualified">Disqualified</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleStatusUpdate}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Update
              </Button>
            </div>
          </div>

          {/* Conversion Actions */}
          {prospect.status !== 'converted' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm font-semibold text-emerald-900 mb-3">
                Convert to Active Customer/Carrier
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleConvertToCustomer}
                  disabled={createShipperMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convert to Customer
                </Button>
                {prospect.prospect_type === 'carrier' && (
                  <Button
                    onClick={handleConvertToCarrier}
                    disabled={createCarrierMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Convert to Carrier
                  </Button>
                )}
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}