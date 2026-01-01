import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, User, TrendingUp, AlertCircle } from "lucide-react";

export default function FeatureApprovalQueue({ carrierId }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalReason, setApprovalReason] = useState('');
  const [denialReason, setDenialReason] = useState('');
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['featureApprovalRequests', carrierId],
    queryFn: async () => {
      // Get all drivers for this carrier
      const drivers = await base44.entities.Driver.filter({ party_id: carrierId });
      const driverIds = drivers.map(d => d.id);
      
      // Get approval requests for these drivers
      const allRequests = await base44.entities.FeatureApprovalRequest.list('-created_date', 100);
      return allRequests.filter(r => driverIds.includes(r.driver_id));
    },
    initialData: []
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, reason }) => 
      base44.entities.FeatureApprovalRequest.update(id, {
        status: 'approved',
        approval_reason: reason
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureApprovalRequests'] });
      setSelectedRequest(null);
      setApprovalReason('');
    }
  });

  const denyMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      base44.entities.FeatureApprovalRequest.update(id, {
        status: 'denied',
        denial_reason: reason
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureApprovalRequests'] });
      setSelectedRequest(null);
      setDenialReason('');
    }
  });

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const recentlyReviewed = requests.filter(r => r.status !== 'pending').slice(0, 5);

  const featureLabels = {
    counteroffers: 'Rate Counteroffers',
    what_if_pricing: 'What-If Pricing',
    facility_intel: 'Facility Intelligence',
    offline_mode: 'Offline Mode',
    instant_pay: 'Instant Pay',
    driver_scorecard: 'Driver Scorecard'
  };

  const ApprovalForm = ({ request }) => (
    <Card className="border-2 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Review Feature Request</span>
          <Badge className="bg-amber-500">Pending</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">Feature</p>
            <p className="font-semibold">{featureLabels[request.feature_key]}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Request Type</p>
            <p className="font-semibold capitalize">{request.request_type.replace('_', ' ')}</p>
          </div>
        </div>

        {request.metrics_at_request && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-slate-900 mb-2">Driver Metrics</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Completed Loads:</span>
                <span className="font-semibold">{request.metrics_at_request.completed_loads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">On-Time:</span>
                <span className="font-semibold">{request.metrics_at_request.on_time_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Doc On-Time:</span>
                <span className="font-semibold">{request.metrics_at_request.doc_on_time_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dispute Rate:</span>
                <span className="font-semibold">{request.metrics_at_request.dispute_rate}%</span>
              </div>
            </div>
          </div>
        )}

        {request.eligibility_met ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-900">Driver meets technical requirements</span>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-900">Driver does not meet technical requirements</span>
          </div>
        )}

        {request.driver_notes && (
          <div>
            <Label>Driver's Request Notes</Label>
            <p className="text-sm text-slate-700 bg-slate-50 rounded p-3 mt-1">{request.driver_notes}</p>
          </div>
        )}

        <div>
          <Label>Approval Reason (Required)</Label>
          <Textarea
            value={approvalReason}
            onChange={(e) => setApprovalReason(e.target.value)}
            placeholder="e.g., Pilot program for top performers, Trial for 30 days"
            rows={3}
          />
        </div>

        <div>
          <Label>Denial Reason (if denying)</Label>
          <Textarea
            value={denialReason}
            onChange={(e) => setDenialReason(e.target.value)}
            placeholder="e.g., Need 30+ loads, Not ready for counteroffers"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setSelectedRequest(null)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!denialReason) {
                alert('Denial reason required');
                return;
              }
              denyMutation.mutate({ id: request.id, reason: denialReason });
            }}
            disabled={!denialReason}
            className="flex-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Deny
          </Button>
          <Button
            onClick={() => {
              if (!approvalReason) {
                alert('Approval reason required');
                return;
              }
              approveMutation.mutate({ id: request.id, reason: approvalReason });
            }}
            disabled={!approvalReason}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading approval queue...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{pendingRequests.length}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Denied</p>
                <p className="text-2xl font-bold text-red-600">
                  {requests.filter(r => r.status === 'denied').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Form */}
      {selectedRequest && <ApprovalForm request={selectedRequest} />}

      {/* Pending Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Pending Approvals ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No pending approval requests</p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <Card key={request.id} className="border border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-slate-600" />
                          <span className="font-semibold">Driver ID: {request.driver_id.slice(0, 8)}</span>
                          <Badge className="bg-indigo-500">{featureLabels[request.feature_key]}</Badge>
                        </div>
                        
                        {request.metrics_at_request && (
                          <div className="text-xs text-slate-600 space-y-1">
                            <div className="flex gap-4">
                              <span>{request.metrics_at_request.completed_loads} loads</span>
                              <span>{request.metrics_at_request.on_time_pct}% on-time</span>
                              <span>{request.metrics_at_request.dispute_rate}% disputes</span>
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-slate-500 mt-2">
                          Requested {new Date(request.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                        className="bg-indigo-600"
                      >
                        Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Reviewed */}
      {recentlyReviewed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Reviewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentlyReviewed.map(request => (
                <div key={request.id} className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <Badge className={request.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}>
                      {request.status}
                    </Badge>
                    <span className="text-sm">{featureLabels[request.feature_key]}</span>
                    <span className="text-xs text-slate-500">
                      by {request.reviewed_by?.split('@')[0]} on {new Date(request.reviewed_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}