import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RateEntryForm({ lanePreference, onComplete }) {
  const [rateData, setRateData] = useState({
    lane_preference_id: lanePreference.id,
    rate_type: 'per_mile',
    target_rpm_cents: '',
    target_flat_cents: '',
    fuel_mode: 'included',
    effective_start: new Date().toISOString().split('T')[0]
  });
  
  const [profitabilityPreview, setProfitabilityPreview] = useState(null);
  
  const queryClient = useQueryClient();
  
  const createRateMutation = useMutation({
    mutationFn: (data) => base44.entities.LaneRatePreference.create({
      ...data,
      target_rpm_cents: data.target_rpm_cents ? Number(data.target_rpm_cents) : undefined,
      target_flat_cents: data.target_flat_cents ? Number(data.target_flat_cents) : undefined
    }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['laneRatePreferences'] });
      setProfitabilityPreview(result);
      if (onComplete) onComplete(result);
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    createRateMutation.mutate(rateData);
  };
  
  const formatCents = (cents) => {
    if (!cents) return '$0.00';
    return `$${(cents / 100).toFixed(2)}`;
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Enter Target Rate
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <Label>Rate Type</Label>
              <Select value={rateData.rate_type} onValueChange={(value) => setRateData({...rateData, rate_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_mile">Per Mile (RPM)</SelectItem>
                  <SelectItem value="flat">Flat Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {rateData.rate_type === 'per_mile' && (
              <div>
                <Label>Target Revenue Per Mile (cents)</Label>
                <Input
                  type="number"
                  value={rateData.target_rpm_cents}
                  onChange={(e) => setRateData({...rateData, target_rpm_cents: e.target.value})}
                  placeholder="200 (= $2.00/mi)"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Example: 200 cents = $2.00 per mile
                </p>
              </div>
            )}
            
            {rateData.rate_type === 'flat' && (
              <div>
                <Label>Target Flat Rate (cents)</Label>
                <Input
                  type="number"
                  value={rateData.target_flat_cents}
                  onChange={(e) => setRateData({...rateData, target_flat_cents: e.target.value})}
                  placeholder="100000 (= $1000.00)"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Example: 100000 cents = $1,000.00 flat
                </p>
              </div>
            )}
            
            <div>
              <Label>Fuel Surcharge</Label>
              <Select value={rateData.fuel_mode} onValueChange={(value) => setRateData({...rateData, fuel_mode: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="included">Included in Rate</SelectItem>
                  <SelectItem value="fsc_separate">Separate FSC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Effective Start Date</Label>
              <Input
                type="date"
                value={rateData.effective_start}
                onChange={(e) => setRateData({...rateData, effective_start: e.target.value})}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600"
              disabled={createRateMutation.isPending}
            >
              {createRateMutation.isPending ? 'Calculating Profitability...' : 'Calculate & Save Rate'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Profitability Preview (shown after save) */}
      {profitabilityPreview && (
        <Card className="border-2 border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Profitability Analysis
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              {profitabilityPreview.driver_profitability_ok !== undefined && (
                <Badge className={profitabilityPreview.driver_profitability_ok ? 'bg-green-500' : 'bg-red-500'}>
                  {profitabilityPreview.driver_profitability_ok ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                  Driver: {profitabilityPreview.driver_profitability_ok ? 'OK' : 'Below Min'}
                </Badge>
              )}
              
              {profitabilityPreview.carrier_profitability_ok !== undefined && (
                <Badge className={profitabilityPreview.carrier_profitability_ok ? 'bg-green-500' : 'bg-red-500'}>
                  {profitabilityPreview.carrier_profitability_ok ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                  Carrier: {profitabilityPreview.carrier_profitability_ok ? 'OK' : 'Below Min'}
                </Badge>
              )}
              
              {profitabilityPreview.ownerop_profitability_ok !== undefined && (
                <Badge className={profitabilityPreview.ownerop_profitability_ok ? 'bg-green-500' : 'bg-red-500'}>
                  {profitabilityPreview.ownerop_profitability_ok ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                  Owner-Op: {profitabilityPreview.ownerop_profitability_ok ? 'OK' : 'Below Min'}
                </Badge>
              )}
              
              {profitabilityPreview.broker_profitability_ok !== undefined && (
                <Badge className={profitabilityPreview.broker_profitability_ok ? 'bg-green-500' : 'bg-red-500'}>
                  {profitabilityPreview.broker_profitability_ok ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                  Broker: {profitabilityPreview.broker_profitability_ok ? 'OK' : 'Below Min'}
                </Badge>
              )}
            </div>
            
            {/* Computed Values */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-slate-600">Customer Revenue</p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatCents(profitabilityPreview.computed_customer_revenue_cents)}
                </p>
              </div>
              
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-slate-600">Carrier Pay</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCents(profitabilityPreview.computed_carrier_pay_cents)}
                </p>
              </div>
              
              {profitabilityPreview.computed_broker_margin_cents !== undefined && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-slate-600">Broker Margin</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatCents(profitabilityPreview.computed_broker_margin_cents)}
                  </p>
                </div>
              )}
              
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-slate-600">Operating Cost</p>
                <p className="text-lg font-bold text-amber-600">
                  {formatCents(profitabilityPreview.computed_operating_cost_cents)}
                </p>
              </div>
            </div>
            
            {/* Minimum Recommendations */}
            <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-200">
              <p className="text-sm font-semibold text-indigo-900 mb-2">💡 Minimum Profitable Rate</p>
              <p className="text-xs text-slate-600">
                Per Mile: <span className="font-bold text-indigo-600">{formatCents(profitabilityPreview.computed_min_profitable_rpm_cents)}</span> /mi
              </p>
              <p className="text-xs text-slate-600">
                Flat: <span className="font-bold text-indigo-600">{formatCents(profitabilityPreview.computed_min_profitable_flat_cents)}</span>
              </p>
            </div>
            
            {profitabilityPreview.approval_status === 'pending' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Pending Approval
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  This rate does not meet profitability requirements and requires manager approval.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}