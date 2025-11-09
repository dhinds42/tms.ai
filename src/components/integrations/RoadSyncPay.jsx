import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, Settings, ExternalLink, Loader2, Smartphone } from "lucide-react";

export default function RoadSyncPay({ isConnected, onConnectionChange, operatingMode }) {
  const [showConfig, setShowConfig] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('roadsync_api_key') || '');

  const handleConnect = () => {
    if (!apiKey) {
      alert('Please enter RoadSync API key');
      setShowConfig(true);
      return;
    }

    setIsConnecting(true);
    setTimeout(() => {
      onConnectionChange(true);
      localStorage.setItem('roadsync_connected', 'true');
      localStorage.setItem('roadsync_api_key', apiKey);
      setIsConnecting(false);
      alert('Successfully connected to RoadSync Pay!');
    }, 2000);
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect from RoadSync Pay?')) {
      onConnectionChange(false);
      localStorage.removeItem('roadsync_connected');
      alert('Disconnected from RoadSync Pay');
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem('roadsync_api_key', apiKey);
    setShowConfig(false);
    alert('RoadSync configuration saved');
  };

  return (
    <Card className={`border-0 shadow-xl ${isConnected ? 'bg-gradient-to-r from-blue-50 to-cyan-50' : 'bg-white'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>RoadSync Pay</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Mobile Driver Payment Platform</p>
            </div>
          </div>
          <Badge className={isConnected ? 'bg-blue-600' : 'bg-slate-400'}>
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
          RoadSync enables instant mobile payments to drivers, reducing check cutting and improving cash flow for carriers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">📱 Mobile App</p>
            <p className="text-xs text-slate-600">Driver mobile payment app</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">⚡ Instant Pay</p>
            <p className="text-xs text-slate-600">Real-time fund transfers</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">💳 Multiple Methods</p>
            <p className="text-xs text-slate-600">ACH, debit card, fuel card</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">🔐 Secure</p>
            <p className="text-xs text-slate-600">Bank-level security</p>
          </div>
        </div>

        {isConnected ? (
          <div className="flex gap-2">
            <Button
              onClick={() => window.open('https://roadsync.com', '_blank')}
              className="bg-blue-600 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open RoadSync
            </Button>
            <Button onClick={handleDisconnect} variant="outline" className="border-red-300 text-red-600">
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleConnect} disabled={isConnecting} className="bg-blue-600 text-white">
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Connect to RoadSync
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
              <Label>RoadSync API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter RoadSync API key"
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveConfig} size="sm" className="bg-blue-600 text-white">
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