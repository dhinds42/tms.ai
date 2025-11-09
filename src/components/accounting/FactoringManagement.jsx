import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Settings, CheckCircle } from "lucide-react";

export default function FactoringManagement({ loads, shippers, operatingMode }) {
  const [factoringEnabled, setFactoringEnabled] = useState(
    localStorage.getItem('factoring_enabled') === 'true'
  );
  const [factoringCompany, setFactoringCompany] = useState(
    localStorage.getItem('factoring_company') || ''
  );
  const [factoringRate, setFactoringRate] = useState(
    localStorage.getItem('factoring_rate') || '2.5'
  );

  const factoredLoads = loads.filter(l => l.factored === true);
  const totalFactored = factoredLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const factoringFees = totalFactored * (parseFloat(factoringRate) / 100);

  const handleSaveFactoringSettings = () => {
    localStorage.setItem('factoring_enabled', factoringEnabled.toString());
    localStorage.setItem('factoring_company', factoringCompany);
    localStorage.setItem('factoring_rate', factoringRate);
    alert('Factoring settings saved');
  };

  const handleChangeFactoringCompany = (loadId) => {
    const newCompany = prompt('Enter factoring company for this shipment:');
    if (newCompany) {
      alert(`Factoring company changed to ${newCompany} for load ${loadId}`);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* Factoring Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Total Factored</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  ${(totalFactored / 1000).toFixed(1)}K
                </p>
                <p className="text-sm text-slate-600 mt-1">{factoredLoads.length} loads</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Factoring Fees</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  ${(factoringFees / 1000).toFixed(1)}K
                </p>
                <p className="text-sm text-slate-600 mt-1">{factoringRate}% rate</p>
              </div>
              <DollarSign className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Net Proceeds</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  ${((totalFactored - factoringFees) / 1000).toFixed(1)}K
                </p>
                <p className="text-sm text-slate-600 mt-1">After fees</p>
              </div>
              <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Factoring Settings */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Factoring Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900">Enable Factoring</p>
              <p className="text-sm text-slate-600">Use factoring company for invoice processing</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={factoringEnabled}
                onChange={(e) => setFactoringEnabled(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <Badge className={factoringEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
                {factoringEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Factoring Company</Label>
              <Input
                value={factoringCompany}
                onChange={(e) => setFactoringCompany(e.target.value)}
                placeholder="Enter factoring company name"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Factoring Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={factoringRate}
                onChange={(e) => setFactoringRate(e.target.value)}
                placeholder="e.g., 2.5"
                className="mt-2"
              />
            </div>
          </div>

          <Button onClick={handleSaveFactoringSettings} className="w-full bg-purple-600 text-white">
            <Settings className="w-4 h-4 mr-2" />
            Save Factoring Settings
          </Button>
        </CardContent>
      </Card>

      {/* Factored Loads */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Factored Loads</CardTitle>
        </CardHeader>
        <CardContent>
          {factoredLoads.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No loads factored yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {factoredLoads.map((load) => (
                <div key={load.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {load.load_number || load.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-slate-600">
                      Factoring: {load.factoring_company || factoringCompany}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-600">
                      ${load.customer_rate.toLocaleString()}
                    </p>
                    <Button 
                      onClick={() => handleChangeFactoringCompany(load.id)}
                      size="sm" 
                      variant="outline"
                      className="mt-2"
                    >
                      Change Company
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}