import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Package, TrendingDown, Clock, MapPin } from "lucide-react";

export default function LoadOptimizer() {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizationResults = [
    { 
      type: 'Route Optimization', 
      savings: '$1,240', 
      metric: '145 miles saved',
      improvement: '18%',
      status: 'completed' 
    },
    { 
      type: 'Load Consolidation', 
      savings: '$2,890', 
      metric: '3 loads combined',
      improvement: '35%',
      status: 'completed' 
    },
    { 
      type: 'Backhaul Matching', 
      savings: '$890', 
      metric: '2 empty miles eliminated',
      improvement: '12%',
      status: 'pending' 
    }
  ];

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => setIsOptimizing(false), 2000);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            AI Load Optimization Engine
          </CardTitle>
          <Button 
            className="bg-purple-600"
            onClick={handleOptimize}
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Run Optimization
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg text-center">
            <TrendingDown className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-emerald-900 font-semibold mb-1">Total Savings</p>
            <p className="text-3xl font-bold text-emerald-600">$5,020</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-blue-900 font-semibold mb-1">Time Saved</p>
            <p className="text-3xl font-bold text-blue-600">8.5hrs</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <Package className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-purple-900 font-semibold mb-1">Loads Optimized</p>
            <p className="text-3xl font-bold text-purple-600">24</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Optimization Results</h4>
          <div className="space-y-3">
            {optimizationResults.map((result, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900">{result.type}</h4>
                      <Badge className={result.status === 'completed' ? 'bg-emerald-600' : 'bg-amber-600'}>
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{result.metric}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600">Savings</p>
                    <p className="text-2xl font-bold text-emerald-600">{result.savings}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-purple-200">
                  <span className="text-sm text-slate-600">Improvement: <strong className="text-purple-600">{result.improvement}</strong></span>
                  <MapPin className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-900 mb-2">💡 AI Recommendations</h4>
          <ul className="space-y-1 text-sm text-slate-700">
            <li>• Consolidate Chicago → Dallas loads on Wednesday</li>
            <li>• 5 backhaul opportunities available in Atlanta</li>
            <li>• Route optimization can save 234 miles this week</li>
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}