import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calculator } from "lucide-react";

export default function ChicagoZoneCalculator({ activeSchedule, onRateCalculated }) {
  const [zones, setZones] = useState({ origin: '', destination: '' });
  const [weight, setWeight] = useState('');

  // Section 3: Chicago Zone Rates (1-4)
  const chicagoZoneRates = {
    '1-1': { rate_40m: 0.85, rate_80m: 0.68 },
    '1-2': { rate_40m: 1.05, rate_80m: 0.84 },
    '1-3': { rate_40m: 1.25, rate_80m: 1.00 },
    '1-4': { rate_40m: 1.45, rate_80m: 1.16 },
    '2-1': { rate_40m: 1.05, rate_80m: 0.84 },
    '2-2': { rate_40m: 0.95, rate_80m: 0.76 },
    '2-3': { rate_40m: 1.15, rate_80m: 0.92 },
    '2-4': { rate_40m: 1.35, rate_80m: 1.08 },
    '3-1': { rate_40m: 1.25, rate_80m: 1.00 },
    '3-2': { rate_40m: 1.15, rate_80m: 0.92 },
    '3-3': { rate_40m: 1.05, rate_80m: 0.84 },
    '3-4': { rate_40m: 1.25, rate_80m: 1.00 },
    '4-1': { rate_40m: 1.45, rate_80m: 1.16 },
    '4-2': { rate_40m: 1.35, rate_80m: 1.08 },
    '4-3': { rate_40m: 1.25, rate_80m: 1.00 },
    '4-4': { rate_40m: 1.15, rate_80m: 0.92 }
  };

  const calculateZoneRate = () => {
    if (!zones.origin || !zones.destination || !weight) {
      alert('Please select both zones and enter weight');
      return;
    }

    const zoneKey = `${zones.origin}-${zones.destination}`;
    const rates = chicagoZoneRates[zoneKey];
    
    if (!rates) {
      alert('Invalid zone combination');
      return;
    }

    const weightNum = parseFloat(weight);
    const minWeight = weightNum >= 80000 ? 80000 : 40000;
    const rate = weightNum >= 80000 ? rates.rate_80m : rates.rate_40m;
    const cwt = Math.max(weightNum, minWeight) / 100;
    const baseRate = rate * cwt;

    onRateCalculated?.({
      baseRate: baseRate.toFixed(2),
      rateSource: `Section 3 Chicago Zone ${zones.origin}-${zones.destination}`,
      minWeight,
      actualWeight: weightNum,
      rateCwt: rate
    });
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-600" />
          Chicago Zone Rating (Section 3)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-purple-100 rounded-lg border border-purple-300">
          <p className="text-sm text-purple-900">
            <strong>Chicago Zones:</strong><br/>
            Zone 1: Gary/Portage IN area<br/>
            Zone 2: Chicago IL metro<br/>
            Zone 3: NW Indiana/South Chicago<br/>
            Zone 4: Greater Chicagoland
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Origin Zone</Label>
            <select
              value={zones.origin}
              onChange={(e) => setZones({...zones, origin: e.target.value})}
              className="w-full mt-2 p-2 border border-slate-300 rounded"
            >
              <option value="">Select...</option>
              <option value="1">Zone 1 - Gary/Portage</option>
              <option value="2">Zone 2 - Chicago Metro</option>
              <option value="3">Zone 3 - NW Indiana</option>
              <option value="4">Zone 4 - Greater Chicagoland</option>
            </select>
          </div>

          <div>
            <Label>Destination Zone</Label>
            <select
              value={zones.destination}
              onChange={(e) => setZones({...zones, destination: e.target.value})}
              className="w-full mt-2 p-2 border border-slate-300 rounded"
            >
              <option value="">Select...</option>
              <option value="1">Zone 1 - Gary/Portage</option>
              <option value="2">Zone 2 - Chicago Metro</option>
              <option value="3">Zone 3 - NW Indiana</option>
              <option value="4">Zone 4 - Greater Chicagoland</option>
            </select>
          </div>

          <div className="col-span-2">
            <Label>Weight (lbs)</Label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="45000"
              className="w-full mt-2 p-2 border border-slate-300 rounded"
            />
          </div>
        </div>

        <Button onClick={calculateZoneRate} className="w-full bg-purple-600">
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Zone Rate
        </Button>

      </CardContent>
    </Card>
  );
}