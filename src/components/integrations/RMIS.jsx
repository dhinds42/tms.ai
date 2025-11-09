import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Settings, ExternalLink, Loader2, Eye } from "lucide-react";

export default function RMIS({ isConnected, onConnectionChange, operatingMode }) {
  const [showConfig, setShowConfig] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('rmis_api_key') || '');
  const [monitoringEnabled, setMonitoringEnabled] = useState(
    localStorage.getItem('rmis_monitoring_enabled') === 'true'
  );

  const handleConnect = () => {
    if (!apiKey) {
      alert('Please enter RMIS API key');
      setShowConfig(true);
      return;
    }

    setIsConnecting(true);
    setTimeout(() => {
      onConnectionChange(true);
      localStorage.setItem('rmis_connected', 'true');
      localStorage.setItem('rmis_api_key', apiKey);
      setIsConnecting(false);
      alert('Successfully connected to RMIS!');
    }, 2000);
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect from RMIS?')) {
      onConnectionChange(false);
      localStorage.removeItem('rmis_connected');
      alert('Disconnected from RMIS');
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem('rmis_api_key', apiKey);
    localStorage.setItem('rmis_monitoring_enabled', monitoringEnabled.toString());
    setShowConfig(false);
    alert('RMIS configuration saved');
  };

  return (
    <Card className={`border-0 shadow-xl ${isConnected ? 'bg-gradient-to-r from-emerald-50 to-teal-50' : 'bg-white'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>RMIS</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Carrier Monitoring Service</p>
            </div>
          </div>
          <Badge className={isConnected ? 'bg-emerald-600' : 'bg-slate-400'}>
            {isConnected ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Connected
              </>
            ) : (
              'Not Connected'
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <p className="text-sm text-slate-700">
          RMIS provides continuous carrier monitoring, real-time safety alerts, and compliance tracking to protect your freight network.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">👁️ Monitoring</p>
            <p className="text-xs text-slate-600">24/7 carrier surveillance</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">🚨 Alerts</p>
            <p className="text-xs text-slate-600">Real-time safety notifications</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">📊 CSA Scores</p>
            <p className="text-xs text-slate-600">Safety rating tracking</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">🔔 Renewals</p>
            <p className="text-xs text-slate-600">Insurance & authority alerts</p>
          </div>
        </div>

        {/* Monitoring Toggle */}
        {isConnected && (
          <div className="p-4 bg-white rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Continuous Monitoring</p>
                <p className="text-xs text-slate-600">Real-time carrier compliance tracking</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={monitoringEnabled}
                  onChange={(e) => {
                    setMonitoringEnabled(e.target.checked);
                    localStorage.setItem('rmis_monitoring_enabled', e.target.checked.toString());
                  }}
                  className="w-4 h-4 rounded"
                />
                <Badge className={monitoringEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
                  {monitoringEnabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {isConnected ? (
          <div className="flex gap-2">
            <Button
              onClick={() => window.open('https://rmis.com', '_blank')}
              className="bg-emerald-600 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open RMIS Dashboard
            </Button>
            <Button onClick={handleDisconnect} variant="outline" className="border-red-300 text-red-600">
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleConnect} disabled={isConnecting} className="bg-emerald-600 text-white">
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Connect to RMIS
                </>
              )}
            </Button>
            <Button onClick={() => setShowConfig(!showConfig)} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        )}

        {showConfig && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
            <h4 className="font-semibold text-slate-900">API Configuration</h4>
            <div>
              <Label>RMIS API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter RMIS API key"
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveConfig} size="sm" className="bg-emerald-600 text-white">
                Save Configuration
              </Button>
              <Button onClick={() => setShowConfig(false)} size="sm" variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}