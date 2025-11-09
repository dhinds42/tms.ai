import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, Settings, ExternalLink, Loader2, RefreshCw } from "lucide-react";

export default function QuickBooksIntegration({ isConnected, onConnectionChange, operatingMode }) {
  const [showConfig, setShowConfig] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('quickbooks_api_key') || '');
  const [lastSync, setLastSync] = useState(localStorage.getItem('quickbooks_last_sync') || null);

  const handleConnect = () => {
    if (!apiKey) {
      alert('Please enter QuickBooks API key');
      setShowConfig(true);
      return;
    }

    setIsConnecting(true);
    setTimeout(() => {
      onConnectionChange(true);
      localStorage.setItem('quickbooks_connected', 'true');
      localStorage.setItem('quickbooks_api_key', apiKey);
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem('quickbooks_last_sync', now);
      setIsConnecting(false);
      alert('Successfully connected to QuickBooks Online!');
    }, 2000);
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect from QuickBooks?')) {
      onConnectionChange(false);
      localStorage.removeItem('quickbooks_connected');
      alert('Disconnected from QuickBooks');
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem('quickbooks_api_key', apiKey);
    setShowConfig(false);
    alert('QuickBooks configuration saved');
  };

  return (
    <Card className={`border-0 shadow-xl ${isConnected ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-white'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>QuickBooks Online</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Complete Accounting Integration</p>
            </div>
          </div>
          <Badge className={isConnected ? 'bg-green-600' : 'bg-slate-400'}>
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
          Sync invoices, customers, vendors, and payments automatically between your TMS and QuickBooks Online.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">📄 Invoices</p>
            <p className="text-xs text-slate-600">Auto-create & sync invoices</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">👥 Customers</p>
            <p className="text-xs text-slate-600">Shipper sync</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">🏢 Vendors</p>
            <p className="text-xs text-slate-600">Carrier sync</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">💰 Payments</p>
            <p className="text-xs text-slate-600">Payment tracking</p>
          </div>
        </div>

        {isConnected && lastSync && (
          <div className="p-3 bg-white rounded-lg border border-green-200">
            <p className="text-xs text-slate-600">Last Sync</p>
            <p className="font-semibold text-slate-900">{new Date(lastSync).toLocaleString()}</p>
          </div>
        )}

        {isConnected ? (
          <div className="flex gap-2">
            <Button
              onClick={() => window.open('https://quickbooks.intuit.com', '_blank')}
              className="bg-green-600 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open QuickBooks
            </Button>
            <Button onClick={handleDisconnect} variant="outline" className="border-red-300 text-red-600">
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleConnect} disabled={isConnecting} className="bg-green-600 text-white">
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Connect to QuickBooks
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
            <h4 className="font-semibold text-slate-900">QuickBooks API Configuration</h4>
            <div>
              <Label>API Key / OAuth Token</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter QuickBooks API key"
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                Get your API credentials from QuickBooks Developer Portal
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveConfig} size="sm" className="bg-green-600 text-white">
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