import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign, Clock, Truck } from "lucide-react";

export default function AccessorialRulesEngine({ onCalculate }) {
  const [rules, setRules] = useState({
    detention: { enabled: false, minutes: 0 },
    overdimension: { enabled: false, type: '' },
    tarping: { enabled: false, months: [] },
    singleCoil: { enabled: false, weight: 0 },
    tonu: { enabled: false }
  });

  const [charges, setCharges] = useState(null);

  const calculateCharges = () => {
    const result = {
      detention: 0,
      overdimension: 0,
      tarping: 0,
      singleCoil: 0,
      tonu: 0,
      total: 0
    };

    // Rule 3: Detention ($100/hr after 2hr free time, 15min increments)
    if (rules.detention.enabled && rules.detention.minutes > 120) {
      const chargeableTime = rules.detention.minutes - 120;
      const increments = Math.ceil(chargeableTime / 15);
      result.detention = increments * 25; // $100/hr = $25 per 15min
    }

    // Rule 8: Overdimension (varies by type)
    if (rules.overdimension.enabled) {
      const rates = {
        'width': 150,
        'height': 200,
        'length': 175,
        'combined': 300
      };
      result.overdimension = rates[rules.overdimension.type] || 0;
    }

    // Rule 22: Winter tarping (Nov-Mar, tubular products)
    if (rules.tarping.enabled) {
      const winterMonths = ['11', '12', '01', '02', '03'];
      const applicableMonths = rules.tarping.months.filter(m => winterMonths.includes(m));
      result.tarping = applicableMonths.length > 0 ? 125 : 0;
    }

    // Rule 18: Single coil premium (10% if >52,000 lbs)
    if (rules.singleCoil.enabled && rules.singleCoil.weight > 52000) {
      result.singleCoil = 0; // Would be 10% of base rate, calculated in main engine
    }

    // Rule 15: TONU (80% of linehaul)
    if (rules.tonu.enabled) {
      result.tonu = 0; // Would be 80% of quoted rate, calculated separately
    }

    result.total = result.detention + result.overdimension + result.tarping;
    
    setCharges(result);
    onCalculate?.(result);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          USS Accessorial Rules Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Rule 3: Detention */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Rule 3: Detention
            </h4>
            <input
              type="checkbox"
              checked={rules.detention.enabled}
              onChange={(e) => setRules({...rules, detention: {...rules.detention, enabled: e.target.checked}})}
            />
          </div>
          {rules.detention.enabled && (
            <div>
              <Label>Total wait time (minutes)</Label>
              <Input
                type="number"
                value={rules.detention.minutes}
                onChange={(e) => setRules({...rules, detention: {...rules.detention, minutes: parseInt(e.target.value) || 0}})}
                placeholder="180"
                className="mt-2"
              />
              <p className="text-xs text-slate-600 mt-1">$100/hr after 2hr free time (15min increments)</p>
            </div>
          )}
        </div>

        {/* Rule 8: Overdimension */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Rule 8: Overdimension
            </h4>
            <input
              type="checkbox"
              checked={rules.overdimension.enabled}
              onChange={(e) => setRules({...rules, overdimension: {...rules.overdimension, enabled: e.target.checked}})}
            />
          </div>
          {rules.overdimension.enabled && (
            <select
              value={rules.overdimension.type}
              onChange={(e) => setRules({...rules, overdimension: {...rules.overdimension, type: e.target.value}})}
              className="w-full p-2 border border-slate-300 rounded"
            >
              <option value="">Select type...</option>
              <option value="width">Width only - $150</option>
              <option value="height">Height only - $200</option>
              <option value="length">Length only - $175</option>
              <option value="combined">Combined - $300</option>
            </select>
          )}
        </div>

        {/* Rule 22: Winter Tarping */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Rule 22: Winter Tarping</h4>
            <input
              type="checkbox"
              checked={rules.tarping.enabled}
              onChange={(e) => setRules({...rules, tarping: {...rules.tarping, enabled: e.target.checked}})}
            />
          </div>
          <p className="text-xs text-slate-600">$125 for tubular products (Nov-Mar)</p>
        </div>

        {/* Rule 15: TONU */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Rule 15: TONU (Truck Ordered Not Used)</h4>
            <input
              type="checkbox"
              checked={rules.tonu.enabled}
              onChange={(e) => setRules({...rules, tonu: {...rules.tonu, enabled: e.target.checked}})}
            />
          </div>
          <p className="text-xs text-slate-600">80% of quoted linehaul rate</p>
        </div>

        <Button onClick={calculateCharges} className="w-full bg-green-600">
          Calculate Accessorial Charges
        </Button>

        {charges && (
          <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-300">
            <h4 className="font-semibold text-emerald-900 mb-3">Calculated Charges</h4>
            <div className="space-y-2 text-sm">
              {charges.detention > 0 && <p>Detention: <strong>${charges.detention}</strong></p>}
              {charges.overdimension > 0 && <p>Overdimension: <strong>${charges.overdimension}</strong></p>}
              {charges.tarping > 0 && <p>Winter Tarping: <strong>${charges.tarping}</strong></p>}
              <div className="pt-2 border-t border-emerald-300">
                <p className="text-lg font-bold">Total Accessorials: ${charges.total}</p>
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}