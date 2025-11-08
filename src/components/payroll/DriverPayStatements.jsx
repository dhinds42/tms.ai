import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle } from "lucide-react";

export default function DriverPayStatements({ drivers, loads }) {
  const statements = drivers.map(driver => {
    const driverLoads = loads.filter(l => l.driver_id === driver.id && l.status === 'delivered');
    const grossPay = driverLoads.length * 500; // Simplified
    const deductions = grossPay * 0.15; // Simplified
    const netPay = grossPay - deductions;

    return {
      ...driver,
      loads: driverLoads.length,
      miles: driverLoads.reduce((sum, l) => sum + (l.distance_miles || 0), 0),
      grossPay,
      deductions,
      netPay
    };
  }).filter(d => d.loads > 0);

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="text-xl">Company Driver Pay Statements</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Driver</TableHead>
                <TableHead className="font-semibold">Loads</TableHead>
                <TableHead className="font-semibold">Miles</TableHead>
                <TableHead className="font-semibold">Gross Pay</TableHead>
                <TableHead className="font-semibold">Deductions</TableHead>
                <TableHead className="font-semibold">Net Pay</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statements.map((statement) => (
                <TableRow key={statement.id}>
                  <TableCell>
                    <span className="font-semibold text-slate-900">{statement.full_name}</span>
                  </TableCell>
                  <TableCell>{statement.loads}</TableCell>
                  <TableCell>{statement.miles.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-emerald-600">
                      ${statement.grossPay.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-red-600">
                      -${statement.deductions.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-slate-900">
                      ${statement.netPay.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Download className="w-3 h-3 mr-2" />
                      Export
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