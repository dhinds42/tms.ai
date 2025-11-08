import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, AlertTriangle } from "lucide-react";

export default function FuelCardManagement({ drivers }) {
  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-red-600" />
          <CardTitle className="text-xl">Fuel Card Status</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Driver</TableHead>
                <TableHead className="font-semibold">Card Number</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Weekly Limit</TableHead>
                <TableHead className="font-semibold">Used This Week</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.slice(0, 10).map((driver, index) => {
                const isOO = !!driver.company_name;
                const cardNumber = driver.fuel_card_number || `****-${1000 + index}`;
                const weeklyLimit = isOO ? 2000 : 1000;
                const used = Math.random() * weeklyLimit * 0.7;
                const percentUsed = (used / weeklyLimit) * 100;

                return (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <span className="font-semibold text-slate-900">{driver.full_name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-slate-700">{cardNumber}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={isOO ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                        {isOO ? 'Owner Op' : 'Company'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-900">${weeklyLimit.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                percentUsed > 90 ? 'bg-red-500' :
                                percentUsed > 70 ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`}
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          ${used.toFixed(0)} ({percentUsed.toFixed(0)}%)
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}