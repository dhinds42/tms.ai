import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Lock, Unlock } from "lucide-react";

export default function DriverEligibilityManager({ driverId, featureKey, currentEligibility }) {
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [cooldownDays, setCooldownDays] = useState('30');
  const [cooldownReason, setCooldownReason] = useState('');
  const queryClient = useQueryClient();

  const grantOverrideMutation = useMutation({
    mutationFn: async () => {
      if (currentEligibility) {
        return base44.entities.DriverFeatureEligibility.update(currentEligibility.id, {
          carrier_override: true,
          override_reason: overrideReason,
          override_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        });
      } else {
        return base44.entities.DriverFeatureEligibility.create({
          driver_id: driverId,
          feature_key: featureKey,
          carrier_override: true,
          override_reason: overrideReason,
          eligible: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverFeatureEligibility'] });
      setShowOverride(false);
      setOverrideReason('');
    }
  });

  const applyCooldownMutation = useMutation({
    mutationFn: () => {
      const cooldownUntil = new Date(Date.now() + parseInt(cooldownDays) * 24 * 60 * 60 * 1000).toISOString();
      
      if (currentEligibility) {
        return base44.entities.DriverFeatureEligibility.update(currentEligibility.id, {
          cooldown_until: cooldownUntil,
          cooldown_reason: cooldownReason
        });
      } else {
        return base44.entities.DriverFeatureEligibility.create({
          driver_id: driverId,
          feature_key: featureKey,
          eligible: false,
          reason: cooldownReason,
          cooldown_until: cooldownUntil,
          cooldown_reason: cooldownReason
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverFeatureEligibility'] });
      setCooldownReason('');
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4" />
          Eligibility Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {!showOverride ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowOverride(true)}
              className="flex-1"
            >
              <Unlock className="w-4 h-4 mr-1" />
              Grant Override
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowOverride(true)}
              className="flex-1"
            >
              <Lock className="w-4 h-4 mr-1" />
              Apply Cooldown
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Action</Label>
              <Select defaultValue="override">
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="override">Grant Override</SelectItem>
                  <SelectItem value="cooldown">Apply Cooldown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Reason</Label>
              <Textarea
                value={overrideReason || cooldownReason}
                onChange={(e) => {
                  setOverrideReason(e.target.value);
                  setCooldownReason(e.target.value);
                }}
                rows={2}
                className="text-sm"
                placeholder="Explain why..."
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowOverride(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => grantOverrideMutation.mutate()}
                className="flex-1 bg-indigo-600"
                disabled={!overrideReason.trim()}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}