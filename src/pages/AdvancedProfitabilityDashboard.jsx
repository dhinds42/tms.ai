import React from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import AdvancedProfitabilityInsights from "../components/analytics/AdvancedProfitabilityInsights";
import AdvancedFinancialMetrics from "../components/financial/AdvancedFinancialMetrics";
import ProfitabilityDashboard from "../components/lane-profitability/ProfitabilityDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Target } from "lucide-react";

export default function AdvancedProfitabilityDashboard() {
  const { data: loads } = useScopedEntity('Load', { limit: 500 });
  const { data: carriers } = useScopedEntity('Carrier', { limit: 200 });
  const { data: lanePrefs } = useScopedEntity('LanePreference', { limit: 100 });
  const { data: laneRates } = useScopedEntity('LaneRatePreference', { limit: 100 });
  const { data: costProfiles } = useScopedEntity('CostProfile', { limit: 50 });
  
  const totalRevenue = loads.reduce((s, l) => s + (l.customer_rate || 0), 0);
  const totalCost = loads.reduce((s, l) => s + (l.carrier_pay || 0), 0);
  const totalMargin = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">
            Advanced Profitability Analytics
          </h1>
          <p className="text-slate-600 mt-2">Deep insights into lane, carrier, and driver profitability</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">${(totalRevenue / 1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Margin</p>
                  <p className="text-2xl font-bold text-purple-600">${(totalMargin / 1000).toFixed(0)}K</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Margin %</p>
                  <p className="text-2xl font-bold text-blue-600">{marginPercent}%</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Loads</p>
                  <p className="text-2xl font-bold text-amber-600">{loads.length}</p>
                </div>
                <Target className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdvancedProfitabilityInsights loads={loads} carriers={carriers} />
          <AdvancedFinancialMetrics loads={loads} customers={[]} />
        </div>
        
        <ProfitabilityDashboard 
          lanePreferences={lanePrefs}
          laneRates={laneRates}
          costProfiles={costProfiles}
        />
        
      </div>
    </div>
  );
}