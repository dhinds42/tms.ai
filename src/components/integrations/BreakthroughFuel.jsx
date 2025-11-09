import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Fuel, CheckCircle, Settings, ExternalLink, Loader2, CreditCard } from "lucide-react";

export default function BreakthroughFuel({ isConnected, onConnectionChange, operatingMode }) {
  const [showConfig, setShowConfig] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('breakthrough_fuel_api_key') || '');
  const [accountNumber, setAccountNumber] = useState(localStorage.getItem('breakthrough_fuel_account') || '');

  const handleConnect = () => {
    if (!apiKey || !accountNumber) {
      alert('Please enter API key and Account Number');
      setShowConfig(true);
      return;
    }

    setIsConnecting(true);
    setTimeout(() => {
      onConnectionChange(true);
      localStorage.setItem('breakthrough_fuel_connected', 'true');
      localStorage.setItem('breakthrough_fuel_api_key', apiKey);
      localStorage.setItem('breakthrough_fuel_account', accountNumber);
      setIsConnecting(false);
      alert('Successfully connected to Breakthrough Fuel!');
    }, 2000);
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect from Breakthrough Fuel?')) {
      onConnectionChange(false);
      localStorage.removeItem('breakthrough_fuel_connected');
      alert('Disconnected from Breakthrough Fuel');
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem('breakthrough_fuel_api_key', apiKey);
    localStorage.setItem('breakthrough_fuel_account', accountNumber);
    setShowConfig(false);
    alert('Breakthrough Fuel configuration saved');
  };

  return (
    <Card className={`border-0 shadow-xl ${isConnected ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-white'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl">
              <Fuel className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Breakthrough Fuel</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Fuel Card & Fleet Management</p>
            </div>
          </div>
          <Badge className={isConnected ? 'bg-amber-600' : 'bg-slate-400'}>
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
          Breakthrough Fuel provides fuel card management, real-time transaction tracking, and fuel expense optimization for carriers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">💳 Fuel Cards</p>
            <p className="text-xs text-slate-600">Nationwide acceptance</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">📊 Real-Time Data</p>
            <p className="text-xs text-slate-600">Live transaction monitoring</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">💰 Cost Savings</p>
            <p className="text-xs text-slate-600">Volume discounts & rebates</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">🔒 Fraud Prevention</p>
            <p className="text-xs text-slate-600">Purchase controls & alerts</p>
          </div>
        </div>

        {/* Carrier Only Notice */}
        {operatingMode === 'broker' && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Note:</strong> Breakthrough Fuel is primarily for carrier operations. Switch to Carrier mode to utilize full features.
            </p>
          </div>
        )}

        {isConnected ? (
          <div className="flex gap-2">
            <Button
              onClick={() => window.open('https://breakthroughfuel.com', '_blank')}
              className="bg-amber-600 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Breakthrough Fuel
            </Button>
            <Button onClick={handleDisconnect} variant="outline" className="border-red-300 text-red-600">
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleConnect} disabled={isConnecting} className="bg-amber-600 text-white">
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Fuel className="w-4 h-4 mr-2" />
                  Connect to Breakthrough Fuel
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
              <Label>API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter Breakthrough Fuel API key"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter your account number"
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveConfig} size="sm" className="bg-amber-600 text-white">
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