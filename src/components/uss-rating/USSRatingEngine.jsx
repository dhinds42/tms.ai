import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, Zap } from "lucide-react";

import RuleChargeCalculator from "./RuleChargeCalculator";

export default function USSRatingEngine({ activeSchedule }) {
  const [quoteInput, setQuoteInput] = useState({
    origin: '',
    destination: '',
    weight: '',
    miles: ''
  });
  const [rating, setRating] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [accessorials, setAccessorials] = useState(null);

  const { data: lanes } = useQuery({
    queryKey: ['uss_lanes', activeSchedule?.id],
    queryFn: () => base44.entities.USSLaneRate.filter({ rate_schedule_id: activeSchedule?.id }),
    initialData: [],
    enabled: !!activeSchedule
  });

  const { data: mileageRates } = useQuery({
    queryKey: ['uss_mileage', activeSchedule?.id],
    queryFn: () => base44.entities.USSMileageRate.filter({ rate_schedule_id: activeSchedule?.id }),
    initialData: [],
    enabled: !!activeSchedule
  });

  const { data: fuelBrackets } = useQuery({
    queryKey: ['uss_fuel', activeSchedule?.id],
    queryFn: () => base44.entities.USSFuelSurchargeBracket.filter({ rate_schedule_id: activeSchedule?.id }),
    initialData: [],
    enabled: !!activeSchedule
  });

  const { data: currentDOEPrice } = useQuery({
    queryKey: ['doe_current'],
    queryFn: async () => {
      const prices = await base44.entities.DOEFuelPrice.list('-week_start_date', 1);
      return prices[0];
    }
  });

  const calculateRate = () => {
    if (!activeSchedule) {
      alert('No active rate schedule. Please activate one first.');
      return;
    }

    setCalculating(true);
    try {
      const weight = parseFloat(quoteInput.weight);
      const miles = parseFloat(quoteInput.miles);

      // Determine minimum weight bracket (40M, 60M, 80M, 100M)
      let minWeight, rateField;
      if (weight >= 100000) {
        minWeight = 100000;
        rateField = 'rate_100m';
      } else if (weight >= 80000) {
        minWeight = 80000;
        rateField = 'rate_80m';
      } else if (weight >= 60000) {
        minWeight = 60000;
        rateField = 'rate_60m';
      } else {
        minWeight = 40000;
        rateField = 'rate_40m';
      }

      // Try to find specific lane rate first (Section 6)
      const matchingLane = lanes.find(l => 
        l.origin_city?.toLowerCase().includes(quoteInput.origin.toLowerCase()) &&
        l.destination_city?.toLowerCase().includes(quoteInput.destination.toLowerCase())
      );

      let baseRate = 0;
      let rateSource = '';

      if (matchingLane && matchingLane[rateField]) {
        // Section 6: Specific lane rate ($/cwt)
        const cwt = Math.max(weight, minWeight) / 100;
        baseRate = matchingLane[rateField] * cwt;
        rateSource = `Section 6 Lane #${matchingLane.lane_number}`;
      } else {
        // Section 5: Mileage-based fallback
        const mileageBracket = mileageRates.find(m => 
          miles >= m.miles_min && miles <= m.miles_max
        );

        if (mileageBracket) {
          const cwt = Math.max(weight, minWeight) / 100;
          const rateCwt = minWeight === 80000 ? mileageBracket.rate_80m_cwt : mileageBracket.rate_40m_cwt;
          baseRate = rateCwt * cwt;
          rateSource = `Section 5 Mileage (${mileageBracket.miles_min}-${mileageBracket.miles_max} mi)`;
        } else {
          alert('No applicable rate found for this lane/mileage');
          setCalculating(false);
          return;
        }
      }

      // Calculate Fuel Surcharge (Rule 20)
      let fsc = 0;
      let fscDetails = '';
      if (currentDOEPrice && fuelBrackets.length > 0) {
        const dieselPrice = currentDOEPrice.national_average_diesel_price;
        const bracket = fuelBrackets.find(b => 
          dieselPrice >= b.price_min && dieselPrice <= b.price_max
        );

        if (bracket) {
          if (miles <= 5) {
            fsc = bracket.fsc_0_5_miles_flat || 0;
            fscDetails = `0-5 mi flat: $${fsc}`;
          } else if (miles <= 36) {
            fsc = bracket.fsc_6_36_miles_flat || 0;
            fscDetails = `6-36 mi flat: $${fsc}`;
          } else if (miles <= 349) {
            fsc = (bracket.fsc_37_349_miles_cpm || 0) * miles / 100; // cents to dollars
            fscDetails = `37-349 mi: ${bracket.fsc_37_349_miles_cpm}¢/mi × ${miles}`;
          } else {
            fsc = (bracket.fsc_350_plus_miles_cpm || 0) * miles / 100;
            fscDetails = `350+ mi: ${bracket.fsc_350_plus_miles_cpm}¢/mi × ${miles}`;
          }
          
          // Round per Rule 20 (< 0.5¢ drop, >= 0.5¢ round up)
          fsc = Math.round(fsc * 100) / 100;
        }
      }

      const total = baseRate + fsc;

      setRating({
        baseRate: baseRate.toFixed(2),
        fsc: fsc.toFixed(2),
        total: total.toFixed(2),
        rateSource,
        fscDetails,
        minWeight,
        actualWeight: weight,
        dieselPrice: currentDOEPrice?.national_average_diesel_price.toFixed(3)
      });

    } catch (error) {
      alert('Rating calculation failed: ' + error.message);
    } finally {
      setCalculating(false);
    }
  };

  if (!activeSchedule) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-12 text-center">
          <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Active Rate Schedule</h3>
          <p className="text-slate-600">Please activate a rate schedule to use the rating engine</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            U.S. Steel Rate Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Active Schedule:</strong> Revision {activeSchedule.revision_number} 
              (Effective {activeSchedule.effective_date})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Origin City</Label>
              <Input
                value={quoteInput.origin}
                onChange={(e) => setQuoteInput({...quoteInput, origin: e.target.value})}
                placeholder="e.g., Gary"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Destination City</Label>
              <Input
                value={quoteInput.destination}
                onChange={(e) => setQuoteInput({...quoteInput, destination: e.target.value})}
                placeholder="e.g., Louisville"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Weight (lbs)</Label>
              <Input
                type="number"
                value={quoteInput.weight}
                onChange={(e) => setQuoteInput({...quoteInput, weight: e.target.value})}
                placeholder="45000"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Miles (Rand McNally)</Label>
              <Input
                type="number"
                value={quoteInput.miles}
                onChange={(e) => setQuoteInput({...quoteInput, miles: e.target.value})}
                placeholder="222"
                className="mt-2"
              />
            </div>
          </div>

          <Button
            onClick={calculateRate}
            disabled={!quoteInput.origin || !quoteInput.destination || !quoteInput.weight || !quoteInput.miles}
            className="w-full bg-blue-600 py-6 text-lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Calculate Rate
          </Button>

        </CardContent>
      </Card>

      {/* Rating Result */}
      {rating && (
        <Card className="border-2 border-emerald-500 shadow-2xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader>
            <CardTitle className="text-emerald-900">💰 Rating Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-slate-700">Base Line-Haul</span>
                <span className="text-xl font-bold text-blue-600">${rating.baseRate}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div>
                  <span className="text-slate-700">Fuel Surcharge (Rule 20)</span>
                  <p className="text-xs text-slate-500">{rating.fscDetails}</p>
                </div>
                <span className="text-xl font-bold text-amber-600">${rating.fsc}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-emerald-600 text-white rounded-lg">
                <span className="text-lg font-semibold">TOTAL CHARGE</span>
                <span className="text-3xl font-bold">${rating.total}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 text-sm space-y-1">
              <p><strong>Rate Source:</strong> {rating.rateSource}</p>
              <p><strong>Minimum Weight:</strong> {rating.minWeight.toLocaleString()} lbs</p>
              <p><strong>Actual Weight:</strong> {rating.actualWeight.toLocaleString()} lbs</p>
              <p><strong>DOE Diesel Price:</strong> ${rating.dieselPrice}/gal</p>
            </div>

          </CardContent>
        </Card>
      )}

      {/* Accessorial Calculator */}
      {rating && (
        <RuleChargeCalculator
          baseRate={parseFloat(rating.baseRate)}
          weight={quoteInput.weight}
          onAccessorialsCalculated={(result) => {
            setAccessorials(result);
            setRating({
              ...rating,
              accessorials: result.charges,
              grandTotal: result.total.toFixed(2)
            });
          }}
        />
      )}

      {/* Final Total with Accessorials */}
      {rating && accessorials && (
        <Card className="border-2 border-blue-500 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-blue-900">💎 Complete U.S. Steel Quote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between p-2 text-sm">
              <span>Base Line-Haul</span>
              <span className="font-semibold">${rating.baseRate}</span>
            </div>
            <div className="flex justify-between p-2 text-sm">
              <span>Fuel Surcharge</span>
              <span className="font-semibold">${rating.fsc}</span>
            </div>
            {accessorials.charges.map((charge, idx) => (
              <div key={idx} className="flex justify-between p-2 text-sm border-t border-blue-200">
                <div>
                  <span className="font-medium">{charge.name}</span>
                  <p className="text-xs text-slate-600">{charge.details}</p>
                </div>
                <span className="font-semibold">${charge.amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between p-4 bg-blue-600 text-white rounded-lg text-xl font-bold border-t-2 border-blue-700 mt-3">
              <span>GRAND TOTAL</span>
              <span>${rating.grandTotal}</span>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}