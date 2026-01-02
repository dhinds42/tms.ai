import React from "react";
import { Badge } from "@/components/ui/badge";

/**
 * StatusBadge - Consistent status indicators
 * 
 * Standard colors for common statuses
 */

const statusColors = {
  // Load statuses
  available: "bg-slate-100 text-slate-800",
  assigned: "bg-blue-100 text-blue-800",
  dispatched: "bg-indigo-100 text-indigo-800",
  in_transit: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  
  // Generic statuses
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-slate-100 text-slate-800",
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  
  // Compliance statuses
  valid: "bg-emerald-100 text-emerald-800",
  expired: "bg-red-100 text-red-800",
  expiring_soon: "bg-amber-100 text-amber-800",
  
  // Invoice statuses
  draft: "bg-slate-100 text-slate-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-emerald-100 text-emerald-800",
  overdue: "bg-red-100 text-red-800",
  
  // Priority levels
  low: "bg-slate-100 text-slate-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
  critical: "bg-red-600 text-white"
};

export default function StatusBadge({ status, children, className = "" }) {
  const colorClass = statusColors[status?.toLowerCase()] || "bg-slate-100 text-slate-800";
  
  return (
    <Badge className={`${colorClass} ${className}`}>
      {children || status}
    </Badge>
  );
}