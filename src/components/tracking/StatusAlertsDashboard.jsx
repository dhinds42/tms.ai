import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Clock, 
  FileText, 
  Shield, 
  Fuel,
  DollarSign,
  CheckCircle,
  XCircle,
  Bell
} from "lucide-react";

export default function StatusAlertsDashboard({ loads, drivers, carriers, operatingMode }) {
  const [filter, setFilter] = useState("all");

  // Generate mock alerts
  const generateAlerts = () => {
    const alerts = [];

    // HOS violations
    const hosDrivers = drivers?.filter(d => d.hos_remaining && d.hos_remaining < 2) || [];
    hosDrivers.forEach(driver => {
      alerts.push({
        id: `hos_${driver.id}`,
        type: 'hos_violation',
        severity: 'critical',
        title: 'HOS Violation Risk',
        description: `${driver.full_name} has only ${driver.hos_remaining}h remaining`,
        entity: 'Driver',
        entity_id: driver.id,
        action_required: true,
        created_at: new Date().toISOString()
      });
    });

    // Document expiration
    const expiringDocs = carriers?.filter(c => {
      if (!c.insurance_expiration) return false;
      const daysUntil = (new Date(c.insurance_expiration) - new Date()) / (1000 * 60 * 60 * 24);
      return daysUntil <= 30 && daysUntil > 0;
    }) || [];
    expiringDocs.forEach(carrier => {
      alerts.push({
        id: `doc_${carrier.id}`,
        type: 'document_expiration',
        severity: 'warning',
        title: 'Insurance Expiring Soon',
        description: `${carrier.company_name} insurance expires ${new Date(carrier.insurance_expiration).toLocaleDateString()}`,
        entity: 'Carrier',
        entity_id: carrier.id,
        action_required: true,
        created_at: new Date().toISOString()
      });
    });

    // Delayed loads
    const delayedLoads = loads.filter(l => {
      if (!l.eta || !l.delivery_date) return false;
      return new Date(l.eta) > new Date(l.delivery_date);
    });
    delayedLoads.forEach(load => {
      alerts.push({
        id: `delay_${load.id}`,
        type: 'delivery_delay',
        severity: 'high',
        title: 'Delivery Delay Risk',
        description: `${load.load_number || load.id.slice(0, 8)} may miss delivery appointment`,
        entity: 'Load',
        entity_id: load.id,
        action_required: true,
        created_at: new Date().toISOString()
      });
    });

    // Missing documents
    const missingDocs = loads.filter(l => !l.bol_url || !l.pod_url).slice(0, 3);
    missingDocs.forEach(load => {
      alerts.push({
        id: `missing_doc_${load.id}`,
        type: 'missing_document',
        severity: 'medium',
        title: 'Missing Documents',
        description: `${load.load_number || load.id.slice(0, 8)} - ${!load.bol_url ? 'BOL' : 'POD'} not uploaded`,
        entity: 'Load',
        entity_id: load.id,
        action_required: true,
        created_at: new Date().toISOString()
      });
    });

    return alerts;
  };

  const alerts = generateAlerts();

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'action_required') return alert.action_required;
    return alert.severity === filter;
  });

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'warning': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'hos_violation': return <Clock className="w-5 h-5" />;
      case 'document_expiration': return <Shield className="w-5 h-5" />;
      case 'delivery_delay': return <AlertCircle className="w-5 h-5" />;
      case 'missing_document': return <FileText className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const handleDismiss = (alertId) => {
    alert(`Alert ${alertId} dismissed`);
  };

  const handleResolve = (alertId) => {
    alert(`Alert ${alertId} marked as resolved`);
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            Status Alerts Dashboard
          </CardTitle>
          <Badge className="bg-red-100 text-red-800">
            <Bell className="w-3 h-3 mr-1" />
            {alerts.filter(a => a.action_required).length} Need Attention
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>⚠️ Critical Alerts:</strong> Visual alert system to track important tasks and critical information
            requiring immediate attention. Never miss deadlines or compliance issues.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All ({alerts.length})
          </Button>
          <Button
            onClick={() => setFilter('action_required')}
            variant={filter === 'action_required' ? 'default' : 'outline'}
            size="sm"
            className={filter === 'action_required' ? 'bg-red-600' : ''}
          >
            Action Required ({alerts.filter(a => a.action_required).length})
          </Button>
          <Button
            onClick={() => setFilter('critical')}
            variant={filter === 'critical' ? 'default' : 'outline'}
            size="sm"
            className={filter === 'critical' ? 'bg-red-600' : ''}
          >
            Critical
          </Button>
          <Button
            onClick={() => setFilter('high')}
            variant={filter === 'high' ? 'default' : 'outline'}
            size="sm"
            className={filter === 'high' ? 'bg-orange-600' : ''}
          >
            High
          </Button>
          <Button
            onClick={() => setFilter('warning')}
            variant={filter === 'warning' ? 'default' : 'outline'}
            size="sm"
            className={filter === 'warning' ? 'bg-amber-600' : ''}
          >
            Warning
          </Button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    alert.severity === 'critical' ? 'bg-red-600' :
                    alert.severity === 'high' ? 'bg-orange-600' :
                    alert.severity === 'warning' ? 'bg-amber-600' :
                    'bg-yellow-600'
                  }`}>
                    <div className="text-white">
                      {getAlertIcon(alert.type)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{alert.title}</h4>
                    <p className="text-sm text-slate-700 mt-1">{alert.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                      <Badge variant="outline" className="text-xs">
                        {alert.entity}
                      </Badge>
                      <span>{new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Badge className={`text-xs uppercase ${
                  alert.severity === 'critical' ? 'bg-red-600 text-white' :
                  alert.severity === 'high' ? 'bg-orange-600 text-white' :
                  alert.severity === 'warning' ? 'bg-amber-600 text-white' :
                  'bg-yellow-600 text-white'
                }`}>
                  {alert.severity}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleResolve(alert.id)}
                  size="sm"
                  className="bg-emerald-600 text-white"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Resolve
                </Button>
                <Button
                  onClick={() => handleDismiss(alert.id)}
                  size="sm"
                  variant="outline"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">All Clear!</h3>
            <p className="text-slate-600">No alerts matching the current filter</p>
          </div>
        )}

        {/* Alert Categories */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-3">Alert Categories</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span>HOS Violations</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Document Expiration</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span>Delivery Delays</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-yellow-600" />
              <span>Missing Documents</span>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}