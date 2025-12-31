import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Truck, Navigation } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function ProfitabilityDashboard({ lanePreferences, laneRates, costProfiles }) {
  
  const formatCents = (cents) => {
    if (!cents) return '$0.00';
    return `$${(cents / 100).toFixed(2)}`;
  };
  
  // Aggregate stats
  const totalLanes = lanePreferences.length;
  const profitableLanes = laneRates.filter(r => 
    r.carrier_profitability_ok && r.broker_profitability_ok
  ).length;
  const avgMarginBps = laneRates.length > 0
    ? laneRates.reduce((sum, r) => sum + (r.computed_broker_margin_bps || 0), 0) / laneRates.length
    : 0;
  
  // Lane profitability breakdown
  const laneData = laneRates.slice(0, 10).map(rate => {
    const lane = lanePreferences.find(l => l.id === rate.lane_preference_id);
    return {
      name: lane ? `${lane.origin_city}-${lane.destination_city}`.slice(0, 15) : 'Unknown',
      revenue: (rate.computed_customer_revenue_cents || 0) / 100,
      cost: (rate.computed_operating_cost_cents || 0) / 100,
      profit: ((rate.computed_carrier_profit_cents || rate.computed_ownerop_profit_cents) || 0) / 100
    };
  });
  
  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Total Lanes</p>
                <p className="text-3xl font-bold text-indigo-900">{totalLanes}</p>
              </div>
              <Navigation className="w-10 h-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Profitable Lanes</p>
                <p className="text-3xl font-bold text-emerald-900">{profitableLanes}</p>
                <p className="text-xs text-emerald-700">
                  {totalLanes > 0 ? ((profitableLanes / totalLanes) * 100).toFixed(0) : 0}% of total
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Avg Margin</p>
                <p className="text-3xl font-bold text-purple-900">{(avgMarginBps / 100).toFixed(1)}%</p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Profitability Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lane Profitability Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {laneData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={laneData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `$${value.toFixed(0)}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar dataKey="cost" fill="#ef4444" name="Operating Cost" />
                <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-slate-600">
              <p>No lane rates configured yet</p>
              <p className="text-sm mt-2">Create a lane and add rates to see profitability analysis</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Rate Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {laneRates.slice(0, 5).map(rate => {
              const lane = lanePreferences.find(l => l.id === rate.lane_preference_id);
              return (
                <div key={rate.id} className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-900">
                        {lane ? `${lane.origin_city}, ${lane.origin_state} → ${lane.destination_city}, ${lane.destination_state}` : 'Unknown Lane'}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {rate.rate_type === 'per_mile' 
                          ? `${formatCents(rate.target_rpm_cents)}/mi` 
                          : `${formatCents(rate.target_flat_cents)} flat`}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {rate.carrier_profitability_ok && (
                          <Badge className="bg-emerald-500 text-xs">✓ Carrier</Badge>
                        )}
                        {rate.broker_profitability_ok && (
                          <Badge className="bg-purple-500 text-xs">✓ Broker</Badge>
                        )}
                      </div>
                    </div>
                    <Badge className={rate.approval_status === 'approved' ? 'bg-green-500' : 'bg-amber-500'}>
                      {rate.approval_status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Lane Builder Modal */}
      {showLaneBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <LaneBuilder
              actorType={user?.role === 'driver' ? 'driver' : user?.role === 'owner_operator' ? 'owner_operator' : 'carrier'}
              actorId={user?.id}
              onComplete={() => setShowLaneBuilder(false)}
            />
            <Button
              onClick={() => setShowLaneBuilder(false)}
              variant="outline"
              className="mt-4 w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
    </div>
  );
}