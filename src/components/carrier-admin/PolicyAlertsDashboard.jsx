import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Activity,
  Shield
} from "lucide-react";

export default function PolicyAlertsDashboard({ carrierId }) {
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['policyAlerts', carrierId],
    queryFn: () => base44.entities.PolicyAlert.filter({ 
      carrier_id: carrierId,
      is_active: true 
    }),
    initialData: []
  });

  const acknowledgeMutation = useMutation({
    mutationFn: ({ id, actionTaken }) => 
      base44.entities.PolicyAlert.update(id, {
        status: 'acknowledged',
        action_taken: actionTaken,
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
        dismissal_reason: reason
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policyAlerts'] });
    }
  });

  const implementMutation = useMutation({
    mutationFn: ({ id, actionTaken }) =>
      base44.entities.PolicyAlert.update(id, {
        status: 'implemented',
        action_taken: actionTaken
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policyAlerts'] });
    }
  });

  const newAlerts = alerts.filter(a => a.status === 'new');
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged');

  const getAlertIcon = (type) => {
    switch (type) {
      case 'dispute_spike':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'margin_degradation':
        return <TrendingDown className="w-5 h-5 text-orange-600" />;
      case 'high_trust_underutilization':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'stability_good':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'ops_load_high':
        return <Activity className="w-5 h-5 text-amber-600" />;
      default:
        return <Shield className="w-5 h-5 text-slate-600" />;
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      info: 'bg-blue-500',
      warning: 'bg-amber-500',
      critical: 'bg-red-600'
    };
    return <Badge className={`${colors[severity]} text-white capitalize`}>{severity}</Badge>;
  };

  const AlertCard = ({ alert }) => {
    const [actionTaken, setActionTaken] = React.useState('');
    const [dismissalReason, setDismissalReason] = React.useState('');
    const [showActions, setShowActions] = React.useState(false);

    return (
      <Card className="border-2 border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.alert_type)}
              <div>
                <h3 className="font-semibold text-slate-900 capitalize">
                  {alert.alert_type.replace(/_/g, ' ')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {alert.time_window} • Created {new Date(alert.created_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            {getSeverityBadge(alert.severity)}
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Metric:</span>
              <span className="font-semibold">{alert.trigger_metric}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Current:</span>
              <span className="font-semibold text-red-600">{alert.current_value}{alert.trigger_metric.includes('pct') || alert.trigger_metric.includes('rate') ? '%' : ''}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Threshold:</span>
              <span className="font-semibold">{alert.threshold_value}{alert.trigger_metric.includes('pct') || alert.trigger_metric.includes('rate') ? '%' : ''}</span>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-indigo-900 mb-2">Recommendation:</p>
            <p className="text-sm text-indigo-800">{alert.recommendation}</p>
            
            {alert.recommended_changes?.suggested_updates && (
              <div className="mt-3 text-xs text-indigo-700 space-y-1">
                <p className="font-semibold">Suggested Changes:</p>
                {Object.entries(alert.recommended_changes.suggested_updates).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key}:</span>
                    <span className="font-semibold">{typeof value === 'boolean' ? (value ? 'enabled' : 'disabled') : value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!showActions ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowActions(true)}
                className="flex-1"
              >
                Take Action
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-slate-700">Action Taken:</label>
                <Textarea
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="Describe what you did (e.g., Updated policy to 7 loads, Dismissed as false positive)"
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowActions(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (!actionTaken) {
                      alert('Please provide dismissal reason');
                      return;
                    }
                    dismissMutation.mutate({ id: alert.id, reason: actionTaken });
                  }}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!actionTaken) {
                      alert('Please describe action taken');
                      return;
                    }
                    acknowledgeMutation.mutate({ id: alert.id, actionTaken });
                  }}
                  className="flex-1 bg-amber-600"
                >
                  Acknowledge
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!actionTaken) {
                      alert('Please describe action taken');
                      return;
                    }
                    implementMutation.mutate({ id: alert.id, actionTaken });
                  }}
                  className="flex-1 bg-green-600"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Implemented
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading alerts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">New Alerts</p>
                <p className="text-2xl font-bold text-red-600">{newAlerts.length}</p>
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
                <p className="text-2xl font-bold text-amber-600">{acknowledgedAlerts.length}</p>
              </div>
              <Activity className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Critical</p>
                <p className="text-2xl font-bold text-orange-600">
                  {alerts.filter(a => a.severity === 'critical').length}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Implemented</p>
                <p className="text-2xl font-bold text-green-600">
                  {alerts.filter(a => a.status === 'implemented').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Alerts */}
      {newAlerts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">New Alerts Require Action</h2>
          <div className="space-y-4">
            {newAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Acknowledged Alerts</h2>
          <div className="space-y-3">
            {acknowledgedAlerts.map(alert => (
              <Card key={alert.id} className="border border-amber-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.alert_type)}
                      <div>
                        <p className="font-semibold text-slate-900 capitalize">
                          {alert.alert_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-slate-500">
                          Acknowledged {new Date(alert.acknowledged_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-amber-500">Acknowledged</Badge>
                  </div>
                  {alert.action_taken && (
                    <p className="text-sm text-slate-700 mt-2 bg-slate-50 rounded p-2">
                      {alert.action_taken}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-900 text-lg">All Clear</h3>
            <p className="text-green-700">No policy alerts at this time. Your feature gating policies are operating within healthy parameters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}