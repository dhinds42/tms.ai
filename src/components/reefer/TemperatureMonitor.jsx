import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TemperatureMonitor() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const reeferLoads = loads.filter(l => l.equipment_type === 'reefer' || l.temperature_controlled);

  const tempData = [
    { time: '00:00', temp: 35 },
    { time: '04:00', temp: 36 },
    { time: '08:00', temp: 35 },
    { time: '12:00', temp: 34 },
    { time: '16:00', temp: 35 },
    { time: '20:00', temp: 36 }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-blue-600" />
          Temperature Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {reeferLoads.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              Active Load: {reeferLoads[0].load_number}
            </p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-blue-700">Set Point: 34-38°F</span>
              <Badge className="bg-emerald-600">In Range</Badge>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={tempData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-50 rounded">
            <p className="text-xs text-emerald-900">In Range</p>
            <p className="text-2xl font-bold text-emerald-600">{reeferLoads.length}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded">
            <p className="text-xs text-amber-900">Alerts</p>
            <p className="text-2xl font-bold text-amber-600">0</p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}