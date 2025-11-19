import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, TrendingDown, Award, BarChart3 } from "lucide-react";

import EmissionsCalculator from "../components/carbon/EmissionsCalculator";

export default function CarbonDashboard() {
  const { data: emissions = [] } = useQuery({
    queryKey: ['shipmentEmissions'],
    queryFn: () => base44.entities.ShipmentEmission.list('-created_date', 500),
    initialData: [],
  });

  const totalCO2 = emissions.reduce((sum, e) => sum + (e.co2e_kg || 0), 0);
  const avgEfficiency = emissions.length > 0 
    ? emissions.reduce((sum, e) => sum + (e.co2e_per_ton_km || 0), 0) / emissions.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">
            Carbon Footprint Dashboard
          </h1>
          <p className="text-slate-600 mt-2">ESG reporting and sustainability metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total CO2e (kg)</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {totalCO2.toLocaleString()}
                  </p>
                </div>
                <Leaf className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Efficiency</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {avgEfficiency.toFixed(1)}
                  </p>
                </div>
                <TrendingDown className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Shipments Tracked</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{emissions.length}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">ESG Rating</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">A-</p>
                </div>
                <Award className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-12 text-center">
            <Leaf className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Sustainability Tracking</h3>
            <p className="text-slate-600 mb-4">
              Monitor carbon emissions across all shipments and modes
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-slate-600">Scope 1</p>
                <p className="text-xl font-bold text-green-600">Direct</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-slate-600">Scope 2</p>
                <p className="text-xl font-bold text-emerald-600">Indirect</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg">
                <p className="text-sm text-slate-600">Scope 3</p>
                <p className="text-xl font-bold text-teal-600">Supply Chain</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emissions Calculator */}
        <EmissionsCalculator />

      </div>
    </div>
  );
}