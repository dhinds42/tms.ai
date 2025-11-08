import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";

export default function MarginCalculator() {
  const [customerRate, setCustomerRate] = useState('');
  const [carrierPay, setCarrierPay] = useState('');

  const margin = customerRate && carrierPay
    ? parseFloat(customerRate) - parseFloat(carrierPay)
    : 0;

  const marginPct = customerRate && margin > 0
    ? (margin / parseFloat(customerRate)) * 100
    : 0;

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-600" />
          Margin Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label>Customer Rate ($)</Label>
            <Input
              type="number"
              value={customerRate}
              onChange={(e) => setCustomerRate(e.target.value)}
              placeholder="2000"
            />
          </div>
          <div>
            <Label>Carrier Pay ($)</Label>
            <Input
              type="number"
              value={carrierPay}
              onChange={(e) => setCarrierPay(e.target.value)}
              placeholder="1600"
            />
          </div>

          {margin > 0 && (
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Margin:</span>
                <span className="text-3xl font-bold text-emerald-600">
                  ${margin.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Percentage:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {marginPct.toFixed(1)}%
                </span>
              </div>
              {marginPct < 15 && (
                <p className="text-xs text-amber-700 mt-2">⚠️ Below 15% target margin</p>
              )}
              {marginPct >= 15 && marginPct < 20 && (
                <p className="text-xs text-blue-700 mt-2">✓ Within target range (15-20%)</p>
              )}
              {marginPct >= 20 && (
                <p className="text-xs text-emerald-700 mt-2">✓ Above target margin!</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}