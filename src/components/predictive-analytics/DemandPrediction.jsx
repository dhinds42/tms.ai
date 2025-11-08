import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DemandPrediction({ volumePrediction }) {
  if (!volumePrediction || volumePrediction.length === 0) return null;

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-indigo-600" />
          <div>
            <CardTitle className="text-xl">Load Volume Prediction</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Forecasted load counts and capacity requirements
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={volumePrediction}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="predicted_loads" fill="url(#demandGradient)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
          {volumePrediction.map((month, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg text-center">
              <p className="text-xs text-slate-600 mb-1">{month.month}</p>
              <p className="font-bold text-indigo-600">{month.predicted_loads}</p>
              <Badge className="mt-1 text-xs bg-purple-100 text-purple-700">
                {month.capacity_needed}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}