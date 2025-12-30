import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Lock, Key, AlertTriangle } from "lucide-react";

export default function SecurityAuditLog() {
  const auditEvents = [
    { id: 1, action: 'Login', user: 'admin@company.com', ip: '192.168.1.100', time: '2 mins ago', status: 'success' },
    { id: 2, action: 'Load Created', user: 'dispatcher@company.com', ip: '192.168.1.105', time: '15 mins ago', status: 'success' },
    { id: 3, action: 'Failed Login', user: 'unknown', ip: '45.12.34.56', time: '1 hour ago', status: 'blocked' },
    { id: 4, action: 'Rate Updated', user: 'broker@company.com', ip: '192.168.1.110', time: '2 hours ago', status: 'success' },
    { id: 5, action: 'Document Accessed', user: 'carrier@external.com', ip: '123.45.67.89', time: '3 hours ago', status: 'success' }
  ];

  const securityMetrics = [
    { label: 'Total Events', value: '1,247', icon: Shield, color: 'blue' },
    { label: 'Failed Logins', value: '12', icon: Lock, color: 'red' },
    { label: 'Active Users', value: '34', icon: User, color: 'emerald' },
    { label: 'API Calls', value: '8.2K', icon: Key, color: 'purple' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Security Audit Log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-4 gap-3">
          {securityMetrics.map((metric, idx) => {
            const Icon = metric.icon;
            const bgClass = metric.color === 'blue' ? 'bg-blue-50' : metric.color === 'red' ? 'bg-red-50' : metric.color === 'emerald' ? 'bg-emerald-50' : 'bg-purple-50';
            const textClass = metric.color === 'blue' ? 'text-blue-600' : metric.color === 'red' ? 'text-red-600' : metric.color === 'emerald' ? 'text-emerald-600' : 'text-purple-600';
            return (
              <div key={idx} className={`p-3 ${bgClass} rounded-lg`}>
                <Icon className={`w-5 h-5 ${textClass} mb-1`} />
                <p className="text-sm text-slate-600">{metric.label}</p>
                <p className={`text-xl font-bold ${textClass}`}>{metric.value}</p>
              </div>
            );
          })}
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {auditEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border-l-4 border-l-blue-600">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-slate-900">{event.action}</p>
                    <Badge className={
                      event.status === 'success' ? 'bg-emerald-600' :
                      event.status === 'blocked' ? 'bg-red-600' :
                      'bg-amber-600'
                    }>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span>{event.user}</span>
                    <span>•</span>
                    <span>{event.ip}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>
                </div>
                {event.status === 'blocked' && (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">🔒 Security Status</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600">✓</Badge>
              <span className="text-slate-700">2FA Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600">✓</Badge>
              <span className="text-slate-700">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600">✓</Badge>
              <span className="text-slate-700">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600">✓</Badge>
              <span className="text-slate-700">SOC 2 Certified</span>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}