import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp } from "lucide-react";

export default function OwnerOperatorPay({ ownerOperators, loads }) {
  const statements = ownerOperators.map(oo => {
    const ooLoads = loads.filter(l => l.driver_id === oo.id && l.status === 'delivered');
    const totalLoadPay = ooLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);
    const rate = oo.payment_rate || 75;
    const grossPay = totalLoadPay * (rate / 100);
    const fuelAdvances = grossPay * 0.1; // Simplified
    const netPay = grossPay - fuelAdvances;

    return {
      ...oo,
      loads: ooLoads.length,
      miles: ooLoads.reduce((sum, l) => sum + (l.distance_miles || 0), 0),
      totalLoadPay,
      paymentRate: rate,
      grossPay,
      fuelAdvances,
      netPay
    };
  }).filter(o => o.loads > 0);

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <CardTitle className="text-xl">Owner Operator Settlement Sheets</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-purple-50">
                <TableHead className="font-semibold text-purple-900">Owner Operator</TableHead>
                <TableHead className="font-semibold text-purple-900">Loads</TableHead>
                <TableHead className="font-semibold text-purple-900">Miles</TableHead>
                <TableHead className="font-semibold text-purple-900">Load Pay</TableHead>
                <TableHead className="font-semibold text-purple-900">Rate</TableHead>
                <TableHead className="font-semibold text-purple-900">Gross</TableHead>
                <TableHead className="font-semibold text-purple-900">Deductions</TableHead>
                <TableHead className="font-semibold text-purple-900">Net Pay</TableHead>
                <TableHead className="font-semibold text-purple-900">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statements.map((statement) => (
                <TableRow key={statement.id} className="hover:bg-purple-50">
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-900">{statement.full_name}</p>
                      <p className="text-xs text-slate-500">{statement.company_name || 'Independent'}</p>
                    </div>
                  </TableCell>
                  <TableCell>{statement.loads}</TableCell>
                  <TableCell>{statement.miles.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-700">
                      ${statement.totalLoadPay.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-700">
                      {statement.paymentRate}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-emerald-600">
                      ${statement.grossPay.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-red-600">
                      -${statement.fuelAdvances.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-purple-600">
                      ${statement.netPay.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="border-purple-300 text-purple-700">
                      <Download className="w-3 h-3 mr-2" />
                      Settlement
                    </Button>
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