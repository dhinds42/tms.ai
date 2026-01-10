import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Navigation, DollarSign, TrendingUp, Settings, History, Plus } from "lucide-react";

import LaneBuilder from "../components/lane-profitability/LaneBuilder";
import RateEntryForm from "../components/lane-profitability/RateEntryForm";
import ProfitabilityDashboard from "../components/lane-profitability/ProfitabilityDashboard";
import AIRateSuggestions from "../components/lane-profitability/AIRateSuggestions";
import CostProfileManager from "../components/lane-profitability/CostProfileManager";
import ProfitabilityHistory from "../components/lane-profitability/ProfitabilityHistory";

export default function LaneProfitability() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showLaneBuilder, setShowLaneBuilder] = useState(false);
  const [selectedLane, setSelectedLane] = useState(null);
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });
  
  const { data: lanePreferences, isLoading: lanesLoading } = useScopedEntity('LanePreference', { limit: 100 });
  const { data: laneRates, isLoading: ratesLoading } = useScopedEntity('LaneRatePreference', { limit: 100 });
  const { data: costProfiles } = useScopedEntity('CostProfile', { limit: 50 });
  
  const myLanes = lanePreferences.filter(lane => 
    (user?.role === 'driver' && lane.actor_type === 'driver') ||
    (user?.role === 'carrier' && lane.actor_type === 'carrier') ||
    (user?.role === 'owner_operator' && lane.actor_type === 'owner_operator') ||
    user?.role === 'broker' ||
    user?.role === 'admin'
  );
  
  const approvedRates = laneRates.filter(r => r.approval_status === 'approved').length;
  const pendingRates = laneRates.filter(r => r.approval_status === 'pending').length;
  const profitableLanes = laneRates.filter(r => 
    r.carrier_profitability_ok && r.broker_profitability_ok
  ).length;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Lane Profitability Manager
            </h1>
            <p className="text-slate-600 mt-2">
              Configure lanes, set target rates, and ensure profitability across all parties
            </p>
          </div>
          <Button
            onClick={() => setShowLaneBuilder(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Lane
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">My Lanes</p>
                  <p className="text-2xl font-bold text-slate-900">{myLanes.length}</p>
                </div>
                <Navigation className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Approved Rates</p>
                  <p className="text-2xl font-bold text-emerald-600">{approvedRates}</p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingRates}</p>
                </div>
                <Settings className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Profitable Lanes</p>
                  <p className="text-2xl font-bold text-purple-600">{profitableLanes}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lanes">My Lanes</TabsTrigger>
            <TabsTrigger value="rates">Rates & Profitability</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <ProfitabilityDashboard 
              lanePreferences={myLanes}
              laneRates={laneRates}
              costProfiles={costProfiles}
            />
          </TabsContent>
          
          <TabsContent value="lanes">
            {showLaneBuilder ? (
              <LaneBuilder
                actorType={user?.role === 'driver' ? 'driver' : user?.role === 'owner_operator' ? 'owner_operator' : 'carrier'}
                actorId={user?.id}
                onComplete={() => setShowLaneBuilder(false)}
              />
            ) : (
              <div className="space-y-4">
                {myLanes.map(lane => (
                  <Card key={lane.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedLane(lane)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {lane.origin_city}, {lane.origin_state} → {lane.destination_city}, {lane.destination_state}
                          </p>
                          <p className="text-sm text-slate-600">
                            {lane.equipment_type} • Max Deadhead: {lane.max_deadhead_miles} mi
                          </p>
                        </div>
                        <Badge>{lane.is_active ? 'Active' : 'Inactive'}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rates">
            {selectedLane ? (
              <RateEntryForm
                lanePreference={selectedLane}
                onComplete={() => setSelectedLane(null)}
              />
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-600">Select a lane from the "My Lanes" tab to enter rates</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Rate History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {laneRates.map(rate => (
                    <div key={rate.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900">
                            {rate.rate_type === 'per_mile' ? 'Per Mile' : 'Flat'}: {formatCents(rate.target_rpm_cents || rate.target_flat_cents)}
                          </p>
                          <p className="text-xs text-slate-600">
                            Version {rate.version} • Created {new Date(rate.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={rate.approval_status === 'approved' ? 'bg-green-500' : 'bg-amber-500'}>
                          {rate.approval_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
      </div>
    </div>
  );
}

function formatCents(cents) {
  if (!cents) return '$0.00';
  return `$${(cents / 100).toFixed(2)}`;
}