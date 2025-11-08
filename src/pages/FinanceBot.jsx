import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, Sparkles, Target } from "lucide-react";

import ProfitabilityAnalysis from "../components/financebot/ProfitabilityAnalysis";
import CashFlowForecast from "../components/financebot/CashFlowForecast";
import MarginAnalysis from "../components/financebot/MarginAnalysis";
import CostOptimization from "../components/financebot/CostOptimization";
import FinancialInsights from "../components/financebot/FinancialInsights";

export default function FinanceBot() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [financialAnalysis, setFinancialAnalysis] = useState(null);

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers, isLoading: carriersLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const { data: shippers, isLoading: shippersLoading } = useQuery({
    queryKey: ['shippers'],
    queryFn: () => base44.entities.Shipper.list('-created_date', 100),
    initialData: [],
  });

  // Calculate key metrics
  const totalRevenue = loads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const totalCosts = loads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);
  const totalMargin = totalRevenue - totalCosts;
  const avgMarginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue * 100).toFixed(1) : 0;

  const deliveredLoads = loads.filter(l => l.status === 'delivered');
  const invoicedLoads = loads.filter(l => l.invoice_number);
  const paidInvoices = loads.filter(l => l.invoice_status === 'paid');

  const outstandingAR = invoicedLoads
    .filter(l => l.invoice_status !== 'paid')
    .reduce((sum, l) => sum + (l.customer_rate || 0), 0);

  const runFinancialAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FinanceBot, an AI financial analyst for a freight brokerage TMS.

FINANCIAL DATA:
- Total Revenue: $${totalRevenue.toLocaleString()}
- Total Costs: $${totalCosts.toLocaleString()}
- Gross Margin: $${totalMargin.toLocaleString()}
- Margin %: ${avgMarginPercent}%
- Total Loads: ${loads.length}
- Delivered Loads: ${deliveredLoads.length}
- Outstanding AR: $${outstandingAR.toLocaleString()}
- Paid Invoices: ${paidInvoices.length}
- Total Carriers: ${carriers.length}
- Total Customers: ${shippers.length}

TOP CUSTOMERS BY REVENUE:
${shippers.map(s => `- ${s.company_name}: $${(s.total_revenue || 0).toLocaleString()} (${s.total_loads || 0} loads)`).slice(0, 5).join('\n')}

TOP CARRIERS BY COST:
${carriers.map(c => `- ${c.company_name}: $${(c.total_paid || 0).toLocaleString()} (${c.total_loads || 0} loads)`).slice(0, 5).join('\n')}

PROVIDE COMPREHENSIVE FINANCIAL ANALYSIS:
1. Overall Financial Health Score (0-100)
2. Profitability Assessment (EXCELLENT/GOOD/FAIR/POOR)
3. Cash Flow Status (HEALTHY/STABLE/AT_RISK/CRITICAL)
4. Key Strengths (3-5 positive financial indicators)
5. Key Concerns (3-5 areas needing attention)
6. Revenue Growth Opportunities (specific recommendations)
7. Cost Reduction Opportunities (specific recommendations)
8. Working Capital Recommendations
9. Margin Improvement Strategies (3-5 actionable strategies)
10. Risk Factors (financial risks to monitor)
11. 30-Day Cash Flow Forecast (projected inflows/outflows)
12. Lane Profitability Insights (which lanes are most profitable)
13. Customer Profitability Ranking (best/worst customers by margin)
14. Recommended Actions (prioritized list of 5-7 actions)`,
        response_json_schema: {
          type: "object",
          properties: {
            financial_health_score: { type: "number" },
            profitability_assessment: { type: "string" },
            cash_flow_status: { type: "string" },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            concerns: {
              type: "array",
              items: { type: "string" }
            },
            revenue_opportunities: {
              type: "array",
              items: { type: "string" }
            },
            cost_reduction_opportunities: {
              type: "array",
              items: { type: "string" }
            },
            working_capital_recommendations: { type: "string" },
            margin_improvement_strategies: {
              type: "array",
              items: { type: "string" }
            },
            risk_factors: {
              type: "array",
              items: { type: "string" }
            },
            cash_flow_forecast: {
              type: "object",
              properties: {
                projected_inflows: { type: "number" },
                projected_outflows: { type: "number" },
                net_position: { type: "number" }
              }
            },
            lane_profitability_insights: { type: "string" },
            customer_profitability_ranking: { type: "string" },
            recommended_actions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setFinancialAnalysis(result);
    } catch (error) {
      console.error('Financial analysis error:', error);
      alert('Failed to run financial analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent mb-2">
            FinanceBot: AI Financial Intelligence
          </h1>
          <p className="text-slate-600 text-lg">
            Advanced financial analytics, forecasting, and profitability insights
          </p>
          <Badge className="mt-3 bg-emerald-600">AI-Powered CFO</Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">${(totalRevenue / 1000).toFixed(0)}K</p>
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
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Gross Margin</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{avgMarginPercent}%</p>
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
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Outstanding AR</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">${(outstandingAR / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Net Profit</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">${(totalMargin / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <PieChart className="w-6 h-6 text-white" />
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
                <h3 className="font-semibold text-slate-900 text-lg">AI Financial Analysis</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Get comprehensive insights into your financial performance
                </p>
              </div>
              <Button
                onClick={runFinancialAnalysis}
                disabled={isAnalyzing || loadsLoading}
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg hover:shadow-emerald-500/50"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Run Deep Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {financialAnalysis && (
          <>
            <FinancialInsights analysis={financialAnalysis} />
            <ProfitabilityAnalysis loads={loads} shippers={shippers} carriers={carriers} />
            <div className="grid lg:grid-cols-2 gap-6">
              <CashFlowForecast forecast={financialAnalysis.cash_flow_forecast} />
              <MarginAnalysis loads={loads} avgMargin={avgMarginPercent} />
            </div>
            <CostOptimization analysis={financialAnalysis} />
          </>
        )}

      </div>
    </div>
  );
}