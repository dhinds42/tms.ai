import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function NegotiationHistory({ loads, operatingMode }) {
  const negotiations = loads
    .filter(l => l.carrier_pay && l.customer_rate)
    .slice(0, 10)
    .map(load => {
      const margin = load.customer_rate - load.carrier_pay;
      const marginPercent = (margin / load.customer_rate * 100).toFixed(1);
      const wasSuccessful = operatingMode === 'broker' 
        ? marginPercent >= 15
        : load.carrier_pay >= load.customer_rate * 0.7;

      return {
        ...load,
        margin,
        marginPercent,
        wasSuccessful
      };
    });

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="text-xl">Recent Negotiations</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Load</TableHead>
                <TableHead className="font-semibold">Lane</TableHead>
                <TableHead className="font-semibold">
                  {operatingMode === 'broker' ? 'Customer Rate' : 'Your Rate'}
                </TableHead>
                {operatingMode === 'broker' && (
                  <>
                    <TableHead className="font-semibold">Carrier Pay</TableHead>
                    <TableHead className="font-semibold">Margin</TableHead>
                  </>
                )}
                <TableHead className="font-semibold">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {negotiations.map((neg) => (
                <TableRow key={neg.id}>
                  <TableCell>
                    <span className="font-semibold text-slate-900">
                      {neg.load_number || `#${neg.id.slice(0, 8)}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-700">
                      {neg.pickup_location?.city} → {neg.dropoff_location?.city}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-emerald-600">
                      ${neg.customer_rate.toLocaleString()}
                    </span>
                  </TableCell>
                  {operatingMode === 'broker' && (
                    <>
                      <TableCell>
                        <span className="font-semibold text-blue-600">
                          ${neg.carrier_pay.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          neg.marginPercent >= 15 ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          ${neg.margin.toLocaleString()} ({neg.marginPercent}%)
                        </span>
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    {neg.wasSuccessful ? (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Success
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700">
                        <Clock className="w-3 h-3 mr-1" />
                        Below Target
                      </Badge>
                    )}
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