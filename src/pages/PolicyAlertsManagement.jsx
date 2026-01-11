import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { useCurrentUser } from "@/components/hooks/useCurrentUser";
import { getSeverityColor } from "@/components/utils/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  XCircle,
  Activity,
  Shield,
  Filter,
  Loader2,
  Sparkles,
  Calendar,
  BeakerIcon
} from "lucide-react";
import PolicyABTestFramework from "../components/ab-testing/PolicyABTestFramework";

export default function PolicyAlertsManagement() {
  const queryClient = useQueryClient();
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('new');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [alertTypeFilter, setAlertTypeFilter] = useState('all');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [applyNotes, setApplyNotes] = useState('');

  const { data: user } = useCurrentUser();

  const { data: allAlerts, isLoading } = useScopedEntity('PolicyAlert', { 
    limit: 100, 
    sort: '-created_date'
  });

  const { data: carriers } = useScopedEntity('Carrier', { limit: 100 });

  // Client-side filtering since useScopedEntity doesn't support dynamic filters
  const alerts = allAlerts.filter(alert => {
    if (!alert.is_active) return false;
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (alertTypeFilter !== 'all' && alert.alert_type !== alertTypeFilter) return false;
    if (carrierFilter !== 'all' && alert.carrier_id !== carrierFilter) return false;
    return true;
  });

  const applyPolicyMutation = useMutation({
    mutationFn: ({ alertId, notes }) => 
      base44.functions.applyPolicyFromAlert({ alertId, appliedBy: user.email, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policyAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['carrierDriverPolicies'] });
      setSelectedAlert(null);
      setApplyNotes('');
    }
  });

  const acknowledgeMutation = useMutation({
    mutationFn: ({ id, notes }) =>
      base44.entities.PolicyAlert.update(id, {
        status: 'acknowledged',
        action_taken: notes,
        acknowledged_by: user.email,
        acknowledged_at: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policyAlerts'] });
    }
  });

  const dismissMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      base44.entities.PolicyAlert.update(id, {
        status: 'dismissed',
        dismissal_reason: reason,
        acknowledged_by: user.email,
        acknowledged_at: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policyAlerts'] });
    }
  });

  const getAlertIcon = (type) => {
    const icons = {
      dispute_spike: <AlertTriangle className="w-5 h-5 text-red-600" />,
      margin_degradation: <TrendingDown className="w-5 h-5 text-orange-600" />,
      high_trust_underutilization: <TrendingUp className="w-5 h-5 text-blue-600" />,
      stability_good: <CheckCircle className="w-5 h-5 text-green-600" />,
      ops_load_high: <Activity className="w-5 h-5 text-amber-600" />
    };
    return icons[type] || <Shield className="w-5 h-5 text-slate-600" />;
  };



  const filteredAlerts = alerts; // Already filtered above

  const stats = {
    new: alerts.filter(a => a.status === 'new').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    implemented: alerts.filter(a => a.status === 'implemented').length,
    critical: alerts.filter(a => a.severity === 'critical').length
  };

  const AlertDetailDrawer = ({ alert }) => {
    const carrier = carriers.find(c => c.id === alert.carrier_id);

    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-1/2 bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 capitalize">
                {alert.alert_type.replace(/_/g, ' ')}
              </h2>
              <p className="text-sm text-slate-600">
                {carrier?.company_name || alert.carrier_type} • {alert.time_window}
              </p>
            </div>
            <Button variant="ghost" onClick={() => setSelectedAlert(null)}>
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Severity Badge */}
            <Badge className={`${getSeverityColor(alert.severity)} text-white capitalize`}>
              {alert.severity}
            </Badge>

            {/* Metrics Card */}
            <Card className="bg-slate-50">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Metric:</span>
                  <span className="font-semibold">{alert.trigger_metric}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Current Value:</span>
                  <span className="font-bold text-red-600">{alert.current_value}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Threshold:</span>
                  <span className="font-semibold">{alert.threshold_value}%</span>
                </div>
                {alert.baseline_value && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Baseline (30d):</span>
                    <span className="font-semibold">{alert.baseline_value}%</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendation */}
            <Card className="bg-indigo-50 border-indigo-200">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-indigo-900 mb-2">Recommendation:</p>
                <p className="text-sm text-indigo-800">{alert.recommendation}</p>
              </CardContent>
            </Card>

            {/* Suggested Changes */}
            {alert.recommended_changes?.suggested_updates && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI-Optimized Policy Changes
                  </CardTitle>
                  <p className="text-xs text-slate-600">Statistical confidence applied to recommendations</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(alert.recommended_changes.suggested_updates).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-700">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-semibold text-slate-900">
                        {typeof value === 'boolean' ? (value ? '✅ Enable' : '❌ Disable') : value}
                      </span>
                    </div>
                  ))}
                  
                  {alert.severity === 'warning' && (
                    <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded">
                      <p className="text-xs text-purple-800">
                        💡 A/B Test Candidate: Consider testing with 50% of drivers before full rollout
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Apply Policy Section */}
            {alert.status === 'new' && (
              <>
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-600" />
                      Apply Policy Changes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-700">
                      This will update the CarrierDriverPolicy with the suggested changes. All changes are logged and auditable.
                    </p>

                    <div>
                      <label className="text-sm font-semibold text-slate-700">Notes (required):</label>
                      <Textarea
                        value={applyNotes}
                        onChange={(e) => setApplyNotes(e.target.value)}
                        placeholder="Explain why you're applying this policy change..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <Button
                      onClick={() => {
                        if (!applyNotes) {
                          alert('Please provide notes explaining the policy change');
                          return;
                        }
                        applyPolicyMutation.mutate({ 
                          alertId: alert.id, 
                          notes: applyNotes 
                        });
                      }}
                      disabled={applyPolicyMutation.isPending || !applyNotes}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {applyPolicyMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Apply Policy Changes
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* A/B Test Option */}
                {alert.severity === 'warning' && (
                  <PolicyABTestFramework 
                    carrierId={alert.carrier_id} 
                    alertId={alert.id}
                  />
                )}
              </>
            )}

            {/* Other Actions */}
            <div className="flex gap-3">
              {alert.status === 'new' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const notes = prompt('Acknowledge alert (optional notes):');
                    if (notes !== null) {
                      acknowledgeMutation.mutate({ id: alert.id, notes });
                      setSelectedAlert(null);
                    }
                  }}
                  className="flex-1"
                >
                  Acknowledge
                </Button>
              )}
              
              <Button
                variant="destructive"
                onClick={() => {
                  const reason = prompt('Why are you dismissing this alert?');
                  if (reason) {
                    dismissMutation.mutate({ id: alert.id, reason });
                    setSelectedAlert(null);
                  }
                }}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Policy Alerts Management</h1>
          <p className="text-slate-600">KPI-driven alerts for carrier driver policy adjustments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">New</p>
                  <p className="text-2xl font-bold text-red-600">{stats.new}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Acknowledged</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.acknowledged}</p>
                </div>
                <Activity className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Implemented</p>
                  <p className="text-2xl font-bold text-green-600">{stats.implemented}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Critical</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.critical}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-slate-900">Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="implemented">Implemented</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>

              <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="dispute_spike">Dispute Spike</SelectItem>
                  <SelectItem value="margin_degradation">Margin Drop</SelectItem>
                  <SelectItem value="ops_load_high">Ops Load High</SelectItem>
                  <SelectItem value="high_trust_underutilization">Underutilization</SelectItem>
                  <SelectItem value="stability_good">Stability Good</SelectItem>
                </SelectContent>
              </Select>

              <Select value={carrierFilter} onValueChange={setCarrierFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Carriers</SelectItem>
                  {carriers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Alerts ({filteredAlerts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-slate-600">No alerts match your filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map(alert => {
                  const carrier = carriers.find(c => c.id === alert.carrier_id);
                  
                  return (
                    <Card 
                      key={alert.id} 
                      className="border-2 border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3 flex-1">
                            {getAlertIcon(alert.alert_type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-slate-900 capitalize">
                                  {alert.alert_type.replace(/_/g, ' ')}
                                </h3>
                                <Badge className={getSeverityColor(alert.severity)}>
                                  {alert.severity}
                                </Badge>
                                {alert.feature_key && (
                                  <Badge variant="outline">{alert.feature_key}</Badge>
                                )}
                              </div>

                              <p className="text-sm text-slate-700 mb-2">{alert.recommendation}</p>

                              <div className="flex gap-4 text-xs text-slate-500">
                                <span>{carrier?.company_name || alert.carrier_type}</span>
                                <span>•</span>
                                <span>{alert.metric_window || alert.time_window}</span>
                                <span>•</span>
                                <span>{new Date(alert.created_date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <Badge className={
                            alert.status === 'new' ? 'bg-red-500' :
                            alert.status === 'acknowledged' ? 'bg-amber-500' :
                            alert.status === 'implemented' ? 'bg-green-500' :
                            'bg-slate-500'
                          }>
                            {alert.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Drawer */}
      {selectedAlert && <AlertDetailDrawer alert={selectedAlert} />}
    </div>
  );
}