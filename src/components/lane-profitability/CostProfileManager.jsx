import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Fuel, Wrench, Shield, TrendingUp, Plus } from "lucide-react";

export default function CostProfileManager({ actorType, actorId, existingProfile }) {
  const [editing, setEditing] = useState(!existingProfile);
  const [profileData, setProfileData] = useState(existingProfile || {
    actor_type: actorType,
    actor_id: actorId,
    profile_name: 'Default Profile',
    fuel_cost_per_mile_cents: 75,
    maintenance_cost_per_mile_cents: 15,
    insurance_cost_per_mile_cents: 10,
    overhead_cost_per_mile_cents: 20,
    tolls_cost_per_mile_cents: 5,
    desired_profit_per_mile_cents: 30,
    desired_margin_bps: 1500,
    is_active: true
  });
  
  const queryClient = useQueryClient();
  
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingProfile) {
        return await base44.entities.CostProfile.update(existingProfile.id, data);
      } else {
        return await base44.entities.CostProfile.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costProfiles'] });
      setEditing(false);
    }
  });
  
  const totalCPM = (
    (profileData.fuel_cost_per_mile_cents || 0) +
    (profileData.maintenance_cost_per_mile_cents || 0) +
    (profileData.insurance_cost_per_mile_cents || 0) +
    (profileData.overhead_cost_per_mile_cents || 0) +
    (profileData.tolls_cost_per_mile_cents || 0)
  ) / 100;
  
  const minRPM = (totalCPM + ((profileData.desired_profit_per_mile_cents || 0) / 100)).toFixed(2);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Cost Profile
            {existingProfile && <Badge variant="outline">Active</Badge>}
          </CardTitle>
          {existingProfile && !editing && (
            <Button onClick={() => setEditing(true)} size="sm" variant="outline">
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Fuel className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-slate-600">Fuel</p>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  ${(profileData.fuel_cost_per_mile_cents / 100).toFixed(2)}/mi
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className="w-4 h-4 text-orange-600" />
                  <p className="text-xs text-slate-600">Maintenance</p>
                </div>
                <p className="text-lg font-bold text-orange-600">
                  ${(profileData.maintenance_cost_per_mile_cents / 100).toFixed(2)}/mi
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <p className="text-xs text-slate-600">Insurance</p>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  ${(profileData.insurance_cost_per_mile_cents / 100).toFixed(2)}/mi
                </p>
              </div>
              
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs text-slate-600">Desired Profit</p>
                </div>
                <p className="text-lg font-bold text-emerald-600">
                  ${(profileData.desired_profit_per_mile_cents / 100).toFixed(2)}/mi
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
              <p className="text-sm text-slate-600 mb-1">Minimum Rate Per Mile</p>
              <p className="text-3xl font-bold text-indigo-600">${minRPM}/mi</p>
              <p className="text-xs text-slate-600 mt-1">
                Total operating cost: ${totalCPM.toFixed(2)}/mi
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label>Profile Name</Label>
              <Input
                value={profileData.profile_name}
                onChange={(e) => setProfileData({...profileData, profile_name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fuel Cost ($/mi)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(profileData.fuel_cost_per_mile_cents / 100).toFixed(2)}
                  onChange={(e) => setProfileData({...profileData, fuel_cost_per_mile_cents: Math.round(Number(e.target.value) * 100)})}
                />
              </div>
              
              <div>
                <Label>Maintenance ($/mi)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(profileData.maintenance_cost_per_mile_cents / 100).toFixed(2)}
                  onChange={(e) => setProfileData({...profileData, maintenance_cost_per_mile_cents: Math.round(Number(e.target.value) * 100)})}
                />
              </div>
              
              <div>
                <Label>Insurance ($/mi)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(profileData.insurance_cost_per_mile_cents / 100).toFixed(2)}
                  onChange={(e) => setProfileData({...profileData, insurance_cost_per_mile_cents: Math.round(Number(e.target.value) * 100)})}
                />
              </div>
              
              <div>
                <Label>Overhead ($/mi)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(profileData.overhead_cost_per_mile_cents / 100).toFixed(2)}
                  onChange={(e) => setProfileData({...profileData, overhead_cost_per_mile_cents: Math.round(Number(e.target.value) * 100)})}
                />
              </div>
              
              <div>
                <Label>Tolls ($/mi)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(profileData.tolls_cost_per_mile_cents / 100).toFixed(2)}
                  onChange={(e) => setProfileData({...profileData, tolls_cost_per_mile_cents: Math.round(Number(e.target.value) * 100)})}
                />
              </div>
              
              <div>
                <Label>Desired Profit ($/mi)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(profileData.desired_profit_per_mile_cents / 100).toFixed(2)}
                  onChange={(e) => setProfileData({...profileData, desired_profit_per_mile_cents: Math.round(Number(e.target.value) * 100)})}
                />
              </div>
            </div>
            
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-semibold text-slate-900">Preview Min Rate: ${minRPM}/mi</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => saveMutation.mutate(profileData)} 
                className="flex-1 bg-emerald-600"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
              {existingProfile && (
                <Button 
                  onClick={() => {
                    setProfileData(existingProfile);
                    setEditing(false);
                  }} 
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}