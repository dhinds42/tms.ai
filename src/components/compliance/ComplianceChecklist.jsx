import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Clock, XCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  current: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    borderColor: "border-emerald-300",
    label: "Current"
  },
  expiring_soon: {
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-300",
    label: "Expiring Soon"
  },
  expired: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
    label: "Expired"
  },
  missing: {
    icon: XCircle,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-300",
    label: "Missing"
  }
};

export default function ComplianceChecklist({ items, isLoading, onUpdateItem }) {
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
        <CardTitle className="text-xl font-bold text-slate-900">Compliance Items</CardTitle>
        <p className="text-sm text-slate-500 mt-2">
          Track and manage all compliance requirements across carriers, drivers, and vehicles
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">Entity</TableHead>
                <TableHead className="font-semibold text-slate-700">Type</TableHead>
                <TableHead className="font-semibold text-slate-700">Compliance Type</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Expiration</TableHead>
                <TableHead className="font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <p className="font-medium">All compliance items are up to date!</p>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const config = statusConfig[item.status];
                  const Icon = config.icon;
                  
                  return (
                    <TableRow 
                      key={item.id}
                      className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900">{item.entity_name}</p>
                          <p className="text-xs text-slate-500 capitalize">{item.entity_type}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 capitalize">
                          {item.entity_type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-slate-900 capitalize">
                          {item.compliance_type.replace(/_/g, ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${config.bgColor} ${config.color} ${config.borderColor} border font-medium`}
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.expiration_date ? (
                          <div>
                            <p className="font-medium text-slate-900">
                              {format(new Date(item.expiration_date), "MMM d, yyyy")}
                            </p>
                            <p className="text-xs text-slate-500">
                              {Math.ceil((new Date(item.expiration_date) - new Date()) / (1000 * 60 * 60 * 24))} days
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.document_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(item.document_url, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                          {item.status === 'expired' && (
                            <Button
                              size="sm"
                              onClick={() => onUpdateItem(item.id, { status: 'current' })}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Mark Current
                            </Button>
                          )}
                        </div>
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