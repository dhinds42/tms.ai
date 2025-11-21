import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, AlertTriangle, TrendingDown, Calendar } from "lucide-react";

export default function PredictiveMaintenanceEngine() {
  const predictions = [
    { 
      vehicle: 'Truck #1234', 
      component: 'Brake Pads', 
      prediction: 'Replace in 1,200 miles',
      confidence: 94,
      severity: 'medium',
      estimated_cost: 450
    },
    { 
      vehicle: 'Truck #5678', 
      component: 'Transmission', 
      prediction: 'Service in 500 miles',
      confidence: 87,
      severity: 'high',
      estimated_cost: 2100
    },
    { 
      vehicle: 'Trailer #9012', 
      component: 'Tires', 
      prediction: 'Replace in 3,000 miles',
      confidence: 92,
      severity: 'low',
      estimated_cost: 1800
    }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-orange-600" />
          AI Predictive Maintenance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <p className="text-xs text-red-900 font-semibold mb-1">Critical</p>
            <p className="text-3xl font-bold text-red-600">1</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg text-center">
            <Calendar className="w-6 h-6 text-amber-600 mx-auto mb-1" />
            <p className="text-xs text-amber-900 font-semibold mb-1">Due Soon</p>
            <p className="text-3xl font-bold text-amber-600">2</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg text-center">
            <TrendingDown className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-emerald-900 font-semibold mb-1">Cost Savings</p>
            <p className="text-2xl font-bold text-emerald-600">$8.5K</p>
          </div>
        </div>

        <div className="space-y-3">
          {predictions.map((pred, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-2 ${
              pred.severity === 'high' ? 'bg-red-50 border-red-300' :
              pred.severity === 'medium' ? 'bg-amber-50 border-amber-300' :
              'bg-blue-50 border-blue-300'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900">{pred.vehicle}</h4>
                    <Badge className={
                      pred.severity === 'high' ? 'bg-red-600' :
                      pred.severity === 'medium' ? 'bg-amber-600' :
                      'bg-blue-600'
                    }>
                      {pred.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 font-semibold">{pred.component}</p>
                  <p className="text-sm text-slate-600">{pred.prediction}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">Confidence</p>
                  <p className="text-2xl font-bold text-indigo-600">{pred.confidence}%</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-sm text-slate-600">Est. Cost: <strong className="text-slate-900">${pred.estimated_cost}</strong></span>
                <Button size="sm" className="bg-indigo-600">Schedule Service</Button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2">🤖 AI Insights</h4>
          <ul className="space-y-1 text-sm text-slate-700">
            <li>• Proactive maintenance saved $8,500 in breakdowns this month</li>
            <li>• 3 potential failures prevented through early detection</li>
            <li>• Fleet uptime improved by 12% with predictive scheduling</li>
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}