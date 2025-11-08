import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function ProfitabilityAnalysis({ loads, shippers, carriers }) {
  // Customer profitability
  const customerProfitability = shippers.map(shipper => {
    const shipperLoads = loads.filter(l => l.shipper_id === shipper.id);
    const revenue = shipperLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
    const cost = shipperLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);
    const margin = revenue - cost;
    const marginPercent = revenue > 0 ? (margin / revenue * 100) : 0;

    return {
      ...shipper,
      revenue,
      margin,
      marginPercent,
      loadCount: shipperLoads.length
    };
  }).sort((a, b) => b.marginPercent - a.marginPercent).slice(0, 5);

  // Carrier cost analysis
  const carrierCosts = carriers.map(carrier => {
    const carrierLoads = loads.filter(l => l.carrier_id === carrier.id);
    const totalPaid = carrierLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);
    const avgRate = carrierLoads.length > 0 ? totalPaid / carrierLoads.length : 0;

    return {
      ...carrier,
      totalPaid,
      avgRate,
      loadCount: carrierLoads.length
    };
  }).sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 5);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      
      {/* Customer Profitability */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-6">
          <CardTitle className="text-xl font-bold text-slate-900">
            Top Customers by Margin %
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Revenue</TableHead>
                <TableHead className="font-semibold">Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerProfitability.map((customer, index) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{customer.company_name}</p>
                      <p className="text-xs text-slate-500">{customer.loadCount} loads</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-emerald-600">
                      ${customer.revenue.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {customer.marginPercent >= 15 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`font-semibold ${customer.marginPercent >= 15 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {customer.marginPercent.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Carrier Cost Analysis */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-6">
          <CardTitle className="text-xl font-bold text-slate-900">
            Top Carriers by Spend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Carrier</TableHead>
                <TableHead className="font-semibold">Total Paid</TableHead>
                <TableHead className="font-semibold">Avg Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carrierCosts.map((carrier) => (
                <TableRow key={carrier.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{carrier.company_name}</p>
                      <p className="text-xs text-slate-500">{carrier.loadCount} loads</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-blue-600">
                      ${carrier.totalPaid.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-700">
                      ${carrier.avgRate.toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}