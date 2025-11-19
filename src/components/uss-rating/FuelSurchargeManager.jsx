import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Plus, Download } from "lucide-react";

export default function FuelSurchargeManager() {
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [newPrice, setNewPrice] = useState({ weekStart: '', dieselPrice: '' });

  const queryClient = useQueryClient();

  const { data: fuelPrices } = useQuery({
    queryKey: ['doe_fuel'],
    queryFn: () => base44.entities.DOEFuelPrice.list('-week_start_date', 20),
    initialData: [],
  });

  const { data: fscBrackets } = useQuery({
    queryKey: ['uss_fuel'],
    queryFn: () => base44.entities.USSFuelSurchargeBracket.list(),
    initialData: [],
  });

  const addPriceMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.DOEFuelPrice.create({
        week_start_date: data.weekStart,
        national_average_diesel_price: parseFloat(data.dieselPrice),
        source_url: 'https://www.eia.gov/petroleum/gasdiesel/',
        fetched_at: new Date().toISOString(),
        fetched_by_user_id: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doe_fuel'] });
      setShowAddPrice(false);
      setNewPrice({ weekStart: '', dieselPrice: '' });
    },
  });

  const currentWeekPrice = fuelPrices[0];

  return (
    <div className="space-y-6">
      
      {/* Current DOE Price */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current DOE Diesel Price</span>
            <Button onClick={() => setShowAddPrice(!showAddPrice)} size="sm" className="bg-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Weekly Price
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentWeekPrice ? (
            <div>
              <p className="text-4xl font-bold text-emerald-600 mb-2">
                ${currentWeekPrice.national_average_diesel_price.toFixed(3)}
              </p>
              <p className="text-sm text-slate-600">
                Week of {new Date(currentWeekPrice.week_start_date).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-slate-600">No fuel prices recorded yet</p>
          )}
        </CardContent>
      </Card>

      {/* Add Price Form */}
      {showAddPrice && (
        <Card className="border-2 border-emerald-300">
          <CardContent className="p-4 space-y-3">
            <div>
              <Label>Week Start Date (Monday)</Label>
              <Input
                type="date"
                value={newPrice.weekStart}
                onChange={(e) => setNewPrice({...newPrice, weekStart: e.target.value})}
                className="mt-2"
              />
            </div>
            <div>
              <Label>National Diesel Price ($/gallon)</Label>
              <Input
                type="number"
                step="0.001"
                value={newPrice.dieselPrice}
                onChange={(e) => setNewPrice({...newPrice, dieselPrice: e.target.value})}
                placeholder="3.549"
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => addPriceMutation.mutate(newPrice)}
                disabled={!newPrice.weekStart || !newPrice.dieselPrice}
                className="flex-1 bg-emerald-600"
              >
                Save Price
              </Button>
              <Button onClick={() => setShowAddPrice(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Prices */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Recent DOE Prices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fuelPrices.slice(0, 10).map(price => (
              <div key={price.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold">Week of {new Date(price.week_start_date).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-600">
                    Recorded {new Date(price.created_date).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-blue-600 text-lg px-3 py-1">
                  ${price.national_average_diesel_price.toFixed(3)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FSC Bracket Info */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>FSC Brackets (from Contract Rule 20)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            {fscBrackets.length} fuel surcharge brackets configured. Based on mileage band:
          </p>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>• 0-5 miles: Flat FSC rate</li>
            <li>• 6-36 miles: Flat FSC rate</li>
            <li>• 37-349 miles: Cents per mile</li>
            <li>• 350+ miles: Cents per mile (different table)</li>
            <li>• Canada: Percentage-based FSC</li>
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}