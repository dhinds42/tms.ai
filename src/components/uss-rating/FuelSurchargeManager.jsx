import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Fuel, TrendingUp, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function FuelSurchargeManager() {
  const queryClient = useQueryClient();
  const [newPrice, setNewPrice] = useState('');

  const { data: fuelPrices } = useQuery({
    queryKey: ['doe-fuel-prices'],
    queryFn: () => base44.entities.DOEFuelPrice.list('-week_start_date', 10),
    initialData: [],
  });

  const addPriceMutation = useMutation({
    mutationFn: (priceData) => base44.entities.DOEFuelPrice.create(priceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doe-fuel-prices'] });
      setNewPrice('');
    }
  });

  const handleAddPrice = () => {
    const price = parseFloat(newPrice);
    if (!price || price <= 0) return;

    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);

    addPriceMutation.mutate({
      week_start_date: format(monday, 'yyyy-MM-dd'),
      national_average_diesel_price: price,
      source_url: 'https://www.eia.gov/petroleum/gasdiesel/',
      fetched_at: new Date().toISOString(),
      applicable_fsc_week_start: format(new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    });
  };

  const currentPrice = fuelPrices[0];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="w-5 h-5 text-amber-600" />
          DOE Fuel Price Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {currentPrice && (
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-300">
            <p className="text-sm text-amber-900 mb-1">Current DOE Diesel Price</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-amber-600">
                ${currentPrice.national_average_diesel_price.toFixed(3)}/gal
              </p>
              <Badge className="bg-amber-600">
                Week of {format(new Date(currentPrice.week_start_date), 'MMM d')}
              </Badge>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="number"
            step="0.001"
            placeholder="Enter new price (e.g., 3.452)"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
          <Button onClick={handleAddPrice} className="bg-amber-600">
            <DollarSign className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">Price History</p>
          {fuelPrices.slice(0, 5).map((price) => (
            <div key={price.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  ${price.national_average_diesel_price.toFixed(3)}/gal
                </p>
                <p className="text-xs text-slate-600">
                  Week of {format(new Date(price.week_start_date), 'MMM d, yyyy')}
                </p>
              </div>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}