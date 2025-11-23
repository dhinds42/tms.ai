import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Radio, Zap, Clock, CheckCircle, TrendingUp, Settings } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AutomatedTendering() {
  const [autoTenderEnabled, setAutoTenderEnabled] = useState(true);
  const [tenderingRules, setTenderingRules] = useState({
    maxTimeToTender: 30,
    minCarrierRating: 4.0,
    maxRetries: 3,
    preferredCarriersFirst: true
  });
  const queryClient = useQueryClient();

  const { data: loads } = useQuery({
    queryKey: ['availableLoads'],
    queryFn: () => base44.entities.Load.filter({ status: 'available' }, '-created_date', 50),
    initialData: [],
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const automatedTenderStats = {
    pendingTenders: loads.length,
    successRate: 94.5,
    avgTenderTime: 18,
    savedHours: 142
  };

  const runAutoTender = useMutation({
    mutationFn: async (loadId) => {
      const load = loads.find(l => l.id === loadId);
      if (!load) return;

      const qualifiedCarriers = carriers
        .filter(c => c.rating >= tenderingRules.minCarrierRating)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));

      if (qualifiedCarriers.length > 0) {
        const selectedCarrier = qualifiedCarriers[0];
        
        await base44.entities.Load.update(loadId, {
          status: 'tendered',
          carrier_id: selectedCarrier.id
        });

        await base44.entities.Notification.create({
          user_id: selectedCarrier.id,
          notification_type: 'load_assigned',
          channel: 'in_app',
          title: 'Load Tendered',
          message: `Load ${load.load_number} has been automatically tendered to you.`,
          priority: 'high'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['availableLoads']);
      queryClient.invalidateQueries(['notifications']);
    },
  });

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Automated Load Tendering</CardTitle>
              <p className="text-sm text-slate-600 mt-1">AI-powered carrier selection & tendering</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">
              {autoTenderEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <Switch
              checked={autoTenderEnabled}
              onCheckedChange={setAutoTenderEnabled}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{automatedTenderStats.pendingTenders}</p>
              <p className="text-xs text-slate-600 mt-1">Pending</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-600">{automatedTenderStats.successRate}%</p>
              <p className="text-xs text-slate-600 mt-1">Success Rate</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
              <Zap className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-600">{automatedTenderStats.avgTenderTime}m</p>
              <p className="text-xs text-slate-600 mt-1">Avg Time</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{automatedTenderStats.savedHours}h</p>
              <p className="text-xs text-slate-600 mt-1">Time Saved</p>
            </div>
          </div>

          {/* Tendering Rules */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Tendering Rules</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Max Time to Tender</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={tenderingRules.maxTimeToTender}
                    onChange={(e) => setTenderingRules({...tenderingRules, maxTimeToTender: parseInt(e.target.value)})}
                    className="flex-1"
                  />
                  <Badge variant="outline">{tenderingRules.maxTimeToTender}m</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Min Carrier Rating</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={tenderingRules.minCarrierRating}
                    onChange={(e) => setTenderingRules({...tenderingRules, minCarrierRating: parseFloat(e.target.value)})}
                    className="flex-1"
                  />
                  <Badge variant="outline">{tenderingRules.minCarrierRating}★</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Max Retries</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={tenderingRules.maxRetries}
                    onChange={(e) => setTenderingRules({...tenderingRules, maxRetries: parseInt(e.target.value)})}
                    className="flex-1"
                  />
                  <Badge variant="outline">{tenderingRules.maxRetries}x</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded border border-slate-200">
                <span className="text-sm font-medium text-slate-700">Preferred Carriers First</span>
                <Switch
                  checked={tenderingRules.preferredCarriersFirst}
                  onCheckedChange={(checked) => setTenderingRules({...tenderingRules, preferredCarriersFirst: checked})}
                />
              </div>
            </div>
          </div>

          {/* Pending Loads */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Pending Loads ({loads.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {loads.slice(0, 5).map(load => (
                <div key={load.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">{load.load_number}</p>
                    <p className="text-sm text-slate-600">
                      {load.pickup_location?.city} → {load.dropoff_location?.city}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => runAutoTender.mutate(load.id)}
                    disabled={!autoTenderEnabled || runAutoTender.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Auto Tender
                  </Button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}