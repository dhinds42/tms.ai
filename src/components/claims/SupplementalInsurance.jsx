import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, CheckCircle } from "lucide-react";

export default function SupplementalInsurance({ loads, operatingMode }) {
  const [selectedLoad, setSelectedLoad] = useState('');
  const [declaredValue, setDeclaredValue] = useState('');
  const [insuranceCost, setInsuranceCost] = useState(0);

  const calculateInsuranceCost = (value) => {
    // Typical supplemental insurance: $0.50 per $100 of value
    return (parseFloat(value) || 0) * 0.005;
  };

  const handleCalculate = () => {
    const cost = calculateInsuranceCost(declaredValue);
    setInsuranceCost(cost);
  };

  const handlePurchase = () => {
    alert(`Supplemental insurance purchased for $${insuranceCost.toFixed(2)}`);
    // In production, process payment and update load
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* Info Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-l-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Supplemental Cargo Insurance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-slate-700">
            Protect high-value shipments with additional cargo insurance coverage beyond standard carrier liability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg">
              <p className="font-semibold text-slate-900 mb-1">✓ Coverage Benefits</p>
              <ul className="text-slate-700 space-y-1">
                <li>• Up to $250,000 per shipment</li>
                <li>• Covers damage, loss, and theft</li>
                <li>• Fast claims processing</li>
                <li>• No deductible</li>
              </ul>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="font-semibold text-slate-900 mb-1">💰 Pricing</p>
              <ul className="text-slate-700 space-y-1">
                <li>• $0.50 per $100 of value</li>
                <li>• Minimum premium: $25</li>
                <li>• Instant online quotes</li>
                <li>• No long-term contracts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Supplemental Insurance */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Purchase Supplemental Insurance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            <div>
              <Label>Select Load</Label>
              <select
                value={selectedLoad}
                onChange={(e) => setSelectedLoad(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">-- Select Load --</option>
                {loads.filter(l => !l.supplemental_insurance).map(load => (
                  <option key={load.id} value={load.id}>
                    {load.load_number || load.id.slice(0, 8)} - {load.pickup_location?.city} → {load.dropoff_location?.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Declared Value ($)</Label>
              <Input
                type="number"
                step="100"
                value={declaredValue}
                onChange={(e) => setDeclaredValue(e.target.value)}
                placeholder="Enter shipment value"
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!selectedLoad || !declaredValue}
              className="w-full bg-indigo-600 text-white"
            >
              Calculate Insurance Cost
            </Button>

            {insuranceCost > 0 && (
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-600">Insurance Premium</p>
                    <p className="text-4xl font-bold text-emerald-600">${insuranceCost.toFixed(2)}</p>
                  </div>
                  <Shield className="w-16 h-16 text-emerald-600 opacity-20" />
                </div>
                <div className="mb-4">
                  <p className="text-sm text-slate-700 mb-2">Coverage Details:</p>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>• Declared Value: ${parseFloat(declaredValue).toLocaleString()}</li>
                    <li>• Coverage Amount: ${parseFloat(declaredValue).toLocaleString()}</li>
                    <li>• Policy Type: All-Risk Cargo</li>
                    <li>• Deductible: $0</li>
                  </ul>
                </div>
                <Button
                  onClick={handlePurchase}
                  className="w-full bg-emerald-600 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Purchase Insurance
                </Button>
              </div>
            )}

          </div>
        </CardContent>
      </Card>

      {/* Active Supplemental Insurance */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Active Supplemental Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loads.filter(l => l.supplemental_insurance).map(load => (
              <div key={load.id} className="p-4 border border-emerald-200 bg-emerald-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{load.load_number || load.id.slice(0, 8)}</p>
                    <p className="text-sm text-slate-600">
                      {load.pickup_location?.city} → {load.dropoff_location?.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-emerald-600 mb-2">
                      <Shield className="w-3 h-3 mr-1" />
                      Insured
                    </Badge>
                    <p className="text-sm text-slate-600">Policy Active</p>
                  </div>
                </div>
              </div>
            ))}
            {loads.filter(l => l.supplemental_insurance).length === 0 && (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No active supplemental policies</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}