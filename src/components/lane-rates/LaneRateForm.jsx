import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save } from "lucide-react";

export default function LaneRateForm({ onClose, isBroker }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    origin_city: '',
    origin_state: '',
    origin_zip: '',
    destination_city: '',
    destination_state: '',
    destination_zip: '',
    lane_miles: 0,
    customer_rate: 0,
    carrier_rate: 0,
    owner_operator_rate: 0,
    driver_rate: 0,
    broker_fee_customer_side: 0,
    broker_fee_carrier_side: 0,
    effective_date: '',
    expiration_date: '',
    locked_until: '',
    lock_reason: '',
    notes: ''
  });

  const createLaneRateMutation = useMutation({
    mutationFn: async (data) => {
      const total_margin = data.customer_rate - data.carrier_rate;
      const margin_percentage = (total_margin / data.customer_rate) * 100;
      
      const laneRate = await base44.entities.LaneRate.create({
        ...data,
        total_margin,
        margin_percentage,
        status: 'pending',
        created_by_user_id: (await base44.auth.me()).id
      });

      // Log history
      await base44.entities.LaneRateHistory.create({
        lane_rate_id: laneRate.id,
        action: 'created',
        changed_by_user_id: (await base44.auth.me()).id,
        changed_by_role: 'broker',
        system_source: 'tms_a',
        timestamp: new Date().toISOString()
      });

      return laneRate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['laneRates']);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createLaneRateMutation.mutate(formData);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle>Create New Lane Rate</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Origin */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Origin</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>City *</Label>
                <Input
                  value={formData.origin_city}
                  onChange={(e) => setFormData({...formData, origin_city: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>State *</Label>
                <Input
                  value={formData.origin_state}
                  onChange={(e) => setFormData({...formData, origin_state: e.target.value})}
                  maxLength={2}
                  required
                />
              </div>
              <div>
                <Label>Zip</Label>
                <Input
                  value={formData.origin_zip}
                  onChange={(e) => setFormData({...formData, origin_zip: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Destination */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Destination</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>City *</Label>
                <Input
                  value={formData.destination_city}
                  onChange={(e) => setFormData({...formData, destination_city: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>State *</Label>
                <Input
                  value={formData.destination_state}
                  onChange={(e) => setFormData({...formData, destination_state: e.target.value})}
                  maxLength={2}
                  required
                />
              </div>
              <div>
                <Label>Zip</Label>
                <Input
                  value={formData.destination_zip}
                  onChange={(e) => setFormData({...formData, destination_zip: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Lane Details */}
          <div>
            <Label>Lane Miles</Label>
            <Input
              type="number"
              value={formData.lane_miles}
              onChange={(e) => setFormData({...formData, lane_miles: parseFloat(e.target.value)})}
            />
          </div>

          {/* Rates (Broker Only) */}
          {isBroker && (
            <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-3">🔐 Broker-Only Rates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer Rate</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.customer_rate}
                    onChange={(e) => setFormData({...formData, customer_rate: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Carrier Rate</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.carrier_rate}
                    onChange={(e) => setFormData({...formData, carrier_rate: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Owner Operator Rate</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.owner_operator_rate}
                    onChange={(e) => setFormData({...formData, owner_operator_rate: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Broker Fee (Customer Side)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.broker_fee_customer_side}
                    onChange={(e) => setFormData({...formData, broker_fee_customer_side: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Broker Fee (Carrier Side)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.broker_fee_carrier_side}
                    onChange={(e) => setFormData({...formData, broker_fee_carrier_side: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Driver Rate (Visible to All) */}
          <div>
            <Label>Driver Rate (TMS-B Visible)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.driver_rate}
              onChange={(e) => setFormData({...formData, driver_rate: parseFloat(e.target.value)})}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Effective Date</Label>
              <Input
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
              />
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
              <Label>Locked Until</Label>
              <Input
                type="date"
                value={formData.locked_until}
                onChange={(e) => setFormData({...formData, locked_until: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label>Lock Reason</Label>
            <Input
              placeholder="e.g., 12-month contract agreement"
              value={formData.lock_reason}
              onChange={(e) => setFormData({...formData, lock_reason: e.target.value})}
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-indigo-600">
              <Save className="w-4 h-4 mr-2" />
              Create Lane Rate
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