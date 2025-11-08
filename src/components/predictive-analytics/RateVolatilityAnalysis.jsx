import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

export default function RateVolatilityAnalysis({ rateTrends }) {
  if (!rateTrends) return null;

  const getTrendIcon = () => {
    if (rateTrends.overall_trend === 'increasing' || rateTrends.overall_trend === 'up') {
      return <TrendingUp className="w-6 h-6 text-emerald-600" />;
    } else if (rateTrends.overall_trend === 'decreasing' || rateTrends.overall_trend === 'down') {
      return <TrendingDown className="w-6 h-6 text-red-600" />;
    }
    return <Minus className="w-6 h-6 text-blue-600" />;
  };

  const getTrendColor = () => {
    if (rateTrends.overall_trend === 'increasing' || rateTrends.overall_trend === 'up') {
      return 'from-emerald-50 to-green-50';
    } else if (rateTrends.overall_trend === 'decreasing' || rateTrends.overall_trend === 'down') {
      return 'from-red-50 to-orange-50';
    }
    return 'from-blue-50 to-cyan-50';
  };

  const getRiskBadge = () => {
    const colors = {
      LOW: 'bg-emerald-100 text-emerald-700',
      MEDIUM: 'bg-amber-100 text-amber-700',
      HIGH: 'bg-red-100 text-red-700',
      CRITICAL: 'bg-red-600 text-white'
    };
    return (
      <Badge className={colors[rateTrends.risk_level] || 'bg-blue-100 text-blue-700'}>
        {rateTrends.risk_level} Risk
      </Badge>
    );
  };

  return (
    <Card className={`border-0 shadow-xl bg-gradient-to-br ${getTrendColor()}`}>
      <CardHeader className="border-b border-slate-200 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            {getTrendIcon()}
            Market Rate Volatility
          </CardTitle>
          {getRiskBadge()}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        {/* Overall Trend */}
        <div className="p-5 bg-white rounded-xl border-2 border-slate-200 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {getTrendIcon()}
            <div>
              <h4 className="font-bold text-slate-900 text-lg">Overall Market Trend</h4>
              <p className="text-sm text-slate-600 capitalize">
                Rates are <span className="font-semibold">{rateTrends.overall_trend}</span>
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700">
              {rateTrends.overall_trend === 'increasing' || rateTrends.overall_trend === 'up' 
                ? '📈 Market rates are trending upward. Consider locking in long-term contracts now and prioritizing customer retention.'
                : rateTrends.overall_trend === 'decreasing' || rateTrends.overall_trend === 'down'
                ? '📉 Market rates are declining. Focus on efficiency and consider expanding market share with competitive pricing.'
                : '➡️ Market rates are stable. Good time for steady growth and optimizing existing operations.'}
            </p>
          </div>
        </div>

        {/* Volatility Periods */}
        {rateTrends.volatility_periods && rateTrends.volatility_periods.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              High Volatility Periods
            </h4>
            <div className="space-y-2">
              {rateTrends.volatility_periods.map((period, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <p className="text-sm font-medium text-slate-900">{period}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-900">
                <span className="font-semibold">⚠️ Strategy:</span> During volatile periods, consider shorter contract terms, 
                maintain flexible pricing, and closely monitor competitor rates.
              </p>
            </div>
          </div>
        )}

        {/* Risk Assessment */}
        <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-full ${
              rateTrends.risk_level === 'HIGH' || rateTrends.risk_level === 'CRITICAL' 
                ? 'bg-red-100' 
                : rateTrends.risk_level === 'MEDIUM' 
                ? 'bg-amber-100' 
                : 'bg-emerald-100'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${
                rateTrends.risk_level === 'HIGH' || rateTrends.risk_level === 'CRITICAL' 
                  ? 'text-red-600' 
                  : rateTrends.risk_level === 'MEDIUM' 
                  ? 'text-amber-600' 
                  : 'text-emerald-600'
              }`} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 mb-2">Risk Assessment</h4>
              <p className="text-sm text-slate-700">
                {rateTrends.risk_level === 'HIGH' || rateTrends.risk_level === 'CRITICAL'
                  ? 'High market volatility expected. Implement risk mitigation strategies, review pricing frequently, and maintain cash reserves.'
                  : rateTrends.risk_level === 'MEDIUM'
                  ? 'Moderate volatility anticipated. Stay agile with pricing and monitor market conditions weekly.'
                  : 'Low risk environment. Stable conditions favorable for growth and long-term planning.'}
              </p>
            </div>
          </div>
        </div>

        {/* Strategic Actions */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
          <h4 className="font-semibold text-indigo-900 mb-3">Recommended Actions</h4>
          <ul className="space-y-2 text-sm text-indigo-800">
            {rateTrends.overall_trend === 'increasing' || rateTrends.overall_trend === 'up' ? (
              <>
                <li>✓ Lock in carrier contracts at current rates</li>
                <li>✓ Increase customer rates gradually</li>
                <li>✓ Focus on customer retention</li>
              </>
            ) : rateTrends.overall_trend === 'decreasing' || rateTrends.overall_trend === 'down' ? (
              <>
                <li>✓ Renegotiate carrier rates downward</li>
                <li>✓ Pursue new customer opportunities</li>
                <li>✓ Focus on volume and market share</li>
              </>
            ) : (
              <>
                <li>✓ Maintain current pricing strategy</li>
                <li>✓ Optimize operational efficiency</li>
                <li>✓ Balanced focus on growth and profitability</li>
              </>
            )}
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}