import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, TrendingDown, Clock, DollarSign, XCircle } from "lucide-react";

export default function ProactiveRiskMonitor({ carriers, loads }) {
  // Detect risk patterns
  const detectRisks = () => {
    const risks = [];

    carriers.forEach(carrier => {
      const carrierLoads = loads.filter(l => l.carrier_id === carrier.id);
      const recentLoads = carrierLoads.slice(-10);

      // Late delivery pattern
      const lateLoads = recentLoads.filter(l => {
        if (!l.actual_delivery_datetime || !l.planned_delivery_datetime) return false;
        return new Date(l.actual_delivery_datetime) > new Date(l.planned_delivery_datetime);
      });
      
      if (lateLoads.length >= 3) {
        risks.push({
          type: 'late_delivery_pattern',
          severity: 'high',
          carrier,
          message: `${lateLoads.length} late deliveries in last 10 loads`,
          metric: `${((lateLoads.length / recentLoads.length) * 100).toFixed(0)}% late rate`,
          recommendation: 'Review carrier reliability and consider capacity reduction'
        });
      }

      // Declining performance
      if (carrier.on_time_percentage && carrier.on_time_percentage < 80) {
        risks.push({
          type: 'low_performance',
          severity: carrier.on_time_percentage < 70 ? 'critical' : 'medium',
          carrier,
          message: `On-time performance below threshold`,
          metric: `${carrier.on_time_percentage}% on-time`,
          recommendation: 'Schedule performance review meeting'
        });
      }

      // Compliance expiration
      const hasExpiredDocs = carrier.insurance_expiration && 
        new Date(carrier.insurance_expiration) < new Date();
      
      if (hasExpiredDocs) {
        risks.push({
          type: 'compliance_expired',
          severity: 'critical',
          carrier,
          message: 'Insurance or compliance documents expired',
          metric: 'Expired',
          recommendation: 'Suspend carrier until documents updated'
        });
      }

      // High dispute rate
      const disputes = carrierLoads.filter(l => l.status === 'disputed').length;
      const disputeRate = carrierLoads.length > 0 ? (disputes / carrierLoads.length) * 100 : 0;
      
      if (disputeRate > 10) {
        risks.push({
          type: 'high_disputes',
          severity: 'high',
          carrier,
          message: `${disputes} disputes (${disputeRate.toFixed(0)}% rate)`,
          metric: `${disputeRate.toFixed(0)}% dispute rate`,
          recommendation: 'Investigate root causes and implement corrective action'
        });
      }

      // Financial risk - high outstanding payments
      if (carrier.total_paid && carrier.total_paid > 100000 && !carrier.payment_terms) {
        risks.push({
          type: 'financial_exposure',
          severity: 'medium',
          carrier,
          message: 'High payment volume without factoring',
          metric: `$${carrier.total_paid.toLocaleString()} outstanding`,
          recommendation: 'Consider factoring or payment terms adjustment'
        });
      }
    });

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return risks;
  };

  const risks = detectRisks();
  const criticalRisks = risks.filter(r => r.severity === 'critical').length;
  const highRisks = risks.filter(r => r.severity === 'high').length;

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', icon: XCircle },
      high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', icon: AlertTriangle },
      medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', icon: TrendingDown },
      low: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', icon: Shield }
    };
    return configs[severity] || configs.medium;
  };

  const getRiskIcon = (type) => {
    const icons = {
      late_delivery_pattern: Clock,
      low_performance: TrendingDown,
      compliance_expired: Shield,
      high_disputes: AlertTriangle,
      financial_exposure: DollarSign
    };
    return icons[type] || AlertTriangle;
  };

  return (
    <Card className="border-2 border-red-200 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Proactive Risk Monitor
            {(criticalRisks + highRisks) > 0 && (
              <Badge className="bg-red-600 text-white">{criticalRisks + highRisks} Active</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalRisks > 0 && (
              <Badge className="bg-red-600 text-white">{criticalRisks} Critical</Badge>
            )}
            {highRisks > 0 && (
              <Badge className="bg-orange-600 text-white">{highRisks} High</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-600">Real-time risk detection and alerts</p>
      </CardHeader>
      <CardContent className="p-4">
        
        {risks.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-emerald-700 font-semibold">All Clear</p>
            <p className="text-sm text-slate-600 mt-1">No active risk alerts detected</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {risks.map((risk, idx) => {
              const config = getSeverityConfig(risk.severity);
              const RiskIcon = getRiskIcon(risk.type);
              const SeverityIcon = config.icon;
              
              return (
                <Card key={idx} className={`border-2 ${config.border} hover:shadow-md transition-all`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 ${config.bg} rounded-lg`}>
                        <SeverityIcon className={`w-5 h-5 ${config.text}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-900">{risk.carrier.company_name}</p>
                            <p className="text-xs text-slate-500">MC {risk.carrier.mc_number}</p>
                          </div>
                          <Badge className={`${config.bg} ${config.text}`}>
                            {risk.severity.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <RiskIcon className="w-4 h-4 text-slate-500" />
                          <p className="text-sm text-slate-700">{risk.message}</p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
                          <span className="font-semibold">{risk.metric}</span>
                        </div>

                        <div className={`p-3 ${config.bg} rounded-lg border ${config.border}`}>
                          <p className="text-xs font-semibold text-slate-700 mb-1">Recommended Action:</p>
                          <p className="text-xs text-slate-600">{risk.recommendation}</p>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            View Details
                          </Button>
                          <Button size="sm" className={`h-7 text-xs ${config.text}`}>
                            Take Action
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}