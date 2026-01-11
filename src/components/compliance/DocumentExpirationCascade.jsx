import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Bell, Ban } from "lucide-react";

/**
 * Smart Document Expiration Cascade
 * Automated alerts and carrier suspension based on expiration timeline
 */

export default function DocumentExpirationCascade({ 
  complianceItems, 
  onAlert, 
  onSuspendCarrier,
  onEscalateToManager 
}) {
  const [expirations, setExpirations] = useState([]);

  useEffect(() => {
    if (!complianceItems) return;
    
    checkExpirations();
    
    // Check every hour
    const interval = setInterval(checkExpirations, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [complianceItems]);

  const checkExpirations = () => {
    const now = new Date();
    const items = [];

    complianceItems.forEach(item => {
      if (!item.expiration_date) return;
      
      const expiryDate = new Date(item.expiration_date);
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

      let action = null;
      let severity = 'normal';

      // Determine action based on days until expiry
      if (daysUntilExpiry < 0) {
        // Expired - block all assignments
        action = 'block';
        severity = 'expired';
        if (onSuspendCarrier) {
          onSuspendCarrier(item.entity_id, item.compliance_type);
        }
      } else if (daysUntilExpiry <= 30) {
        // 30 days - auto-suspend from new loads
        action = 'suspend';
        severity = 'critical';
        if (onSuspendCarrier) {
          onSuspendCarrier(item.entity_id, item.compliance_type);
        }
      } else if (daysUntilExpiry <= 60) {
        // 60 days - escalate to manager
        action = 'escalate';
        severity = 'warning';
        if (onEscalateToManager) {
          onEscalateToManager(item.entity_id, item.compliance_type, daysUntilExpiry);
        }
      } else if (daysUntilExpiry <= 90) {
        // 90 days - initial alert
        action = 'alert';
        severity = 'info';
        if (onAlert) {
          onAlert(item.entity_id, item.compliance_type, daysUntilExpiry);
        }
      }

      if (action) {
        items.push({
          ...item,
          daysUntilExpiry,
          action,
          severity,
          actionLabel: getActionLabel(action, daysUntilExpiry)
        });
      }
    });

    // Sort by severity
    items.sort((a, b) => {
      const severityOrder = { expired: 0, critical: 1, warning: 2, info: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    setExpirations(items);
  };

  const getActionLabel = (action, days) => {
    switch(action) {
      case 'block':
        return 'BLOCKED - Expired';
      case 'suspend':
        return `SUSPENDED - ${days} days left`;
      case 'escalate':
        return `ESCALATED - ${days} days left`;
      case 'alert':
        return `ALERT - ${days} days left`;
      default:
        return 'Unknown';
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'expired':
        return 'bg-red-600';
      case 'critical':
        return 'bg-orange-600';
      case 'warning':
        return 'bg-amber-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-slate-600';
    }
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'expired':
        return <Ban className="w-5 h-5" />;
      case 'critical':
        return <Shield className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Bell className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  if (expirations.length === 0) return null;

  const expiredCount = expirations.filter(e => e.severity === 'expired').length;
  const criticalCount = expirations.filter(e => e.severity === 'critical').length;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          Document Expiration Cascade
          <div className="flex gap-2 ml-auto">
            {expiredCount > 0 && (
              <Badge className="bg-red-600">{expiredCount} Expired</Badge>
            )}
            {criticalCount > 0 && (
              <Badge className="bg-orange-600">{criticalCount} Critical</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        
        {/* Expiration Timeline Legend */}
        <div className="p-3 bg-slate-50 rounded-lg mb-4">
          <p className="text-xs font-semibold text-slate-700 mb-2">Automated Action Timeline:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Bell className="w-3 h-3 text-blue-600" />
              <span className="text-slate-600">90d: Alert</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span className="text-slate-600">60d: Escalate</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-orange-600" />
              <span className="text-slate-600">30d: Suspend</span>
            </div>
            <div className="flex items-center gap-1">
              <Ban className="w-3 h-3 text-red-600" />
              <span className="text-slate-600">Expired: Block</span>
            </div>
          </div>
        </div>

        {/* Expiration Items */}
        {expirations.map((item, i) => (
          <div key={i} className={`p-3 rounded-lg border-2 ${
            item.severity === 'expired' ? 'bg-red-50 border-red-200' :
            item.severity === 'critical' ? 'bg-orange-50 border-orange-200' :
            item.severity === 'warning' ? 'bg-amber-50 border-amber-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-lg ${getSeverityColor(item.severity)} text-white`}>
                  {getSeverityIcon(item.severity)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 mb-1">
                    {item.entity_name || item.entity_id.slice(0, 8)}
                  </div>
                  <div className="text-sm text-slate-700 mb-1">
                    {item.compliance_type.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-600">
                    Expires: {new Date(item.expiration_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <Badge className={getSeverityColor(item.severity)}>
                {item.actionLabel}
              </Badge>
            </div>
            
            {/* Action taken message */}
            {item.action === 'block' && (
              <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-900">
                ⛔ Carrier blocked from all assignments until document renewed
              </div>
            )}
            {item.action === 'suspend' && (
              <div className="mt-2 p-2 bg-orange-100 rounded text-xs text-orange-900">
                🚫 Carrier suspended from new loads. Existing loads can complete.
              </div>
            )}
            {item.action === 'escalate' && (
              <div className="mt-2 p-2 bg-amber-100 rounded text-xs text-amber-900">
                📧 Manager notified. Follow-up required.
              </div>
            )}
          </div>
        ))}

      </CardContent>
    </Card>
  );
}