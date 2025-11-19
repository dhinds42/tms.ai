import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calculator } from "lucide-react";

export default function ChicagoZoneCalculator() {
  const [params, setParams] = useState({
    originZone: '1',
    destZone: '1',
    weight: 40000
  });
  const [result, setResult] = useState(null);

  const zoneRates = {
    '1-1': 245, '1-2': 312, '1-3': 389, '1-4': 467,
    '2-1': 312, '2-2': 298, '2-3': 356, '2-4': 423,
    '3-1': 389, '3-2': 356, '3-3': 334, '3-4': 389,
    '4-1': 467, '4-2': 423, '4-3': 389, '4-4': 356
  };

  const calculateZoneRate = () => {
    const key = `${params.originZone}-${params.destZone}`;
    const baseRate = zoneRates[key] || 0;
    const total = (params.weight / 100) * baseRate;
    setResult({ baseRate, total });
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-600" />
          Chicago Zone Rate Calculator (Section 3)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-600 mb-1 block">Origin Zone</label>
            <Select value={params.originZone} onValueChange={(v) => setParams({...params, originZone: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Zone 1</SelectItem>
                <SelectItem value="2">Zone 2</SelectItem>
                <SelectItem value="3">Zone 3</SelectItem>
                <SelectItem value="4">Zone 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-600 mb-1 block">Dest Zone</label>
            <Select value={params.destZone} onValueChange={(v) => setParams({...params, destZone: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Zone 1</SelectItem>
                <SelectItem value="2">Zone 2</SelectItem>
                <SelectItem value="3">Zone 3</SelectItem>
                <SelectItem value="4">Zone 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Input
          type="number"
          placeholder="Weight (lbs)"
          value={params.weight}
          onChange={(e) => setParams({...params, weight: Number(e.target.value)})}
        />

        <Button onClick={calculateZoneRate} className="w-full bg-purple-600">
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Zone Rate
        </Button>

        {result && (
          <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Rate per cwt:</span>
              <span className="font-bold">${result.baseRate}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-purple-200">
              <span className="font-bold text-purple-900">Total:</span>
              <span className="text-2xl font-bold text-purple-600">${result.total.toFixed(2)}</span>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}