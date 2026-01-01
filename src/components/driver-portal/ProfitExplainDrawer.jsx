import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertCircle, Info, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfitExplainDrawer({ load, laneRate, isEligible }) {
  const [showExplain, setShowExplain] = React.useState(false);

  if (!isEligible) {
    return (
      <Card className="border-2 border-slate-200 bg-slate-50">
        <CardContent className="p-4 text-center">
          <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-semibold">Profit Breakdown Locked</p>
          <p className="text-xs text-slate-500 mt-1">Complete 5 loads with 90%+ on-time to unlock</p>
        </CardContent>
      </Card>
    );
  }

  const explain = laneRate?.explain_calculation_json || {};
  const revenue = explain.revenue_breakdown || {};
  const costs = explain.cost_breakdown || {};
  const profit = explain.profit_breakdown || {};

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setShowExplain(!showExplain)}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        <DollarSign className="w-4 h-4 mr-2" />
        {showExplain ? 'Hide' : 'Show'} Profit Breakdown
      </Button>

      {showExplain && (
        <Card className="border-2 border-indigo-200">
          <CardHeader className="bg-indigo-50">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Your Pay Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            
            {/* Revenue Section */}
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Revenue</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-700">Line Haul Pay</span>
                  <span className="font-semibold">${((revenue.carrier_pay_cents || 0) / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown (Driver Perspective) */}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Your Costs</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Fuel</span>
                  <span className="font-medium">${((costs.fuel_cents || 0) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Maintenance</span>
                  <span className="font-medium">${((costs.maintenance_cents || 0) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Insurance</span>
                  <span className="font-medium">${((costs.insurance_cents || 0) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Overhead</span>
                  <span className="font-medium">${((costs.overhead_cents || 0) / 100).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1 mt-1 flex justify-between font-semibold">
                  <span>Total Costs</span>
                  <span>${((costs.operating_cost_cents || 0) / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Profit */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-green-900">Your Net Profit</p>
                <p className="text-2xl font-bold text-green-700">
                  ${((profit.ownerop_profit_cents || profit.carrier_profit_cents || 0) / 100).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Flags */}
            {explain.flags && (
              <div className="space-y-2">
                {explain.flags.driver_ok && (
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    Meets profitability requirements
                  </div>
                )}
              </div>
            )}

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-900">
                    This breakdown shows how your pay is calculated. All costs are estimated based on industry averages.
                  </p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  );
}