import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Terminal, Key, CheckCircle, AlertCircle, Activity } from "lucide-react";

export default function APIManager() {
  const endpoints = [
    { name: 'Load Management API', path: '/api/v1/loads', requests: '12.4K', uptime: '99.9%', status: 'healthy' },
    { name: 'Tracking API', path: '/api/v1/tracking', requests: '8.2K', uptime: '100%', status: 'healthy' },
    { name: 'Document API', path: '/api/v1/documents', requests: '5.1K', uptime: '98.5%', status: 'degraded' },
    { name: 'Billing API', path: '/api/v1/billing', requests: '3.8K', uptime: '99.7%', status: 'healthy' }
  ];

  const apiKeys = [
    { name: 'Production Key', key: 'pk_live_***abc123', created: '2024-01-15', lastUsed: '2 mins ago', status: 'active' },
    { name: 'Staging Key', key: 'pk_test_***xyz789', created: '2024-02-01', lastUsed: '1 hour ago', status: 'active' },
    { name: 'Legacy Key', key: 'pk_live_***old456', created: '2023-06-10', lastUsed: '30 days ago', status: 'inactive' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-600" />
            API & Integration Management
          </CardTitle>
          <Button className="bg-indigo-600">
            <Key className="w-4 h-4 mr-2" />
            Generate API Key
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div>
          <h4 className="font-semibold text-slate-900 mb-3">API Endpoints</h4>
          <div className="space-y-2">
            {endpoints.map((endpoint, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {endpoint.status === 'healthy' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="font-semibold text-slate-900">{endpoint.name}</span>
                  </div>
                  <Badge className={endpoint.status === 'healthy' ? 'bg-emerald-600' : 'bg-amber-600'}>
                    {endpoint.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-2 font-mono">{endpoint.path}</p>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>{endpoint.requests} requests</span>
                  </div>
                  <div>Uptime: {endpoint.uptime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3">API Keys</h4>
          <div className="space-y-2">
            {apiKeys.map((key, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-900">{key.name}</span>
                  <Badge className={key.status === 'active' ? 'bg-emerald-600' : 'bg-slate-600'}>
                    {key.status}
                  </Badge>
                </div>
                <p className="text-sm font-mono text-slate-600 mb-2">{key.key}</p>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span>Created: {key.created}</span>
                  <span>Last used: {key.lastUsed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📚 API Documentation</h4>
          <p className="text-sm text-slate-700 mb-3">
            Complete REST API docs with authentication, endpoints, and examples
          </p>
          <Button variant="outline" size="sm">View Docs</Button>
        </div>

      </CardContent>
    </Card>
  );
}