/**
 * KPI Aggregation Functions
 * Consistent business intelligence calculations
 */

import * as Money from './money';
import { roundPercentage } from './rounding';

/**
 * Calculate total revenue from loads
 */
export function totalRevenue(loads: Array<{ totalCustomerCharge?: Money.Cents }>): Money.Cents {
  return Money.sum(
    loads.map(l => l.totalCustomerCharge || 0)
  );
}

/**
 * Calculate total costs from loads
 */
export function totalCosts(loads: Array<{ totalCarrierCost?: Money.Cents }>): Money.Cents {
  return Money.sum(
    loads.map(l => l.totalCarrierCost || 0)
  );
}

/**
 * Calculate total margin
 */
export function totalMargin(loads: Array<{ 
  totalCustomerCharge?: Money.Cents;
  totalCarrierCost?: Money.Cents;
}>): Money.Cents {
  const revenue = totalRevenue(loads);
  const costs = totalCosts(loads);
  return Money.subtract(revenue, costs);
}

/**
 * Calculate average margin percentage
 */
export function avgMarginPercent(loads: Array<{
  totalCustomerCharge?: Money.Cents;
  totalCarrierCost?: Money.Cents;
}>): number {
  const revenue = totalRevenue(loads);
  const margin = totalMargin(loads);
  
  if (revenue === 0) return 0;
  
  return roundPercentage((margin / revenue) * 100);
}

/**
 * Calculate on-time delivery percentage
 */
export function onTimePercentage(loads: Array<{
  deliveredOnTime?: boolean;
}>): number {
  if (loads.length === 0) return 0;
  
  const onTime = loads.filter(l => l.deliveredOnTime === true).length;
  return roundPercentage((onTime / loads.length) * 100);
}

/**
 * Calculate average load value
 */
export function avgLoadValue(loads: Array<{ totalCustomerCharge?: Money.Cents }>): Money.Cents {
  if (loads.length === 0) return 0;
  
  return Money.average(
    loads.map(l => l.totalCustomerCharge || 0)
  );
}

/**
 * Calculate loads per day
 */
export function loadsPerDay(
  loads: Array<{ createdDate: Date }>,
  startDate: Date,
  endDate: Date
): number {
  const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  return roundPercentage(loads.length / days, 2);
}

/**
 * Calculate revenue per mile
 */
export function revenuePerMile(
  totalRevenue: Money.Cents,
  totalMiles: number
): number {
  if (totalMiles === 0) return 0;
  
  return Money.centsToDollars(totalRevenue) / totalMiles;
}

/**
 * Calculate cost per mile
 */
export function costPerMile(
  totalCost: Money.Cents,
  totalMiles: number
): number {
  if (totalMiles === 0) return 0;
  
  return Money.centsToDollars(totalCost) / totalMiles;
}

/**
 * Calculate Days Sales Outstanding (DSO)
 */
export function calculateDSO(invoices: Array<{
  invoiceDate: Date;
  paidDate?: Date;
  amount: Money.Cents;
}>): number {
  if (invoices.length === 0) return 0;
  
  const now = new Date();
  const totalDays = invoices.reduce((sum, inv) => {
    const paidDate = inv.paidDate || now;
    const days = Math.ceil((paidDate.getTime() - inv.invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);
  
  return Math.round(totalDays / invoices.length);
}

/**
 * Calculate Customer Lifetime Value (CLV) projection
 */
export function calculateCLV(customerData: {
  loads: Array<{ totalCustomerCharge?: Money.Cents }>;
  firstLoadDate: Date;
  lastLoadDate: Date;
  avgMarginCents: Money.Cents;
}): Money.Cents {
  const { loads, firstLoadDate, lastLoadDate, avgMarginCents } = customerData;
  
  if (loads.length === 0) return 0;
  
  // Calculate tenure in days
  const tenureDays = Math.max(1, 
    (lastLoadDate.getTime() - firstLoadDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Loads per month
  const loadsPerMonth = (loads.length / tenureDays) * 30;
  
  // Project 12 months
  const projectedLoads = loadsPerMonth * 12;
  const projectedCLV = Money.multiply(avgMarginCents, projectedLoads);
  
  return projectedCLV;
}