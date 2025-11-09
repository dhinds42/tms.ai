import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, FileText } from "lucide-react";

export default function CreateClaimModal({ loads, onSave, onClose, operatingMode }) {
  const [claimData, setClaimData] = useState({
    load_id: '',
    claim_type: 'cargo_damage',
    claim_amount: '',
    description: '',
    incident_date: new Date().toISOString().split('T')[0],
    shipper_id: '',
    carrier_id: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedLoad = loads.find(l => l.id === claimData.load_id);
    
    onSave({
      ...claimData,
      claim_amount: parseFloat(claimData.claim_amount) || 0,
      shipper_id: selectedLoad?.shipper_id,
      carrier_id: selectedLoad?.carrier_id
    });
  };

  const handleLoadSelect = (loadId) => {
    const load = loads.find(l => l.id === loadId);
    setClaimData({
      ...claimData,
      load_id: loadId,
      shipper_id: load?.shipper_id || '',
      carrier_id: load?.carrier_id || ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">File New Claim</h2>
            <p className="text-slate-600 mt-1">Submit a cargo claim for review</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Load Selection */}
          <div>
            <Label>Select Load *</Label>
            <select
              required
              value={claimData.load_id}
              onChange={(e) => handleLoadSelect(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">-- Select Load --</option>
              {loads.filter(l => l.status === 'delivered').map(load => (
                <option key={load.id} value={load.id}>
                  {load.load_number || load.id.slice(0, 8)} - {load.pickup_location?.city} → {load.dropoff_location?.city}
                </option>
              ))}
            </select>
          </div>

          {/* Claim Type */}
          <div>
            <Label>Claim Type *</Label>
            <select
              required
              value={claimData.claim_type}
              onChange={(e) => setClaimData({ ...claimData, claim_type: e.target.value })}
              className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="cargo_damage">Cargo Damage</option>
              <option value="cargo_loss">Cargo Loss</option>
              <option value="shortage">Shortage</option>
              <option value="concealed_damage">Concealed Damage</option>
              <option value="theft">Theft</option>
              <option value="delay">Delay</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Claim Amount */}
          <div>
            <Label>Claim Amount ($) *</Label>
            <Input
              type="number"
              step="0.01"
              required
              value={claimData.claim_amount}
              onChange={(e) => setClaimData({ ...claimData, claim_amount: e.target.value })}
              placeholder="Enter claim amount"
              className="mt-2"
            />
          </div>

          {/* Incident Date */}
          <div>
            <Label>Incident Date *</Label>
            <Input
              type="date"
              required
              value={claimData.incident_date}
              onChange={(e) => setClaimData({ ...claimData, incident_date: e.target.value })}
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description *</Label>
            <Textarea
              required
              value={claimData.description}
              onChange={(e) => setClaimData({ ...claimData, description: e.target.value })}
              placeholder="Describe the incident in detail..."
              className="mt-2 h-32"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-blue-600 text-white">
              <FileText className="w-4 h-4 mr-2" />
              Submit Claim
            </Button>
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}