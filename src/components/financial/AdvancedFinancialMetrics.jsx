import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Clock, Users, BarChart3 } from "lucide-react";

/**
 * Advanced Financial Calculations
 * True profit, CLV, DSO, Lane-level P&L
 */

// Financial calculation utilities
export const FinancialCalculator = {
  /**
   * Calculate true profit per load
   * Includes overhead allocation and insurance
   */
  calculateTrueProfit(load, config = {}) {
    const revenue = parseFloat(load.customer_rate) || 0;
    const carrierPay = parseFloat(load.carrier_pay) || 0;
    const fuelSurcharge = parseFloat(load.fuel_surcharge_revenue) || 0;
    const accessorials = parseFloat(load.accessorial_revenue_total) || 0;
    
    const totalRevenue = revenue + fuelSurcharge + accessorials;
    const grossMargin = totalRevenue - carrierPay;
    
    // Overhead allocation (default 15%)
    const overheadPercent = config.overheadPercent || 15;
    const overhead = totalRevenue * (overheadPercent / 100);
    
    // Insurance allocation (default 2%)
    const insurancePercent = config.insurancePercent || 2;
    const insurance = totalRevenue * (insurancePercent / 100);
    
    // Other costs
    const fuelCost = parseFloat(load.fuel_cost_estimate) || 0;
    
    // True profit
    const trueProfit = grossMargin - overhead - insurance - fuelCost;
    const trueProfitMargin = totalRevenue > 0 ? (trueProfit / totalRevenue) * 100 : 0;
    
    return {
      totalRevenue,
      carrierPay,
      grossMargin,
      overhead,
      insurance,
      fuelCost,
      trueProfit,
      trueProfitMargin,
      breakdown: {
        revenue: totalRevenue,
        cost: carrierPay,
        overhead: overhead,
        insurance: insurance,
        fuel: fuelCost,
        netProfit: trueProfit
      }
    };
  },

  /**
   * Calculate Lane-level P&L
   */
  calculateLanePL(loads) {
    const laneData = {};
    
    loads.forEach(load => {
      if (!load.pickup_location?.state || !load.dropoff_location?.state) return;
      
      const lane = `${load.pickup_location.state}-${load.dropoff_location.state}`;
      
      if (!laneData[lane]) {
        laneData[lane] = {
          lane,
          origin: load.pickup_location.state,
          destination: load.dropoff_location.state,
          loads: 0,
          revenue: 0,
          cogs: 0,
          overhead: 0,
          profit: 0,
          margin: 0
        };
      }
      
      const profit = this.calculateTrueProfit(load);
      
      laneData[lane].loads++;
      laneData[lane].revenue += profit.totalRevenue;
      laneData[lane].cogs += profit.carrierPay;
      laneData[lane].overhead += profit.overhead + profit.insurance;
      laneData[lane].profit += profit.trueProfit;
    });
    
    // Calculate margins
    Object.values(laneData).forEach(lane => {
      lane.margin = lane.revenue > 0 ? (lane.profit / lane.revenue) * 100 : 0;
    });
    
    return Object.values(laneData).sort((a, b) => b.profit - a.profit);
  },

  /**
   * Calculate Customer Lifetime Value (CLV)
   */
  calculateCLV(customerLoads) {
    if (customerLoads.length === 0) return null;
    
    const totalRevenue = customerLoads.reduce((sum, l) => 
      sum + (parseFloat(l.customer_rate) || 0), 0
    );
    
    const totalProfit = customerLoads.reduce((sum, l) => {
      const profit = this.calculateTrueProfit(l);
      return sum + profit.trueProfit;
    }, 0);
    
    const avgRevenuePerLoad = totalRevenue / customerLoads.length;
    const avgProfitPerLoad = totalProfit / customerLoads.length;
    
    // Calculate customer tenure (days)
    const firstLoad = new Date(Math.min(...customerLoads.map(l => new Date(l.created_date))));
    const lastLoad = new Date(Math.max(...customerLoads.map(l => new Date(l.created_date))));
    const tenureDays = Math.max(1, (lastLoad - firstLoad) / (1000 * 60 * 60 * 24));
    
    // Calculate frequency (loads per month)
    const loadsPerMonth = (customerLoads.length / tenureDays) * 30;
    
    // Project CLV (12 month projection)
    const projectedCLV = avgProfitPerLoad * loadsPerMonth * 12;
    
    return {
      totalLoads: customerLoads.length,
      totalRevenue,
      totalProfit,
      avgRevenuePerLoad,
      avgProfitPerLoad,
      tenureDays: Math.floor(tenureDays),
      loadsPerMonth: loadsPerMonth.toFixed(1),
      projectedCLV,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    };
  },

  /**
   * Calculate Days Sales Outstanding (DSO)
   */
  calculateDSO(loads) {
    const invoicedLoads = loads.filter(l => 
      l.status === 'invoiced' || l.invoice_status === 'sent' || l.invoice_status === 'partial'
    );
    
    if (invoicedLoads.length === 0) return null;
    
    const totalAR = invoicedLoads.reduce((sum, l) => 
      sum + (parseFloat(l.customer_rate) || 0), 0
    );
    
    // Calculate average days outstanding
    const now = new Date();
    const daysOutstanding = invoicedLoads.map(l => {
      const invoiceDate = new Date(l.invoice_due_date || l.actual_delivery_datetime || l.created_date);
      return Math.max(0, (now - invoiceDate) / (1000 * 60 * 60 * 24));
    });
    
    const avgDSO = daysOutstanding.reduce((sum, d) => sum + d, 0) / daysOutstanding.length;
    
    // Calculate aging buckets
    const aging = {
      current: invoicedLoads.filter((l, i) => daysOutstanding[i] <= 30).length,
      days_30_60: invoicedLoads.filter((l, i) => daysOutstanding[i] > 30 && daysOutstanding[i] <= 60).length,
      days_60_90: invoicedLoads.filter((l, i) => daysOutstanding[i] > 60 && daysOutstanding[i] <= 90).length,
      over_90: invoicedLoads.filter((l, i) => daysOutstanding[i] > 90).length
    };
    
    return {
      totalAR,
      outstandingInvoices: invoicedLoads.length,
      avgDSO: Math.floor(avgDSO),
      aging,
      healthScore: avgDSO <= 30 ? 'excellent' : avgDSO <= 45 ? 'good' : avgDSO <= 60 ? 'fair' : 'poor'
    };
  }
};

export default function AdvancedFinancialMetrics({ loads, customers = [] }) {
  const metrics = useMemo(() => {
    if (!loads || loads.length === 0) return null;

    // Calculate aggregate metrics
    const totalProfit = loads.reduce((sum, l) => {
      const profit = FinancialCalculator.calculateTrueProfit(l);
      return sum + profit.trueProfit;
    }, 0);

    const totalRevenue = loads.reduce((sum, l) => 
      sum + (parseFloat(l.customer_rate) || 0), 0
    );

    // Lane P&L
    const lanePL = FinancialCalculator.calculateLanePL(loads);

    // DSO
    const dso = FinancialCalculator.calculateDSO(loads);

    // Top customers by CLV
    const customerCLV = customers.slice(0, 5).map(customer => {
      const customerLoads = loads.filter(l => l.customer_id === customer.id);
      return {
        customer,
        clv: FinancialCalculator.calculateCLV(customerLoads)
      };
    }).filter(c => c.clv);

    return {
      totalProfit,
      totalRevenue,
      trueProfitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      lanePL: lanePL.slice(0, 5),
      dso,
      customerCLV
    };
  }, [loads, customers]);

  if (!metrics) return null;

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">True Net Profit</p>
                <p className="text-2xl font-bold text-emerald-600">${metrics.totalProfit.toLocaleString()}</p>
                <p className="text-xs text-slate-600">{metrics.trueProfitMargin.toFixed(1)}% margin</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        {metrics.dso && (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Avg DSO</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.dso.avgDSO} days</p>
                  <Badge className={
                    metrics.dso.healthScore === 'excellent' ? 'bg-emerald-600' :
                    metrics.dso.healthScore === 'good' ? 'bg-blue-600' :
                    metrics.dso.healthScore === 'fair' ? 'bg-amber-600' : 'bg-red-600'
                  }>
                    {metrics.dso.healthScore}
                  </Badge>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Top Lane Profit</p>
                <p className="text-2xl font-bold text-indigo-600">
                  ${metrics.lanePL[0]?.profit.toLocaleString() || 0}
                </p>
                <p className="text-xs text-slate-600">{metrics.lanePL[0]?.lane || 'N/A'}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lane P&L */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Lane-Level P&L (Top 5)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {metrics.lanePL.map((lane, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-slate-900">{lane.lane}</span>
                  <span className="text-xs text-slate-500 ml-2">({lane.loads} loads)</span>
                </div>
                <Badge className={lane.margin >= 15 ? 'bg-emerald-600' : lane.margin >= 10 ? 'bg-amber-600' : 'bg-red-600'}>
                  {lane.margin.toFixed(1)}% margin
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <div className="text-slate-500">Revenue</div>
                  <div className="font-semibold">${lane.revenue.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-500">COGS</div>
                  <div className="font-semibold text-red-600">-${lane.cogs.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-500">Overhead</div>
                  <div className="font-semibold text-amber-600">-${lane.overhead.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-500">Net Profit</div>
                  <div className="font-semibold text-emerald-600">${lane.profit.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Customer CLV */}
      {metrics.customerCLV.length > 0 && (
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Customer Lifetime Value
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.customerCLV.map((item, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900">{item.customer.company_name || item.customer.id}</span>
                  <span className="text-lg font-bold text-purple-600">${item.clv.projectedCLV.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                  <div>{item.clv.totalLoads} loads</div>
                  <div>{item.clv.loadsPerMonth} loads/mo</div>
                  <div>{item.clv.profitMargin.toFixed(1)}% margin</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* DSO Aging */}
      {metrics.dso && (
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">A/R Aging Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              <div className="p-3 bg-emerald-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-emerald-600">{metrics.dso.aging.current}</div>
                <div className="text-xs text-slate-600">0-30 days</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-600">{metrics.dso.aging.days_30_60}</div>
                <div className="text-xs text-slate-600">31-60 days</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{metrics.dso.aging.days_60_90}</div>
                <div className="text-xs text-slate-600">61-90 days</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{metrics.dso.aging.over_90}</div>
                <div className="text-xs text-slate-600">&gt;90 days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}