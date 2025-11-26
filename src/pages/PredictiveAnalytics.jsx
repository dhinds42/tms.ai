import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ForecastingEngine from "../components/predictive/ForecastingEngine";
import { TrendingUp, BarChart, Target, Zap, Sparkles, AlertTriangle } from "lucide-react";

import RevenueForecast from "../components/predictive-analytics/RevenueForecast";
import DemandPrediction from "../components/predictive-analytics/DemandPrediction";
import RateVolatilityAnalysis from "../components/predictive-analytics/RateVolatilityAnalysis";
import CarrierPerformancePredictor from "../components/predictive-analytics/CarrierPerformancePredictor";
import SeasonalTrends from "../components/predictive-analytics/SeasonalTrends";
import PredictiveInsights from "../components/predictive-analytics/PredictiveInsights";

export default function PredictiveAnalytics() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState(null);

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const { data: shippers } = useQuery({
    queryKey: ['shippers'],
    queryFn: () => base44.entities.Shipper.list('-created_date', 100),
    initialData: [],
  });

  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const runPredictiveAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      const historicalRevenue = loads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
      const avgMonthlyRevenue = historicalRevenue / 12;
      const totalLoads = loads.length;
      const avgLoadsPerMonth = totalLoads / 12;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a predictive analytics AI for freight transportation.

HISTORICAL DATA:
- Total Revenue (12 months): $${historicalRevenue.toLocaleString()}
- Average Monthly Revenue: $${avgMonthlyRevenue.toLocaleString()}
- Total Loads: ${totalLoads}
- Average Loads/Month: ${Math.floor(avgLoadsPerMonth)}
- Active Carriers: ${carriers.length}
- Active Customers: ${shippers.length}
- Operating Mode: ${operatingMode}

GENERATE PREDICTIONS FOR NEXT 6 MONTHS:

1. REVENUE FORECAST
   - Monthly revenue predictions
   - Growth rate trends
   - Confidence intervals

2. LOAD VOLUME PREDICTIONS
   - Expected load counts per month
   - Peak season timing
   - Capacity needs

3. RATE VOLATILITY
   - Market rate trends (up/down/stable)
   - High volatility periods
   - Risk windows

4. CARRIER PERFORMANCE
   - Top performers to prioritize
   - At-risk relationships
   - Recruitment needs

5. SEASONAL TRENDS
   - Peak demand months
   - Slow periods
   - Strategic planning insights

6. RISK FACTORS
   - Economic indicators impact
   - Fuel price sensitivity
   - Competition threats

7. STRATEGIC RECOMMENDATIONS
   - Growth opportunities
   - Cost optimization targets
   - Market positioning

Provide data-driven, actionable predictions with specific numbers and timeframes.`,
        response_json_schema: {
          type: "object",
          properties: {
            revenue_forecast: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "string" },
                  predicted_revenue: { type: "number" },
                  confidence: { type: "string" },
                  growth_rate: { type: "number" }
                }
              }
            },
            load_volume_prediction: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "string" },
                  predicted_loads: { type: "number" },
                  capacity_needed: { type: "string" }
                }
              }
            },
            rate_trends: {
              type: "object",
              properties: {
                overall_trend: { type: "string" },
                volatility_periods: {
                  type: "array",
                  items: { type: "string" }
                },
                risk_level: { type: "string" }
              }
            },
            carrier_insights: {
              type: "object",
              properties: {
                top_performers: {
                  type: "array",
                  items: { type: "string" }
                },
                at_risk: {
                  type: "array",
                  items: { type: "string" }
                },
                recruitment_priority: { type: "string" }
              }
            },
            seasonal_analysis: {
              type: "object",
              properties: {
                peak_months: {
                  type: "array",
                  items: { type: "string" }
                },
                slow_months: {
                  type: "array",
                  items: { type: "string" }
                },
                planning_insights: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            risk_factors: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            summary: { type: "string" }
          }
        }
      });

      setPredictions(result);

    } catch (error) {
      console.error('Predictive analysis error:', error);
      alert('Failed to run predictive analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const historicalRevenue = loads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const avgMargin = loads.length > 0 
    ? loads.reduce((sum, l) => sum + (l.margin || 0), 0) / loads.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <BarChart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent mb-2">
            Predictive Analytics Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            AI-powered forecasting and strategic insights for your business
          </p>
          <Badge className="mt-3 bg-blue-600">Advanced ML Models</Badge>
        </div>

        {/* Current Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">YTD Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    ${(historicalRevenue / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Margin</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">${avgMargin.toFixed(0)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Loads</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{loads.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <BarChart2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Prediction</p>
                  <p className="text-3xl font-bold text-cyan-600 mt-2">
                    {predictions ? 'Ready' : 'Pending'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Run Analysis Button */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Run Predictive Analysis</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Generate AI-powered forecasts for the next 6 months
                </p>
              </div>
              <Button
                onClick={runPredictiveAnalysis}
                disabled={isAnalyzing || loadsLoading}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/50"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Predictions
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {predictions && (
          <>
            {/* Predictive Insights Summary */}
            <PredictiveInsights predictions={predictions} />

            {/* Revenue Forecast */}
            <RevenueForecast forecast={predictions.revenue_forecast} />

            {/* Demand Prediction */}
            <DemandPrediction volumePrediction={predictions.load_volume_prediction} />

            {/* Rate Volatility */}
            <RateVolatilityAnalysis rateTrends={predictions.rate_trends} />

            {/* Carrier Performance */}
            <CarrierPerformancePredictor carrierInsights={predictions.carrier_insights} />

            {/* Seasonal Trends */}
            <SeasonalTrends seasonalAnalysis={predictions.seasonal_analysis} />

            {/* Risk Factors */}
            {predictions.risk_factors && predictions.risk_factors.length > 0 && (
              <Card className="border-0 shadow-xl bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <AlertTriangle className="w-5 h-5" />
                    Risk Factors to Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {predictions.risk_factors.map((risk, idx) => (
                      <li key={idx} className="text-sm text-amber-900 p-2 bg-white rounded">
                        • {risk}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Strategic Recommendations */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Strategic Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {predictions.recommendations?.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-700 p-3 bg-white rounded-lg border border-indigo-200">
                      <span className="font-bold text-indigo-600">{idx + 1}. </span>{rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}

        {/* Forecasting Engine */}
        <ForecastingEngine loads={loads} />

      </div>
    </div>
  );
}