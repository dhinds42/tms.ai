import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calculator, FileSpreadsheet, DollarSign } from "lucide-react";

export default function USSRatingEngine() {
  const [calculating, setCalculating] = useState(false);
  const [rateParams, setRateParams] = useState({
    origin: '',
    destination: '',
    weight: 40000,
    miles: 0
  });
  const [result, setResult] = useState(null);

  const { data: schedules } = useQuery({
    queryKey: ['uss-rate-schedules'],
    queryFn: () => base44.entities.USSRateSchedule.list('-effective_date', 1),
    initialData: [],
  });

  const activeSchedule = schedules.find(s => s.status === 'active');

  const calculateRate = async () => {
    if (!activeSchedule) {
      alert('No active USS rate schedule found');
      return;
    }

    setCalculating(true);
    try {
      // Calculate base rate using lane rates
      const lanes = await base44.entities.USSLaneRate.filter({
        rate_schedule_id: activeSchedule.id,
        origin_city: rateParams.origin,
        destination_city: rateParams.destination
      });

      let baseRate = 0;
      if (lanes.length > 0) {
        const lane = lanes[0];
        // Determine rate based on weight bracket
        if (rateParams.weight >= 80000 && lane.rate_80m) {
          baseRate = lane.rate_80m * (rateParams.weight / 100);
        } else if (rateParams.weight >= 60000 && lane.rate_60m) {
          baseRate = lane.rate_60m * (rateParams.weight / 100);
        } else {
          baseRate = lane.rate_40m * (rateParams.weight / 100);
        }
      }

      // Get current DOE fuel price
      const fuelPrices = await base44.entities.DOEFuelPrice.list('-week_start_date', 1);
      const currentFuel = fuelPrices[0];

      // Calculate FSC
      let fsc = 0;
      if (currentFuel) {
        const fscBrackets = await base44.entities.USSFuelSurchargeBracket.filter({
          rate_schedule_id: activeSchedule.id
        });
        const bracket = fscBrackets.find(b => 
          currentFuel.national_average_diesel_price >= b.price_min &&
          currentFuel.national_average_diesel_price < b.price_max
        );
        if (bracket) {
          if (rateParams.miles >= 350) {
            fsc = bracket.fsc_350_plus_miles_cpm * rateParams.miles;
          } else if (rateParams.miles >= 37) {
            fsc = bracket.fsc_37_349_miles_cpm * rateParams.miles;
          }
        }
      }

      setResult({
        baseRate: baseRate,
        fsc: fsc,
        total: baseRate + fsc,
        schedule: activeSchedule.revision_number,
        fuelPrice: currentFuel?.national_average_diesel_price || 0
      });

    } catch (error) {
      alert('Rate calculation failed: ' + error.message);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          USS Rate Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {activeSchedule && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-900">Active Schedule:</span>
              <Badge className="bg-blue-600">Rev {activeSchedule.revision_number}</Badge>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Origin city"
            value={rateParams.origin}
            onChange={(e) => setRateParams({...rateParams, origin: e.target.value})}
          />
          <Input
            placeholder="Destination city"
            value={rateParams.destination}
            onChange={(e) => setRateParams({...rateParams, destination: e.target.value})}
          />
          <Input
            type="number"
            placeholder="Weight (lbs)"
            value={rateParams.weight}
            onChange={(e) => setRateParams({...rateParams, weight: Number(e.target.value)})}
          />
          <Input
            type="number"
            placeholder="Miles"
            value={rateParams.miles}
            onChange={(e) => setRateParams({...rateParams, miles: Number(e.target.value)})}
          />
        </div>

        <Button
          onClick={calculateRate}
          disabled={calculating || !activeSchedule}
          className="w-full bg-blue-600"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Calculate Rate
        </Button>

        {result && (
          <div className="space-y-2 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-300">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Base Linehaul:</span>
              <span className="font-bold text-slate-900">${result.baseRate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Fuel Surcharge:</span>
              <span className="font-bold text-slate-900">${result.fsc.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-xs text-slate-500">
              <span>DOE Diesel Price:</span>
              <span>${result.fuelPrice.toFixed(3)}/gal</span>
            </div>
            <div className="pt-2 border-t border-emerald-200 flex justify-between">
              <span className="font-bold text-emerald-900">Total Rate:</span>
              <span className="text-2xl font-bold text-emerald-600">${result.total.toFixed(2)}</span>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}