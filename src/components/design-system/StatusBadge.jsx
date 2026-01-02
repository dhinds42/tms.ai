import React from "react";
import { Badge } from "@/components/ui/badge";

/**
 * StatusBadge - Consistent status indicators
 * 
 * Standard colors for common statuses
 */

const statusColors = {
  // Load statuses
  available: { bg: '#f1f5f9', text: '#1e293b' },
  assigned: { bg: 'var(--info-bg)', text: 'var(--info)' },
  dispatched: { bg: 'var(--primary-bg)', text: 'var(--primary-default)' },
  in_transit: { bg: '#f5f3ff', text: '#7c3aed' },
  delivered: { bg: 'var(--success-bg)', text: 'var(--success)' },
  cancelled: { bg: 'var(--error-bg)', text: 'var(--error)' },
  
  // Generic statuses
  active: { bg: 'var(--success-bg)', text: 'var(--success)' },
  inactive: { bg: '#f1f5f9', text: '#64748b' },
  pending: { bg: 'var(--warning-bg)', text: 'var(--warning)' },
  approved: { bg: 'var(--success-bg)', text: 'var(--success)' },
  rejected: { bg: 'var(--error-bg)', text: 'var(--error)' },
  
  // Compliance statuses
  valid: { bg: 'var(--success-bg)', text: 'var(--success)' },
  expired: { bg: 'var(--error-bg)', text: 'var(--error)' },
  expiring_soon: { bg: 'var(--warning-bg)', text: 'var(--warning)' },
  
  // Invoice statuses
  draft: { bg: '#f1f5f9', text: '#64748b' },
  sent: { bg: 'var(--info-bg)', text: 'var(--info)' },
  paid: { bg: 'var(--success-bg)', text: 'var(--success)' },
  overdue: { bg: 'var(--error-bg)', text: 'var(--error)' },
  
  // Priority levels
  low: { bg: '#f1f5f9', text: '#64748b' },
  medium: { bg: 'var(--warning-bg)', text: 'var(--warning)' },
  high: { bg: 'var(--error-bg)', text: 'var(--error)' },
  critical: { bg: 'var(--error)', text: 'white' }
};

export default function StatusBadge({ status, children, className = "" }) {
  const colors = statusColors[status?.toLowerCase()] || { bg: '#f1f5f9', text: '#64748b' };
  
  return (
    <Badge style={{ backgroundColor: colors.bg, color: colors.text }} className={className}>
      {children || status}
    </Badge>
  );
}