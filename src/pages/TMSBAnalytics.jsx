import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Truck, Clock } from "lucide-react";

export default function TMSBAnalytics() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: driver } = useQuery({
    queryKey: ['currentDriver', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const drivers = await base44.entities.Driver.filter({ linked_user_id: user.id });
      return drivers[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: allLoads = [] } = useScopedEntity('Load', { limit: 200 });
  const loads = allLoads.filter(l => l.driver_id === driver?.id && l.synced_to_tms_b === true);

  const completedLoads = loads.filter(l => l.status === 'delivered');
  const totalEarnings = completedLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);
  const totalMiles = completedLoads.reduce((sum, l) => sum + (l.distance_miles_actual || l.distance_miles_planned || 0), 0);
  const avgRate = totalMiles > 0 ? totalEarnings / totalMiles : 0;

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayLoads = completedLoads.filter(l => {
      const loadDate = new Date(l.actual_delivery_datetime || l.created_date);
      return loadDate.toDateString() === date.toDateString();
    });
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      loads: dayLoads.length,
      earnings: dayLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0)
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
          <h1 className="text-4xl font-bold">My Performance</h1>
          <p className="text-emerald-100 mt-2">Driver Analytics Dashboard</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <Truck className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-sm text-slate-600">Total Loads</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{completedLoads.length}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-sm text-slate-600">Total Earnings</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">${totalEarnings.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
              <p className="text-sm text-slate-600">Avg Rate/Mile</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">${avgRate.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 text-amber-600 mb-2" />
              <p className="text-sm text-slate-600">On-Time %</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{driver?.on_time_percentage || 0}%</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Weekly Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="earnings" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}