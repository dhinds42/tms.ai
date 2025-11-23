import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, TrendingDown, Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ErrorAlertSystem() {
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-updated_date', 100),
    initialData: [],
    refetchInterval: 30000
  });

  const { data: compliance } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.ComplianceItem.list('-updated_date', 100),
    initialData: [],
    refetchInterval: 60000
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-updated_date', 100),
    initialData: [],
    refetchInterval: 60000
  });

  // Detect errors and issues
  const errorAlerts = [];

  // Delayed loads (ETA passed but not delivered)
  const delayedLoads = loads.filter(l => 
    l.status === 'in_transit' && 
    l.eta && 
    new Date(l.eta) < new Date()
  );
  if (delayedLoads.length > 0) {
    errorAlerts.push({
      id: 'delayed_loads',
      severity: 'high',
      title: `${delayedLoads.length} Load(s) Delayed`,
      message: `${delayedLoads.length} loads have passed their ETA without delivery confirmation.`,
      action: 'Review Delayed Loads',
      icon: Clock,
      color: 'red',
      count: delayedLoads.length
    });
  }

  // Expired compliance
  const expiredCompliance = compliance.filter(c => 
    c.expiration_date && 
    new Date(c.expiration_date) < new Date() &&
    c.status !== 'current'
  );
  if (expiredCompliance.length > 0) {
    errorAlerts.push({
      id: 'expired_compliance',
      severity: 'critical',
      title: `${expiredCompliance.length} Compliance Item(s) Expired`,
      message: `Critical compliance documents have expired. Immediate action required.`,
      action: 'View Compliance',
      icon: AlertTriangle,
      color: 'red',
      count: expiredCompliance.length
    });
  }

  // Loads missing documents
  const loadsNeedingDocs = loads.filter(l => 
    l.status === 'delivered' && 
    (!l.pod_url || !l.bol_url)
  );
  if (loadsNeedingDocs.length > 0) {
    errorAlerts.push({
      id: 'missing_docs',
      severity: 'medium',
      title: `${loadsNeedingDocs.length} Load(s) Missing Documents`,
      message: `Delivered loads require POD/BOL upload for invoicing.`,
      action: 'Upload Documents',
      icon: AlertTriangle,
      color: 'amber',
      count: loadsNeedingDocs.length
    });
  }

  // Overdue invoices
  const overdueInvoices = invoices.filter(i => 
    i.invoice_status === 'sent' &&
    i.invoice_due_date &&
    new Date(i.invoice_due_date) < new Date()
  );
  if (overdueInvoices.length > 0) {
    errorAlerts.push({
      id: 'overdue_invoices',
      severity: 'high',
      title: `${overdueInvoices.length} Invoice(s) Overdue`,
      message: `Payment due dates have passed. Follow up required.`,
      action: 'View Invoices',
      icon: TrendingDown,
      color: 'red',
      count: overdueInvoices.length
    });
  }

  // Loads on hold
  const loadsOnHold = loads.filter(l => l.on_hold === true);
  if (loadsOnHold.length > 0) {
    errorAlerts.push({
      id: 'loads_on_hold',
      severity: 'medium',
      title: `${loadsOnHold.length} Load(s) On Hold`,
      message: `Loads are blocked. Review hold reasons and release when ready.`,
      action: 'Review Holds',
      icon: AlertTriangle,
      color: 'amber',
      count: loadsOnHold.length
    });
  }

  // Filter out dismissed alerts
  const activeAlerts = errorAlerts.filter(a => !dismissedAlerts.includes(a.id));

  const handleDismiss = (alertId) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-full md:w-96 px-4 md:px-0">
      <Card className="border-0 shadow-2xl bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Active Alerts ({activeAlerts.length})
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissedAlerts(errorAlerts.map(a => a.id))}
              className="h-7 text-xs"
            >
              Dismiss All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
          {activeAlerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div
                key={alert.id}
                className={`border-l-4 border-l-${alert.color}-600 bg-${alert.color}-50 p-3 rounded-lg relative group`}
              >
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="absolute top-2 right-2 p-1 hover:bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-slate-600" />
                </button>
                
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 text-${alert.color}-600 mt-0.5`} />
                  <div className="flex-1 pr-6">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm text-slate-900">{alert.title}</h4>
                      <Badge className={`bg-${alert.color}-600 text-white text-xs`}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{alert.message}</p>
                    <Button size="sm" className={`h-7 text-xs bg-${alert.color}-600 hover:bg-${alert.color}-700 text-white`}>
                      {alert.action}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}