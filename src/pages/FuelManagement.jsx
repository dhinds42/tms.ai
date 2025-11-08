import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fuel, TrendingUp, DollarSign, AlertTriangle, MapPin, Zap } from "lucide-react";

import FuelSpendAnalysis from "../components/fuel/FuelSpendAnalysis";
import FuelCardManagement from "../components/fuel/FuelCardManagement";
import FuelEfficiencyTracking from "../components/fuel/FuelEfficiencyTracking";
import FuelOptimizationTips from "../components/fuel/FuelOptimizationTips";

export default function FuelManagement() {
  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
  });

  const { data: ownerOperators, isLoading: ooLoading } = useQuery({
    queryKey: ['owner-operators'],
    queryFn: () => base44.entities.OwnerOperator.list('-created_date', 100),
    initialData: [],
  });

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const allDrivers = [...drivers, ...ownerOperators];
  
  // Calculate fuel metrics (simplified - in production would use real fuel card data)
  const totalMiles = loads.reduce((sum, l) => sum + (l.distance_miles || 0), 0);
  const estimatedGallons = totalMiles / 6.5; // Avg 6.5 MPG
  const avgFuelPrice = 3.85;
  const totalFuelCost = estimatedGallons * avgFuelPrice;
  const avgCostPerMile = totalMiles > 0 ? totalFuelCost / totalMiles : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-red-900 to-orange-900 bg-clip-text text-transparent">
              Fuel Card Management
            </h1>
            <p className="text-slate-600 mt-2">
              Monitor fuel spend, efficiency, and optimization opportunities
            </p>
          </div>
          <Button className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
            <Zap className="w-4 h-4 mr-2" />
            Run Optimization Analysis
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Fuel Cost</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">${(totalFuelCost / 1000).toFixed(1)}K</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl">
                  <Fuel className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Fuel Price</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">${avgFuelPrice.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-1">per gallon</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Cost per Mile</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">${avgCostPerMile.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Fleet MPG</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">6.5</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fuel Card Management */}
        <FuelCardManagement drivers={allDrivers} />

        {/* Spend Analysis */}
        <FuelSpendAnalysis loads={loads} />

        {/* Efficiency Tracking */}
        <FuelEfficiencyTracking drivers={allDrivers} loads={loads} />

        {/* Optimization Tips */}
        <FuelOptimizationTips totalCost={totalFuelCost} avgMPG={6.5} />

      </div>
    </div>
  );
}