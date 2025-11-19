import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Bell } from "lucide-react";

export default function AutomatedComplianceMonitor() {
  const [alerts, setAlerts] = useState([]);

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list(),
    initialData: [],
  });

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date', 500),
    initialData: [],
  });

  useEffect(() => {
    // Run compliance checks
    const newAlerts = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    carriers.forEach(carrier => {
      // Insurance expiration check
      if (carrier.insurance_expiration) {
        const expDate = new Date(carrier.insurance_expiration);
        if (expDate < today) {
          newAlerts.push({
            severity: 'critical',
            carrier: carrier.company_name,
            mc: carrier.mc_number,
            issue: 'Insurance EXPIRED',
            details: `Expired on ${expDate.toLocaleDateString()}`,
            action: 'Immediate action required - do not tender loads'
          });
        } else if (expDate < thirtyDaysFromNow) {
          newAlerts.push({
            severity: 'warning',
            carrier: carrier.company_name,
            mc: carrier.mc_number,
            issue: 'Insurance expiring soon',
            details: `Expires ${expDate.toLocaleDateString()}`,
            action: 'Request updated certificate'
          });
        }
      } else {
        newAlerts.push({
          severity: 'critical',
          carrier: carrier.company_name,
          mc: carrier.mc_number,
          issue: 'No insurance on file',
          details: 'Missing insurance certificate',
          action: 'Obtain certificate before tendering'
        });
      }

      // Authority check
      if (!carrier.authority_status || carrier.authority_status !== 'active') {
        newAlerts.push({
          severity: 'critical',
          carrier: carrier.company_name,
          mc: carrier.mc_number,
          issue: 'Inactive authority',
          details: 'MC authority not active',
          action: 'Verify FMCSA status immediately'
        });
      }

      // Missing broker-carrier agreement
      const hasAgreement = documents.some(d => 
        d.document_type === 'broker_carrier_agreement' && 
        d.carrier_id === carrier.id
      );
      
      if (!hasAgreement) {
        newAlerts.push({
          severity: 'warning',
          carrier: carrier.company_name,
          mc: carrier.mc_number,
          issue: 'Missing broker-carrier agreement',
          details: '49 CFR 371.3 requirement',
          action: 'Obtain signed agreement'
        });
      }
    });

    setAlerts(newAlerts);
  }, [carriers, documents]);

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Automated Compliance Monitor
          </CardTitle>
          <Badge className={criticalAlerts.length > 0 ? 'bg-red-600' : 'bg-emerald-600'}>
            {criticalAlerts.length > 0 ? `${criticalAlerts.length} Critical` : 'All Clear'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-900 font-semibold">Critical Alerts</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{criticalAlerts.length}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-900 font-semibold">Warnings</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{warningAlerts.length}</p>
              </div>
              <Bell className="w-10 h-10 text-amber-600 opacity-20" />
            </div>
          </div>
        </div>

        {criticalAlerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-red-900">🚨 Critical Issues</h4>
            {criticalAlerts.map((alert, idx) => (
              <div key={idx} className="p-4 bg-red-50 rounded-lg border-2 border-red-500">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-bold text-red-900">{alert.carrier}</h5>
                    <p className="text-xs text-red-700">MC: {alert.mc}</p>
                  </div>
                  <Badge className="bg-red-600">{alert.issue}</Badge>
                </div>
                <p className="text-sm text-red-800 mb-2">{alert.details}</p>
                <p className="text-sm text-red-900 font-semibold">
                  ⚠️ Action: {alert.action}
                </p>
              </div>
            ))}
          </div>
        )}

        {warningAlerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-amber-900">⚠️ Warnings</h4>
            {warningAlerts.map((alert, idx) => (
              <div key={idx} className="p-4 bg-amber-50 rounded-lg border border-amber-300">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-bold text-amber-900">{alert.carrier}</h5>
                    <p className="text-xs text-amber-700">MC: {alert.mc}</p>
                  </div>
                  <Badge className="bg-amber-600">{alert.issue}</Badge>
                </div>
                <p className="text-sm text-amber-800 mb-2">{alert.details}</p>
                <p className="text-sm text-amber-900">Action: {alert.action}</p>
              </div>
            ))}
          </div>
        )}

        {alerts.length === 0 && (
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-emerald-900 mb-2">All Compliant</h3>
            <p className="text-emerald-700">No compliance issues detected</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}