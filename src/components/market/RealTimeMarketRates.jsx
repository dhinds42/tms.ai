import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function RealTimeMarketRates({ origin, destination, equipmentType }) {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMarketRates = async () => {
      setLoading(true);
      // Simulate market data fetch
      setTimeout(() => {
        setMarketData({
          current_rpm: 2.35,
          trend: 'up',
          change_percent: 8.5,
          market_avg: 2.28,
          high: 2.85,
          low: 1.95,
          capacity: 'tight',
          updated_at: new Date().toISOString()
        });
        setLoading(false);
      }, 800);
    };
    
    fetchMarketRates();
    const interval = setInterval(fetchMarketRates, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [origin, destination, equipmentType]);
  
  if (loading) {
    return <div className="animate-pulse bg-slate-100 h-24 rounded-lg"></div>;
  }
  
  return (
    <Card className="border-emerald-200 bg-emerald-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          Live Market Rate
          <Badge className="ml-auto bg-emerald-600 text-xs">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-emerald-900">${marketData.current_rpm}</span>
          <span className="text-sm text-slate-600">/mi</span>
          {marketData.trend === 'up' ? (
            <TrendingUp className="w-5 h-5 text-green-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-600" />
          )}
          <span className={`text-sm font-semibold ${marketData.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {marketData.change_percent}%
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-slate-600">Market Avg</p>
            <p className="font-bold">${marketData.market_avg}</p>
          </div>
          <div>
            <p className="text-slate-600">High</p>
            <p className="font-bold text-green-600">${marketData.high}</p>
          </div>
          <div>
            <p className="text-slate-600">Low</p>
            <p className="font-bold text-red-600">${marketData.low}</p>
          </div>
        </div>
        
        <Badge className={marketData.capacity === 'tight' ? 'bg-red-500' : 'bg-green-500'}>
          Capacity: {marketData.capacity}
        </Badge>
      </CardContent>
    </Card>
  );
}