import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle } from "lucide-react";

const calculateDriverPay = (driver, driverLoads) => {
  const paymentStructure = driver.payment_structure || 'per_load';
  const paymentRate = driver.payment_rate || 500;
  
  let grossPay = 0;
  
  switch (paymentStructure) {
    case 'per_load':
      grossPay = driverLoads.length * paymentRate;
      break;
    case 'percentage':
      grossPay = driverLoads.reduce((sum, l) => {
        const loadRevenue = l.carrier_pay || l.customer_rate || 0;
        return sum + (loadRevenue * (paymentRate / 100));
      }, 0);
      break;
    case 'per_mile':
      grossPay = driverLoads.reduce((sum, l) => sum + ((l.distance_miles || 0) * paymentRate), 0);
      break;
    case 'hourly':
      // Simplified - assume 50 hours per week
      grossPay = paymentRate * 50 * (driverLoads.length > 0 ? 1 : 0);
      break;
    default:
      grossPay = driverLoads.length * 500;
  }
  
  const deductions = grossPay * 0.15; // Taxes, insurance, etc.
  const netPay = grossPay - deductions;
  
  return { grossPay, deductions, netPay };
};

export default function DriverPayStatements({ drivers, loads }) {
  const statements = drivers.map(driver => {
    const driverLoads = loads.filter(l => l.driver_id === driver.id && l.status === 'delivered');
    const { grossPay, deductions, netPay } = calculateDriverPay(driver, driverLoads);
    const miles = driverLoads.reduce((sum, l) => sum + (l.distance_miles || 0), 0);

    return {
      ...driver,
      loads: driverLoads.length,
      miles,
      grossPay,
      deductions,
      netPay
    };
  }).filter(d => d.loads > 0);

  const getPaymentLabel = (structure, rate) => {
    switch (structure) {
      case 'per_load': return `$${rate}/load`;
      case 'percentage': return `${rate}%`;
      case 'per_mile': return `$${rate}/mi`;
      case 'hourly': return `$${rate}/hr`;
      default: return 'N/A';
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="text-xl">Company Driver Pay Statements</CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Supports multiple payment structures: per load, percentage, per mile, hourly
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Driver</TableHead>
                <TableHead className="font-semibold">Pay Structure</TableHead>
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
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-700">
                      {getPaymentLabel(statement.payment_structure, statement.payment_rate)}
                    </Badge>
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