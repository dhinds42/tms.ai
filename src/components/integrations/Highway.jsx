import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, CheckCircle, Settings, ExternalLink, Loader2, Shield } from "lucide-react";

export default function Highway({ isConnected, onConnectionChange, operatingMode }) {
  const [showConfig, setShowConfig] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('highway_api_key') || '');

  const handleConnect = () => {
    if (!apiKey) {
      alert('Please enter Highway API key');
      setShowConfig(true);
      return;
    }

    setIsConnecting(true);
    setTimeout(() => {
      onConnectionChange(true);
      localStorage.setItem('highway_connected', 'true');
      localStorage.setItem('highway_api_key', apiKey);
      setIsConnecting(false);
      alert('Successfully connected to Highway!');
    }, 2000);
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect from Highway?')) {
      onConnectionChange(false);
      localStorage.removeItem('highway_connected');
      alert('Disconnected from Highway');
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem('highway_api_key', apiKey);
    setShowConfig(false);
    alert('Highway configuration saved');
  };

  return (
    <Card className={`border-0 shadow-xl ${isConnected ? 'bg-gradient-to-r from-purple-50 to-pink-50' : 'bg-white'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Highway</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Carrier Onboarding Platform</p>
            </div>
          </div>
          <Badge className={isConnected ? 'bg-purple-600' : 'bg-slate-400'}>
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
          Highway streamlines carrier onboarding with automated document collection, compliance verification, and insurance tracking.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">📋 Auto Onboarding</p>
            <p className="text-xs text-slate-600">Automated carrier setup</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">📄 Documents</p>
            <p className="text-xs text-slate-600">COI, W9, MC authority</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">✅ Verification</p>
            <p className="text-xs text-slate-600">FMCSA & insurance checks</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">🔄 Renewals</p>
            <p className="text-xs text-slate-600">Automatic expiration tracking</p>
          </div>
        </div>

        {isConnected ? (
          <div className="flex gap-2">
            <Button
              onClick={() => window.open('https://highway.com', '_blank')}
              className="bg-purple-600 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Highway
            </Button>
            <Button onClick={handleDisconnect} variant="outline" className="border-red-300 text-red-600">
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleConnect} disabled={isConnecting} className="bg-purple-600 text-white">
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" />
                  Connect to Highway
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
              <Label>Highway API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter Highway API key"
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveConfig} size="sm" className="bg-purple-600 text-white">
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