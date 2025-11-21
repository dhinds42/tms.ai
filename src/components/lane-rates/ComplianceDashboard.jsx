import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Lock } from "lucide-react";

export default function ComplianceDashboard({ laneRates }) {
  const queryClient = useQueryClient();

  const approveLaneMutation = useMutation({
    mutationFn: async (laneRateId) => {
      const user = await base44.auth.me();
      await base44.entities.LaneRate.update(laneRateId, {
        compliance_approved: true,
        compliance_approved_by: user.id,
        compliance_approved_at: new Date().toISOString(),
        status: 'active'
      });
      // Log history
      await base44.entities.LaneRateHistory.create({
        lane_rate_id: laneRateId,
        action: 'approved',
        changed_by_user_id: user.id,
        changed_by_role: 'broker',
        system_source: 'tms_a',
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['laneRates']);
    },
  });

  const flagLaneMutation = useMutation({
    mutationFn: async ({ laneRateId, reason }) => {
      const user = await base44.auth.me();
      await base44.entities.LaneRate.update(laneRateId, {
        flagged: true,
        flagged_reason: reason,
        status: 'flagged'
      });
      // Log history
      await base44.entities.LaneRateHistory.create({
        lane_rate_id: laneRateId,
        action: 'flagged',
        changed_by_user_id: user.id,
        changed_by_role: 'broker',
        reason: reason,
        system_source: 'tms_a',
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['laneRates']);
    },
  });

  const pendingApproval = laneRates.filter(r => !r.compliance_approved && r.status === 'pending');
  const flaggedRates = laneRates.filter(r => r.flagged);
  const approvedRates = laneRates.filter(r => r.compliance_approved);

  return (
    <div className="space-y-6">
      
      {/* Pending Approval */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Pending Compliance Approval ({pendingApproval.length})
        </h3>
        <div className="space-y-3">
          {pendingApproval.map(lane => (
            <Card key={lane.id} className="border-2 border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 mb-1">
                      {lane.origin_city}, {lane.origin_state} → {lane.destination_city}, {lane.destination_state}
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Customer</p>
                        <p className="font-semibold">${lane.customer_rate?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Carrier</p>
                        <p className="font-semibold">${lane.carrier_rate?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Margin</p>
                        <p className="font-semibold text-emerald-600">{lane.margin_percentage?.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Total</p>
                        <p className="font-semibold">${lane.total_margin?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveLaneMutation.mutate(lane.id)}
                      className="bg-emerald-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => flagLaneMutation.mutate({ laneRateId: lane.id, reason: 'Requires driver acceptance' })}
                    >
                      Flag for Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingApproval.length === 0 && (
            <p className="text-center text-slate-500 py-8">No pending approvals</p>
          )}
        </div>
      </div>

      {/* Flagged Rates */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Flagged Rates ({flaggedRates.length})
        </h3>
        <div className="space-y-3">
          {flaggedRates.map(lane => (
            <Card key={lane.id} className="border border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">
                      {lane.origin_city}, {lane.origin_state} → {lane.destination_city}, {lane.destination_state}
                    </p>
                    <p className="text-sm text-orange-700 mt-1">{lane.flagged_reason}</p>
                    {lane.driver_declined_reason && (
                      <p className="text-sm text-red-700 mt-1">Driver declined: {lane.driver_declined_reason}</p>
                    )}
                  </div>
                  <Badge className="bg-orange-600">Flagged</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {flaggedRates.length === 0 && (
            <p className="text-center text-slate-500 py-8">No flagged rates</p>
          )}
        </div>
      </div>

      {/* Approved Rates */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          Approved & Active ({approvedRates.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {approvedRates.slice(0, 6).map(lane => (
            <Card key={lane.id} className="border border-emerald-200 bg-emerald-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">
                      {lane.origin_city}, {lane.origin_state} → {lane.destination_city}, {lane.destination_state}
                    </p>
                    <p className="text-xs text-emerald-700">
                      Approved {lane.compliance_approved_at && new Date(lane.compliance_approved_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-emerald-600">Active</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}