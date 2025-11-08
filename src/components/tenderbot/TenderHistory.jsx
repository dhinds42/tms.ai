import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  tendered: "bg-amber-100 text-amber-700 border-amber-300",
  assigned: "bg-emerald-100 text-emerald-700 border-emerald-300",
  dispatched: "bg-blue-100 text-blue-700 border-blue-300",
  rejected: "bg-red-100 text-red-700 border-red-300"
};

export default function TenderHistory({ loads, carriers }) {
  const tenderedLoads = loads.slice(0, 10);

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="text-xl font-bold text-slate-900">
          Recent Tender Activity
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Latest tender offers and carrier responses
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">Load</TableHead>
                <TableHead className="font-semibold text-slate-700">Carrier</TableHead>
                <TableHead className="font-semibold text-slate-700">Route</TableHead>
                <TableHead className="font-semibold text-slate-700">Tender Rate</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenderedLoads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No tender activity yet
                  </TableCell>
                </TableRow>
              ) : (
                tenderedLoads.map((load) => {
                  const carrier = carriers.find(c => c.id === load.carrier_id);
                  return (
                    <TableRow key={load.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <span className="font-semibold text-slate-900">
                          {load.load_number || `#${load.id.slice(0, 8)}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">
                            {carrier?.company_name || 'Not assigned'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {carrier?.mc_number || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-700">
                          {load.pickup_location?.city} → {load.dropoff_location?.city}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-blue-600">
                          ${load.carrier_pay?.toLocaleString() || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${statusColors[load.status]} border capitalize`}>
                          {load.status === 'tendered' && <Clock className="w-3 h-3 mr-1" />}
                          {['assigned', 'dispatched'].includes(load.status) && <CheckCircle className="w-3 h-3 mr-1" />}
                          {load.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {load.created_date ? format(new Date(load.created_date), "MMM d, h:mm a") : '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}