import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, Plus } from "lucide-react";

export default function RuleChargeCalculator({ baseRate, weight, onAccessorialsCalculated }) {
  const [detention, setDetention] = useState({ minutes: 0 });
  const [overdim, setOverdim] = useState({ length: 0, width: 0, height: 0 });
  const [singleCoil, setSingleCoil] = useState(false);
  const [coilWeight, setCoilWeight] = useState(0);

  const calculateAccessorials = () => {
    const charges = [];
    let total = parseFloat(baseRate);

    // Rule 3: Detention ($7 per 15 min after 2 hr loading, 1 hr unloading)
    if (detention.minutes > 120) {
      const chargeableMinutes = detention.minutes - 120;
      const increments = Math.ceil(chargeableMinutes / 15);
      const detentionCharge = increments * 7;
      charges.push({
        rule: 'Rule 3',
        name: 'Detention',
        amount: detentionCharge,
        details: `${increments} × 15min @ $7`
      });
      total += detentionCharge;
    }

    // Rule 8: Overdimension
    let overdimPercent = 0;
    if (overdim.length > 53 && overdim.length <= 60) overdimPercent = 140;
    else if (overdim.length > 60 && overdim.length <= 70) overdimPercent = 175;
    else if (overdim.length > 70 && overdim.length <= 80) overdimPercent = 200;
    else if (overdim.length > 80) overdimPercent = 250;

    if (overdim.width > 9 && overdim.width <= 9.5) overdimPercent = Math.max(overdimPercent, 120);
    else if (overdim.width > 9.5 && overdim.width <= 10) overdimPercent = Math.max(overdimPercent, 125);
    else if (overdim.width > 10 && overdim.width <= 12) overdimPercent = Math.max(overdimPercent, 150);

    if (overdimPercent > 0) {
      const overdimCharge = (baseRate * overdimPercent / 100) - baseRate;
      charges.push({
        rule: 'Rule 8',
        name: 'Overdimension',
        amount: overdimCharge,
        details: `${overdimPercent}% of base rate`
      });
      total += overdimCharge;
    }

    // Rule 18: Single Coil Premium (10% if coil >52k)
    if (singleCoil && coilWeight > 52000) {
      const premium = baseRate * 0.10;
      charges.push({
        rule: 'Rule 18',
        name: 'Single Coil Premium',
        amount: premium,
        details: '10% of base rate for coil >52,000 lbs'
      });
      total += premium;
    }

    onAccessorialsCalculated?.({ charges, total });
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle>Accessorial Charges (Rules)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Rule 3: Detention */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="font-semibold mb-3">Rule 3: Detention</h4>
          <div>
            <Label>Total Minutes Delayed</Label>
            <Input
              type="number"
              value={detention.minutes}
              onChange={(e) => setDetention({ minutes: parseInt(e.target.value) || 0 })}
              placeholder="e.g., 180"
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">Free time: 120 min loading, 60 min unloading. $7 per 15 min after.</p>
          </div>
        </div>

        {/* Rule 8: Overdimension */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="font-semibold mb-3">Rule 8: Overdimension</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Length (ft)</Label>
              <Input
                type="number"
                value={overdim.length}
                onChange={(e) => setOverdim({...overdim, length: parseFloat(e.target.value) || 0})}
                placeholder="53"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Width (ft)</Label>
              <Input
                type="number"
                step="0.1"
                value={overdim.width}
                onChange={(e) => setOverdim({...overdim, width: parseFloat(e.target.value) || 0})}
                placeholder="8.5"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Height (ft)</Label>
              <Input
                type="number"
                value={overdim.height}
                onChange={(e) => setOverdim({...overdim, height: parseFloat(e.target.value) || 0})}
                placeholder="8"
                className="mt-2"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Percentage adders apply if exceeds 49'L, 8.5'W, or 8'H</p>
        </div>

        {/* Rule 18: Single Coil Premium */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="font-semibold mb-3">Rule 18: Single Coil Premium</h4>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={singleCoil}
                onChange={(e) => setSingleCoil(e.target.checked)}
              />
              <span className="text-sm">Single coil shipment</span>
            </label>
            {singleCoil && (
              <div className="flex-1">
                <Input
                  type="number"
                  value={coilWeight}
                  onChange={(e) => setCoilWeight(parseFloat(e.target.value) || 0)}
                  placeholder="Coil weight (lbs)"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">10% premium if single coil exceeds 52,000 lbs</p>
        </div>

        <Button onClick={calculateAccessorials} className="w-full bg-indigo-600">
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Accessorials
        </Button>

      </CardContent>
    </Card>
  );
}