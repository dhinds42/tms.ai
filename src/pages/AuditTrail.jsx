import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, FileText, User, Clock, Search } from "lucide-react";

import SecurityAuditLog from "../components/security/SecurityAuditLog";

export default function AuditTrail() {
  const [searchTerm, setSearchTerm] = useState('');

  const auditLogs = [
    { id: 1, user: 'John Doe', action: 'Created Load', entity: 'Load #12345', timestamp: '2025-01-19 14:32', ip: '192.168.1.100' },
    { id: 2, user: 'Sarah Smith', action: 'Updated Carrier', entity: 'ABC Transport', timestamp: '2025-01-19 14:15', ip: '192.168.1.101' },
    { id: 3, user: 'Mike Johnson', action: 'Deleted Document', entity: 'POD #789', timestamp: '2025-01-19 13:45', ip: '192.168.1.102' },
    { id: 4, user: 'Admin User', action: 'Changed Settings', entity: 'System Config', timestamp: '2025-01-19 12:20', ip: '192.168.1.103' },
  ];

  const filteredLogs = auditLogs.filter(log =>
    searchTerm === '' ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Audit Trail & Compliance Reporting
          </h1>
          <p className="text-slate-600 mt-2">Complete activity logging for DOT/FMCSA audits</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Events</p>
                  <p className="text-3xl font-bold text-indigo-600">12,543</p>
                </div>
                <FileText className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Users</p>
                  <p className="text-3xl font-bold text-blue-600">47</p>
                </div>
                <User className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Today</p>
                  <p className="text-3xl font-bold text-emerald-600">234</p>
                </div>
                <Clock className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Compliance</p>
                  <p className="text-3xl font-bold text-green-600">100%</p>
                </div>
                <Shield className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity Log</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{log.action}</Badge>
                      <span className="text-sm font-semibold text-slate-900">{log.entity}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span>👤 {log.user}</span>
                      <span>🕒 {log.timestamp}</span>
                      <span>🌐 {log.ip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Audit Log */}
        <SecurityAuditLog />

      </div>
    </div>
  );
}