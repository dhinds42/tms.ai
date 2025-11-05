import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  available: "bg-slate-100 text-slate-700 border-slate-200",
  tendered: "bg-blue-100 text-blue-700 border-blue-200",
  assigned: "bg-purple-100 text-purple-700 border-purple-200",
  dispatched: "bg-indigo-100 text-indigo-700 border-indigo-200",
  picked_up: "bg-cyan-100 text-cyan-700 border-cyan-200",
  in_transit: "bg-blue-100 text-blue-700 border-blue-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  invoiced: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200"
};

export default function RecentLoads({ loads, isLoading, mode }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">Recent Loads</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Latest load activity and updates</p>
          </div>
          <Link 
            to={createPageUrl("LoadBoard")}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            View All →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">Load #</TableHead>
                <TableHead className="font-semibold text-slate-700">Route</TableHead>
                <TableHead className="font-semibold text-slate-700">Date</TableHead>
                <TableHead className="font-semibold text-slate-700">Equipment</TableHead>
                <TableHead className="font-semibold text-slate-700">Rate</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    No loads yet. Create your first load to get started.
                  </TableCell>
                </TableRow>
              ) : (
                loads.map((load) => (
                  <TableRow 
                    key={load.id} 
                    className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                  >
                    <TableCell className="font-semibold text-slate-900">
                      {load.load_number || `#${load.id.slice(0, 8)}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span className="font-medium text-slate-700">
                            {load.pickup_location?.city}, {load.pickup_location?.state}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3 text-red-600" />
                          <span className="font-medium text-slate-700">
                            {load.dropoff_location?.city}, {load.dropoff_location?.state}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        {load.pickup_date ? format(new Date(load.pickup_date), "MMM d, yyyy") : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-slate-700 capitalize">
                        {load.equipment_type?.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        {load.customer_rate ? load.customer_rate.toLocaleString() : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${statusColors[load.status]} border font-medium capitalize`}
                      >
                        {load.status.replace(/_/g, ' ')}
                      </Badge>
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