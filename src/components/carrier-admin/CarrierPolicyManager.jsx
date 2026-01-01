import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Shield, TrendingUp, AlertTriangle } from "lucide-react";

export default function CarrierPolicyManager({ carrierId }) {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const queryClient = useQueryClient();

  const { data: policies, isLoading } = useQuery({
    queryKey: ['carrierDriverPolicies', carrierId],
    queryFn: () => base44.entities.CarrierDriverPolicy.filter({ carrier_id: carrierId }),
    initialData: []
  });

  const createPolicyMutation = useMutation({
    mutationFn: (data) => base44.entities.CarrierDriverPolicy.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrierDriverPolicies'] });
      setSelectedFeature(null);
    }
  });

  const updatePolicyMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CarrierDriverPolicy.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrierDriverPolicies'] });
    }
  });

  const features = [
    { key: 'detention_timer', label: 'Detention Timer', systemMin: { loads: 1 } },
    { key: 'accessorial_requests', label: 'Accessorial Requests', systemMin: { loads: 3 } },
    { key: 'profit_explain', label: 'Profit Breakdown', systemMin: { loads: 5, onTime: 90, doc: 90, dispute: 10 } },
    { key: 'counteroffers', label: 'Rate Counteroffers', systemMin: { loads: 5, onTime: 90, doc: 90, dispute: 10 } },
    { key: 'what_if_pricing', label: 'What-If Pricing', systemMin: { loads: 5, onTime: 90, doc: 90, dispute: 10 } },
    { key: 'instant_pay', label: 'Instant Pay', systemMin: { loads: 10, onTime: 90, doc: 85, dispute: 10 } },
    { key: 'accessorial_auto_approval', label: 'Auto-Approve Accessorials', systemMin: { loads: 20, onTime: 95, doc: 95, dispute: 5 } },
    { key: 'detention_self_edit', label: 'Self-Edit Detention', systemMin: { loads: 30, onTime: 95, doc: 95, dispute: 5 } }
  ];

  const PolicyForm = ({ feature, existing }) => {
    const [formData, setFormData] = useState(existing || {
      carrier_id: carrierId,
      feature_key: feature.key,
      enabled: true,
      min_completed_loads: feature.systemMin.loads,
      min_on_time_pct: feature.systemMin.onTime || 0,
      min_doc_on_time_pct: feature.systemMin.doc || 0,
      max_dispute_rate: feature.systemMin.dispute || 100,
      cooldown_days: 30
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (existing) {
        updatePolicyMutation.mutate({ id: existing.id, data: formData });
      } else {
        createPolicyMutation.mutate(formData);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Feature Enabled</Label>
          <Switch
            checked={formData.enabled}
            onCheckedChange={(enabled) => setFormData({...formData, enabled})}
          />
        </div>

        <div>
          <Label>Minimum Completed Loads</Label>
          <Input
            type="number"
            value={formData.min_completed_loads}
            onChange={(e) => setFormData({...formData, min_completed_loads: Number(e.target.value)})}
            min={feature.systemMin.loads}
          />
          <p className="text-xs text-slate-500 mt-1">System minimum: {feature.systemMin.loads}</p>
        </div>

        {feature.systemMin.onTime && (
          <div>
            <Label>Minimum On-Time %</Label>
            <Input
              type="number"
              value={formData.min_on_time_pct}
              onChange={(e) => setFormData({...formData, min_on_time_pct: Number(e.target.value)})}
              min={feature.systemMin.onTime}
              max={100}
            />
            <p className="text-xs text-slate-500 mt-1">System minimum: {feature.systemMin.onTime}%</p>
          </div>
        )}

        {feature.systemMin.doc && (
          <div>
            <Label>Minimum Document On-Time %</Label>
            <Input
              type="number"
              value={formData.min_doc_on_time_pct}
              onChange={(e) => setFormData({...formData, min_doc_on_time_pct: Number(e.target.value)})}
              min={feature.systemMin.doc}
              max={100}
            />
            <p className="text-xs text-slate-500 mt-1">System minimum: {feature.systemMin.doc}%</p>
          </div>
        )}

        {feature.systemMin.dispute && (
          <div>
            <Label>Maximum Dispute Rate %</Label>
            <Input
              type="number"
              value={formData.max_dispute_rate}
              onChange={(e) => setFormData({...formData, max_dispute_rate: Number(e.target.value)})}
              max={feature.systemMin.dispute}
            />
            <p className="text-xs text-slate-500 mt-1">System maximum: {feature.systemMin.dispute}%</p>
          </div>
        )}

        <div>
          <Label>Cooldown Period (days)</Label>
          <Input
            type="number"
            value={formData.cooldown_days}
            onChange={(e) => setFormData({...formData, cooldown_days: Number(e.target.value)})}
            min={7}
            max={90}
          />
        </div>

        {feature.key === 'counteroffers' && (
          <div>
            <Label>Counteroffer Range %</Label>
            <Input
              type="number"
              value={formData.counteroffer_range_pct || 10}
              onChange={(e) => setFormData({...formData, counteroffer_range_pct: Number(e.target.value)})}
              min={5}
              max={20}
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => setSelectedFeature(null)} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1 bg-indigo-600">
            {existing ? 'Update' : 'Create'} Policy
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading policies...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Driver Feature Policies
          </CardTitle>
          <p className="text-sm text-slate-600">
            Configure eligibility thresholds for driver features. System minimums cannot be weakened.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map(feature => {
              const policy = policies.find(p => p.feature_key === feature.key);
              
              return (
                <Card key={feature.key} className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-900">{feature.label}</h3>
                      {policy ? (
                        policy.enabled ? (
                          <Badge className="bg-green-500">Enabled</Badge>
                        ) : (
                          <Badge className="bg-red-500">Disabled</Badge>
                        )
                      ) : (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </div>

                    {policy ? (
                      <div className="space-y-1 text-xs text-slate-600">
                        <div>Loads: {policy.min_completed_loads}</div>
                        {policy.min_on_time_pct > 0 && <div>On-Time: {policy.min_on_time_pct}%</div>}
                        {policy.min_doc_on_time_pct > 0 && <div>Doc: {policy.min_doc_on_time_pct}%</div>}
                        {policy.max_dispute_rate < 100 && <div>Max Disputes: {policy.max_dispute_rate}%</div>}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">Using system defaults</div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFeature(feature)}
                      className="w-full mt-3"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {policy ? 'Edit' : 'Configure'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedFeature && (
        <Card className="border-2 border-indigo-200">
          <CardHeader>
            <CardTitle>{selectedFeature.label} Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <PolicyForm
              feature={selectedFeature}
              existing={policies.find(p => p.feature_key === selectedFeature.key)}
            />
          </CardContent>
        </Card>
      )}

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">System Minimums Enforced</p>
            <p className="text-amber-700">
              You can strengthen thresholds but cannot weaken them below system minimums. This ensures consistent driver quality and prevents abuse.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}