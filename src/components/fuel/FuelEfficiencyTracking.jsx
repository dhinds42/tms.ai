import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Gauge } from "lucide-react";

export default function FuelEfficiencyTracking({ drivers, loads }) {
  const efficiencyData = drivers.map((driver, index) => {
    const driverLoads = loads.filter(l => l.driver_id === driver.id);
    const totalMiles = driverLoads.reduce((sum, l) => sum + (l.distance_miles || 0), 0);
    const mpg = 6.2 + (Math.random() * 1); // Simulated MPG
    const avgCostPerMile = 3.85 / mpg;

    return {
      ...driver,
      totalMiles,
      mpg,
      costPerMile: avgCostPerMile,
      loadsCount: driverLoads.length
    };
  }).filter(d => d.totalMiles > 0).sort((a, b) => b.mpg - a.mpg).slice(0, 10);

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <Gauge className="w-5 h-5 text-emerald-600" />
          <CardTitle className="text-xl">Driver Fuel Efficiency Ranking</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Rank</TableHead>
                <TableHead className="font-semibold">Driver</TableHead>
                <TableHead className="font-semibold">Total Miles</TableHead>
                <TableHead className="font-semibold">Avg MPG</TableHead>
                <TableHead className="font-semibold">Cost/Mile</TableHead>
                <TableHead className="font-semibold">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {efficiencyData.map((driver, index) => (
                <TableRow key={driver.id} className={index < 3 ? 'bg-emerald-50' : ''}>
                  <TableCell>
                    <span className="font-bold text-slate-700">
                      {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-900">{driver.full_name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-700">{driver.totalMiles.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {driver.mpg >= 6.5 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`font-bold ${
                        driver.mpg >= 6.5 ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {driver.mpg.toFixed(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-900">
                      ${driver.costPerMile.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      driver.mpg >= 6.8 ? 'bg-emerald-100 text-emerald-700' :
                      driver.mpg >= 6.3 ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }>
                      {driver.mpg >= 6.8 ? 'Excellent' :
                       driver.mpg >= 6.3 ? 'Good' : 'Average'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}