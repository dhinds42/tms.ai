import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, Settings, ExternalLink, Loader2, Globe } from "lucide-react";

export default function MyCarrierPortal({ isConnected, onConnectionChange, operatingMode }) {
  const [showConfig, setShowConfig] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('mycarrierportal_api_key') || '');

  const handleConnect = () => {
    if (!apiKey) {
      alert('Please enter MyCarrierPortal API key');
      setShowConfig(true);
      return;
    }

    setIsConnecting(true);
    setTimeout(() => {
      onConnectionChange(true);
      localStorage.setItem('mycarrierportal_connected', 'true');
      localStorage.setItem('mycarrierportal_api_key', apiKey);
      setIsConnecting(false);
      alert('Successfully connected to MyCarrierPortal!');
    }, 2000);
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect from MyCarrierPortal?')) {
      onConnectionChange(false);
      localStorage.removeItem('mycarrierportal_connected');
      alert('Disconnected from MyCarrierPortal');
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem('mycarrierportal_api_key', apiKey);
    setShowConfig(false);
    alert('MyCarrierPortal configuration saved');
  };

  return (
    <Card className={`border-0 shadow-xl ${isConnected ? 'bg-gradient-to-r from-cyan-50 to-blue-50' : 'bg-white'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>MyCarrierPortal</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Carrier Self-Service Portal</p>
            </div>
          </div>
          <Badge className={isConnected ? 'bg-cyan-600' : 'bg-slate-400'}>
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
          MyCarrierPortal enables carriers to self-onboard, update documents, and manage their profile information through a dedicated portal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">🌐 Self-Service</p>
            <p className="text-xs text-slate-600">Carrier portal access</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">📤 Upload Docs</p>
            <p className="text-xs text-slate-600">Direct document submission</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">🔔 Notifications</p>
            <p className="text-xs text-slate-600">Expiration reminders</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">✅ Real-Time</p>
            <p className="text-xs text-slate-600">Instant TMS sync</p>
          </div>
        </div>

        {isConnected ? (
          <div className="flex gap-2">
            <Button
              onClick={() => window.open('https://mycarrierportal.com', '_blank')}
              className="bg-cyan-600 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open MyCarrierPortal
            </Button>
            <Button onClick={handleDisconnect} variant="outline" className="border-red-300 text-red-600">
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleConnect} disabled={isConnecting} className="bg-cyan-600 text-white">
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Connect to MyCarrierPortal
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
              <Label>MyCarrierPortal API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter MyCarrierPortal API key"
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveConfig} size="sm" className="bg-cyan-600 text-white">
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