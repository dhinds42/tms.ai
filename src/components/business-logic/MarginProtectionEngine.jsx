import React, { createContext, useContext } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Margin Protection Engine
 * Prevents unprofitable loads from being dispatched
 */

// Configuration
const MARGIN_CONFIG = {
  minimum_margin_percent: 10,
  minimum_margin_dollars: 100,
  overhead_allocation_percent: 15, // 15% of revenue for operations
  warning_threshold: 15,
  critical_threshold: 10
};

export const MarginProtectionContext = createContext();

export function useMarginProtection() {
  return useContext(MarginProtectionContext);
}

export function MarginProtectionProvider({ children, config = MARGIN_CONFIG }) {
  const validateMargin = (load) => {
    const revenue = parseFloat(load.customer_rate) || 0;
    const cost = parseFloat(load.carrier_pay) || 0;
    const fuelSurcharge = parseFloat(load.fuel_surcharge_revenue) || 0;
    const accessorials = parseFloat(load.accessorial_revenue_total) || 0;
    
    const totalRevenue = revenue + fuelSurcharge + accessorials;
    const grossMargin = totalRevenue - cost;
    const marginPercent = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;
    
    // Calculate true profit (after overhead)
    const overhead = totalRevenue * (config.overhead_allocation_percent / 100);
    const netProfit = grossMargin - overhead;
    const netMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const violations = [];
    
    if (cost > revenue) {
      violations.push({
        severity: 'critical',
        message: `BLOCKED: Carrier pay ($${cost}) exceeds customer rate ($${revenue})`,
        canDispatch: false
      });
    }
    
    if (marginPercent < config.critical_threshold) {
      violations.push({
        severity: 'critical',
        message: `BLOCKED: Margin ${marginPercent.toFixed(1)}% below minimum ${config.critical_threshold}%`,
        canDispatch: false
      });
    } else if (marginPercent < config.warning_threshold) {
      violations.push({
        severity: 'warning',
        message: `WARNING: Low margin ${marginPercent.toFixed(1)}% (target: ${config.warning_threshold}%+)`,
        canDispatch: true
      });
    }
    
    if (grossMargin < config.minimum_margin_dollars) {
      violations.push({
        severity: 'warning',
        message: `WARNING: Margin $${grossMargin.toFixed(0)} below minimum $${config.minimum_margin_dollars}`,
        canDispatch: marginPercent >= config.critical_threshold
      });
    }

    if (netProfit < 0) {
      violations.push({
        severity: 'critical',
        message: `BLOCKED: Net profit negative after ${config.overhead_allocation_percent}% overhead allocation`,
        canDispatch: false
      });
    }

    return {
      valid: violations.filter(v => !v.canDispatch).length === 0,
      violations,
      metrics: {
        totalRevenue,
        totalCost: cost,
        grossMargin,
        marginPercent,
        overhead,
        netProfit,
        netMarginPercent
      }
    };
  };

  const canDispatch = (load) => {
    const result = validateMargin(load);
    return result.valid;
  };

  const getMarginStatus = (load) => {
    const result = validateMargin(load);
    if (!result.valid) return 'blocked';
    if (result.violations.length > 0) return 'warning';
    return 'healthy';
  };

  return (
    <MarginProtectionContext.Provider value={{ validateMargin, canDispatch, getMarginStatus, config }}>
      {children}
    </MarginProtectionContext.Provider>
  );
}

// UI Component to display margin warnings
export function MarginProtectionAlert({ load }) {
  const { validateMargin } = useMarginProtection();
  const result = validateMargin(load);

  if (result.violations.length === 0) return null;

  const critical = result.violations.filter(v => v.severity === 'critical');
  const warnings = result.violations.filter(v => v.severity === 'warning');

  return (
    <div className="space-y-2">
      {critical.map((v, i) => (
        <Alert key={i} className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-900 font-semibold">
            {v.message}
          </AlertDescription>
        </Alert>
      ))}
      {warnings.map((v, i) => (
        <Alert key={i} className="border-amber-500 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            {v.message}
          </AlertDescription>
        </Alert>
      ))}
      <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-600">Gross Margin:</span>
          <span className="font-semibold">${result.metrics.grossMargin.toFixed(2)} ({result.metrics.marginPercent.toFixed(1)}%)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Overhead ({result.metrics.overhead > 0 ? '15%' : '0%'}):</span>
          <span className="font-semibold text-red-600">-${result.metrics.overhead.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t pt-1">
          <span className="text-slate-600 font-semibold">Net Profit:</span>
          <span className={`font-bold ${result.metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${result.metrics.netProfit.toFixed(2)} ({result.metrics.netMarginPercent.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}