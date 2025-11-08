import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function PaymentHistory({ loads }) {
  if (loads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No payment history yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold">Load #</TableHead>
            <TableHead className="font-semibold">Delivered</TableHead>
            <TableHead className="font-semibold">Amount</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Expected Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loads.map((load) => {
            const isPaid = load.invoice_status === 'paid';
            const paymentTerms = 30; // Assume NET 30
            const expectedDate = load.actual_delivery 
              ? new Date(new Date(load.actual_delivery).getTime() + paymentTerms * 24 * 60 * 60 * 1000)
              : null;

            return (
              <TableRow key={load.id}>
                <TableCell>
                  <span className="font-semibold text-slate-900">
                    {load.load_number || `#${load.id.slice(0, 8)}`}
                  </span>
                </TableCell>
                <TableCell>
                  {load.actual_delivery 
                    ? format(new Date(load.actual_delivery), "MMM d, yyyy")
                    : '-'}
                </TableCell>
                <TableCell>
                  <span className="font-bold text-emerald-600">
                    ${load.carrier_pay?.toLocaleString() || 'TBD'}
                  </span>
                </TableCell>
                <TableCell>
                  {isPaid ? (
                    <Badge className="bg-emerald-100 text-emerald-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Paid
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {expectedDate && !isPaid
                    ? format(expectedDate, "MMM d, yyyy")
                    : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}