import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, DollarSign, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShipperPerformance({ shippers, loads, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Calculate performance metrics for each shipper
  const shipperMetrics = shippers.map(shipper => {
    const shipperLoads = loads.filter(l => l.shipper_id === shipper.id);
    const revenue = shipperLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
    
    return {
      ...shipper,
      actual_loads: shipperLoads.length,
      actual_revenue: revenue,
      avg_load_value: shipperLoads.length > 0 ? revenue / shipperLoads.length : 0
    };
  }).sort((a, b) => b.actual_revenue - a.actual_revenue).slice(0, 10);

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader className="border-b border-purple-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Top Performing Shippers
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Ranked by total revenue generated
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-purple-100 border-b border-purple-200">
                <TableHead className="font-semibold text-purple-900">Rank</TableHead>
                <TableHead className="font-semibold text-purple-900">Company</TableHead>
                <TableHead className="font-semibold text-purple-900">Total Loads</TableHead>
                <TableHead className="font-semibold text-purple-900">Total Revenue</TableHead>
                <TableHead className="font-semibold text-purple-900">Avg Load Value</TableHead>
                <TableHead className="font-semibold text-purple-900">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipperMetrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No shipper data available yet
                  </TableCell>
                </TableRow>
              ) : (
                shipperMetrics.map((shipper, index) => (
                  <TableRow 
                    key={shipper.id}
                    className={`hover:bg-purple-50 transition-colors border-b border-purple-100 ${
                      index === 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50' : ''
                    }`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {index === 0 && <span className="text-xl">🏆</span>}
                        {index === 1 && <span className="text-xl">🥈</span>}
                        {index === 2 && <span className="text-xl">🥉</span>}
                        <span className="font-bold text-slate-700">#{index + 1}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{shipper.company_name}</div>
                      <div className="text-xs text-slate-500">{shipper.contact_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold text-slate-900">{shipper.actual_loads}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-emerald-600">
                          ${shipper.actual_revenue.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-indigo-600">
                        ${shipper.avg_load_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < Math.floor(shipper.rating || 0)
                                ? 'bg-amber-500'
                                : 'bg-slate-200'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-semibold text-slate-700 ml-1">
                          {shipper.rating ? shipper.rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}