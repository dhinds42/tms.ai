import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Truck, Lock, AlertTriangle, CheckCircle, MapPin, DollarSign } from "lucide-react";

export default function DriverLaneAcceptance() {
  const [selectedLane, setSelectedLane] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: assignedLanes, isLoading } = useQuery({
    queryKey: ['myAssignedLanes'],
    queryFn: async () => {
      const lanes = await base44.entities.LaneRate.list('-created_date', 100);
      // Filter lanes assigned to current driver
      return lanes.filter(l => l.assigned_driver_id === user?.id);
    },
    initialData: [],
    enabled: !!user,
  });

  const acceptLaneMutation = useMutation({
    mutationFn: async (laneRateId) => {
      await base44.entities.LaneRate.update(laneRateId, {
        driver_accepted: true,
        driver_accepted_at: new Date().toISOString(),
        status: 'active',
        flagged: false
      });
      // Log history
      await base44.entities.LaneRateHistory.create({
        lane_rate_id: laneRateId,
        action: 'accepted',
        changed_by_user_id: user.id,
        changed_by_role: 'driver',
        system_source: 'tms_b',
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myAssignedLanes']);
      setSelectedLane(null);
    },
  });

  const declineLaneMutation = useMutation({
    mutationFn: async ({ laneRateId, reason }) => {
      await base44.entities.LaneRate.update(laneRateId, {
        driver_accepted: false,
        driver_declined_reason: reason,
        status: 'declined',
        flagged: true
      });
      // Log history
      await base44.entities.LaneRateHistory.create({
        lane_rate_id: laneRateId,
        action: 'declined',
        changed_by_user_id: user.id,
        changed_by_role: 'driver',
        reason: reason,
        system_source: 'tms_b',
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myAssignedLanes']);
      setSelectedLane(null);
      setDeclineReason('');
    },
  });

  const pendingLanes = assignedLanes.filter(l => l.flagged && !l.driver_accepted);
  const acceptedLanes = assignedLanes.filter(l => l.driver_accepted);
  const lockedLanes = assignedLanes.filter(l => l.locked_until && new Date(l.locked_until) > new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            My Assigned Lanes
          </h1>
          <p className="text-slate-600 mt-2">TMS-B: Driver-Facing Lane Management</p>
          <Badge className="mt-2 bg-blue-600">Driver Portal</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending Review</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingLanes.length}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Accepted</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{acceptedLanes.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Locked Rates</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{lockedLanes.length}</p>
                </div>
                <Lock className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Lanes */}
        {pendingLanes.length > 0 && (
          <Card className="border-0 shadow-xl border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Lanes Requiring Your Acceptance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingLanes.map(lane => (
                  <Card key={lane.id} className="border-2 border-amber-200 bg-amber-50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-slate-600" />
                            <span className="font-bold text-lg text-slate-900">
                              {lane.origin_city}, {lane.origin_state} → {lane.destination_city}, {lane.destination_state}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <span className="text-2xl font-bold text-emerald-600">
                              ${lane.driver_rate?.toLocaleString()}
                            </span>
                            <span className="text-sm text-slate-600">per load</span>
                          </div>
                          <p className="text-sm text-slate-600 mt-2">{lane.lane_miles} miles</p>
                        </div>
                        <Badge className="bg-amber-600">Requires Action</Badge>
                      </div>

                      {lane.locked_until && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-blue-600" />
                            <p className="text-sm text-blue-900 font-semibold">Rate Locked Until {new Date(lane.locked_until).toLocaleDateString()}</p>
                          </div>
                          <p className="text-xs text-blue-700 mt-1">{lane.lock_reason || 'Rates are locked per contract terms'}</p>
                        </div>
                      )}

                      {lane.flagged_reason && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-900 font-semibold">Reason:</p>
                          <p className="text-sm text-amber-700">{lane.flagged_reason}</p>
                        </div>
                      )}

                      {selectedLane?.id === lane.id ? (
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Reason for declining (optional)"
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            className="min-h-20"
                          />
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => acceptLaneMutation.mutate(lane.id)}
                              className="flex-1 bg-emerald-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Accept Lane
                            </Button>
                            <Button 
                              onClick={() => declineLaneMutation.mutate({ laneRateId: lane.id, reason: declineReason })}
                              variant="destructive"
                              className="flex-1"
                            >
                              Decline Lane
                            </Button>
                            <Button 
                              onClick={() => {
                                setSelectedLane(null);
                                setDeclineReason('');
                              }}
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => acceptLaneMutation.mutate(lane.id)}
                            className="flex-1 bg-emerald-600"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button 
                            onClick={() => setSelectedLane(lane)}
                            variant="outline"
                            className="flex-1"
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accepted Lanes */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              My Active Lanes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {acceptedLanes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {acceptedLanes.map(lane => (
                  <Card key={lane.id} className="border border-emerald-200 bg-emerald-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-slate-900">
                            {lane.origin_city}, {lane.origin_state} → {lane.destination_city}, {lane.destination_state}
                          </p>
                          <p className="text-sm text-slate-600">{lane.lane_miles} miles</p>
                        </div>
                        <Badge className="bg-emerald-600">Active</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        <span className="text-xl font-bold text-emerald-600">
                          ${lane.driver_rate?.toLocaleString()}
                        </span>
                      </div>
                      {lane.locked_until && new Date(lane.locked_until) > new Date() && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
                          <Lock className="w-3 h-3" />
                          <span>Locked until {new Date(lane.locked_until).toLocaleDateString()}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No active lanes yet</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}