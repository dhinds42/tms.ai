import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function MaintenanceHistory({ vehicles }) {
  const recentServices = vehicles
    .map(v => ({
      vehicle: v.vehicle_number,
      service: 'Routine Maintenance',
      date: v.last_service_date,
      mileage: v.last_service_miles,
      cost: 450
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="text-xl font-bold text-slate-900">
          Recent Maintenance History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Vehicle</TableHead>
              <TableHead className="font-semibold">Service</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Mileage</TableHead>
              <TableHead className="font-semibold">Cost</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentServices.map((service, index) => (
              <TableRow key={index}>
                <TableCell>
                  <span className="font-semibold text-slate-900">{service.vehicle}</span>
                </TableCell>
                <TableCell>
                  <span className="text-slate-700">{service.service}</span>
                </TableCell>
                <TableCell>
                  <span className="text-slate-700">
                    {format(new Date(service.date), "MMM d, yyyy")}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-slate-700">{service.mileage.toLocaleString()} mi</span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-900">${service.cost}</span>
                </TableCell>
                <TableCell>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}