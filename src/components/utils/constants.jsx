/**
 * Shared constants for TMS.ai application
 * Single source of truth for thresholds, enums, and color mappings
 */

// Performance Tier Thresholds
export const PERFORMANCE_TIERS = {
  PLATINUM: { min: 90, name: 'Platinum', color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
  GOLD: { min: 80, name: 'Gold', color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50' },
  SILVER: { min: 70, name: 'Silver', color: 'bg-slate-400', textColor: 'text-slate-700', bgColor: 'bg-slate-50' },
  BRONZE: { min: 0, name: 'Bronze', color: 'bg-orange-600', textColor: 'text-orange-700', bgColor: 'bg-orange-50' }
};

export const getTierByScore = (score) => {
  if (score >= 90) return PERFORMANCE_TIERS.PLATINUM;
  if (score >= 80) return PERFORMANCE_TIERS.GOLD;
  if (score >= 70) return PERFORMANCE_TIERS.SILVER;
  return PERFORMANCE_TIERS.BRONZE;
};

// Organization Type Colors
export const ORG_TYPE_COLORS = {
  BROKER: 'bg-purple-100 text-purple-800',
  CARRIER: 'bg-blue-100 text-blue-800',
  OWNER_OPERATOR: 'bg-emerald-100 text-emerald-800',
  CUSTOMER: 'bg-orange-100 text-orange-800',
  DEFAULT: 'bg-slate-100 text-slate-800'
};

export const getOrgTypeColor = (type) => {
  return ORG_TYPE_COLORS[type] || ORG_TYPE_COLORS.DEFAULT;
};

// Membership Status Colors
export const MEMBERSHIP_STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-800',
  invited: 'bg-blue-100 text-blue-800',
  locked: 'bg-red-100 text-red-800',
  offboarded: 'bg-slate-100 text-slate-800',
  DEFAULT: 'bg-slate-100 text-slate-800'
};

export const getMembershipStatusColor = (status) => {
  return MEMBERSHIP_STATUS_COLORS[status] || MEMBERSHIP_STATUS_COLORS.DEFAULT;
};

// Alert Severity Colors
export const SEVERITY_COLORS = {
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-600',
  DEFAULT: 'bg-slate-500'
};

export const getSeverityColor = (severity) => {
  return SEVERITY_COLORS[severity] || SEVERITY_COLORS.DEFAULT;
};

// Load Status Colors
export const LOAD_STATUS_COLORS = {
  available: 'bg-blue-100 text-blue-800',
  tendered: 'bg-purple-100 text-purple-800',
  dispatched: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  DEFAULT: 'bg-slate-100 text-slate-800'
};

export const getLoadStatusColor = (status) => {
  return LOAD_STATUS_COLORS[status] || LOAD_STATUS_COLORS.DEFAULT;
};

// Sync Status Colors
export const SYNC_STATUS_COLORS = {
  completed: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  DEFAULT: 'bg-slate-100 text-slate-800'
};

export const getSyncStatusColor = (status) => {
  return SYNC_STATUS_COLORS[status] || SYNC_STATUS_COLORS.DEFAULT;
};