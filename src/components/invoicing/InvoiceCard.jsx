import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, Building2, FileText, Edit, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  pending: "bg-slate-100 text-slate-700 border-slate-300",
  sent: "bg-blue-100 text-blue-700 border-blue-300",
  partial: "bg-amber-100 text-amber-700 border-amber-300",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-300",
  overdue: "bg-red-100 text-red-700 border-red-300"
};

const statusIcons = {
  pending: Clock,
  sent: FileText,
  partial: AlertTriangle,
  paid: CheckCircle,
  overdue: AlertTriangle
};

export default function InvoiceCard({ load, shipper, onUpdateStatus, onEdit }) {
  const StatusIcon = statusIcons[load.invoice_status] || Clock;
  
  const daysOverdue = load.invoice_due_date 
    ? Math.max(0, differenceInDays(new Date(), new Date(load.invoice_due_date)))
    : 0;

  const isOverdue = daysOverdue > 0 && load.invoice_status !== 'paid';

  return (
    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden">
      <div className={`h-2 ${isOverdue ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-emerald-600 to-green-600'}`}></div>
      <CardContent className="p-6">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 ${isOverdue ? 'bg-red-100' : 'bg-emerald-100'} rounded-lg`}>
                <DollarSign className={`w-5 h-5 ${isOverdue ? 'text-red-600' : 'text-emerald-600'}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {load.invoice_number || 'No Invoice #'}
                </h3>
                <p className="text-sm text-slate-600">
                  Load: {load.load_number || `#${load.id.slice(0, 8)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${statusColors[load.invoice_status]} border font-medium capitalize`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {load.invoice_status}
              </Badge>
              {isOverdue && (
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 font-medium">
                  {daysOverdue} days overdue
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(load)}>
                Edit Invoice
              </DropdownMenuItem>
              {load.invoice_status !== 'paid' && (
                <>
                  <DropdownMenuItem onClick={() => onUpdateStatus('sent')}>
                    Mark as Sent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus('partial')}>
                    Mark as Partial Payment
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus('paid')}>
                    Mark as Paid
                  </DropdownMenuItem>
                </>
              )}
              {load.invoice_status === 'sent' && daysOverdue > 0 && (
                <DropdownMenuItem onClick={() => onUpdateStatus('overdue')}>
                  Mark as Overdue
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Customer Info */}
        {shipper && (
          <div className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <p className="font-semibold text-slate-900">{shipper.company_name}</p>
            </div>
            <p className="text-sm text-slate-600">{shipper.contact_name}</p>
            {shipper.payment_terms && (
              <Badge variant="outline" className="mt-2 bg-white text-slate-700 text-xs">
                {shipper.payment_terms.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            )}
          </div>
        )}

        {/* Load Details */}
        <div className="mb-4 p-4 bg-slate-50 rounded-xl">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Pickup
              </p>
              <p className="text-sm font-medium text-slate-900">
                {load.pickup_location?.city}, {load.pickup_location?.state}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Delivery
              </p>
              <p className="text-sm font-medium text-slate-900">
                {load.dropoff_location?.city}, {load.dropoff_location?.state}
              </p>
            </div>
          </div>
          {load.commodity && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Commodity
              </p>
              <p className="text-sm font-medium text-slate-900">{load.commodity}</p>
            </div>
          )}
        </div>

        {/* Financial Details */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500">Invoice Amount</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${(load.customer_rate || 0).toLocaleString()}
              </p>
            </div>
            {load.invoice_due_date && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Due Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                    {format(new Date(load.invoice_due_date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {load.invoice_status !== 'paid' && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => onUpdateStatus('sent')}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Mark Sent
              </Button>
              <Button
                onClick={() => onUpdateStatus('paid')}
                variant="outline"
                size="sm"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                Mark Paid
              </Button>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}