import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Truck,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target
} from "lucide-react";

export default function AIRecommendationsPanel({ loads, drivers, onAction }) {
  const [expanded, setExpanded] = useState(false);

  // Generate AI recommendations based on data
  const unassignedLoads = loads.filter(l => !l.driver_id && !l.carrier_id && ['available', 'tendered'].includes(l.status));
  const delayedLoads = loads.filter(l => l.status === 'in_transit' && l.eta && new Date(l.eta) < new Date());
  const availableDrivers = drivers?.filter(d => d.driver_status === 'available') || [];
  const urgentLoads = loads.filter(l => l.priority === 'urgent' || l.priority === 'critical');
  const deliveredNeedingInvoice = loads.filter(l => l.status === 'delivered' && (!l.invoice_status || l.invoice_status === 'pending'));

  const recommendations = [];

  // Priority recommendations
  if (unassignedLoads.length > 0 && availableDrivers.length > 0) {
    recommendations.push({
      type: 'action',
      priority: 'high',
      icon: Target,
      color: 'amber',
      title: `${unassignedLoads.length} loads need assignment`,
      description: `${availableDrivers.length} drivers available. Use Smart Matching to optimize assignments.`,
      action: 'smart-match',
      actionLabel: 'Run Smart Match'
    });
  }

  if (delayedLoads.length > 0) {
    recommendations.push({
      type: 'alert',
      priority: 'critical',
      icon: AlertTriangle,
      color: 'red',
      title: `${delayedLoads.length} loads running late`,
      description: 'Review ETA updates and notify customers proactively.',
      action: 'view-delayed',
      actionLabel: 'View Delayed'
    });
  }

  if (urgentLoads.length > 0) {
    recommendations.push({
      type: 'alert',
      priority: 'high',
      icon: Clock,
      color: 'orange',
      title: `${urgentLoads.length} urgent priority loads`,
      description: 'These loads require immediate attention.',
      action: 'view-urgent',
      actionLabel: 'View Urgent'
    });
  }

  if (deliveredNeedingInvoice.length > 0) {
    recommendations.push({
      type: 'action',
      priority: 'medium',
      icon: DollarSign,
      color: 'green',
      title: `${deliveredNeedingInvoice.length} loads ready for invoicing`,
      description: 'Send invoices to improve cash flow.',
      action: 'invoice',
      actionLabel: 'Generate Invoices'
    });
  }

  // Optimization tips
  if (loads.length > 10) {
    const avgMargin = loads.filter(l => l.margin).reduce((sum, l) => sum + l.margin, 0) / loads.filter(l => l.margin).length;
    if (avgMargin < 150) {
      recommendations.push({
        type: 'insight',
        priority: 'low',
        icon: TrendingUp,
        color: 'blue',
        title: 'Margin optimization opportunity',
        description: 'Consider using Rate Engine AI to optimize pricing.',
        action: 'rate-engine',
        actionLabel: 'Open Rate Engine'
      });
    }
  }

  // Add general tip if few recommendations
  if (recommendations.length < 3) {
    recommendations.push({
      type: 'tip',
      priority: 'low',
      icon: Lightbulb,
      color: 'purple',
      title: 'Pro tip: Use keyboard shortcuts',
      description: 'Press "N" to create new load, "S" to search, "F" for filters.',
      action: null,
      actionLabel: null
    });
  }

  const getColorClasses = (color) => {
    const colors = {
      amber: 'bg-amber-50 border-amber-200 text-amber-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900'
    };
    return colors[color] || colors.blue;
  };

  const getIconColorClass = (color) => {
    const colors = {
      amber: 'text-amber-600',
      red: 'text-red-600',
      orange: 'text-orange-600',
      green: 'text-green-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600'
    };
    return colors[color] || colors.blue;
  };

  const displayedRecs = expanded ? recommendations : recommendations.slice(0, 3);

  return (
    <Card className="border border-indigo-200 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="py-3 px-4 border-b border-indigo-200 bg-indigo-100/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
              <Brain className="w-4 h-4 text-white" />
            </div>
            AI Recommendations
            {recommendations.length > 0 && (
              <Badge className="ml-1 bg-indigo-600 text-white text-xs">
                {recommendations.length}
              </Badge>
            )}
          </CardTitle>
          <Zap className="w-4 h-4 text-indigo-500" />
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {recommendations.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">All caught up!</p>
            <p className="text-xs text-slate-500">No recommendations at this time.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedRecs.map((rec, idx) => {
              const Icon = rec.icon;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-2 transition-all ${getColorClasses(rec.color)} ${
                    rec.priority === 'critical' ? 'animate-pulse' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getIconColorClass(rec.color)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{rec.title}</p>
                      <p className="text-xs opacity-80 mt-0.5">{rec.description}</p>
                      {rec.action && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 h-7 text-xs"
                          onClick={() => onAction?.(rec.action)}
                        >
                          {rec.actionLabel}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {recommendations.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-indigo-600 hover:text-indigo-700"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Show less' : `Show ${recommendations.length - 3} more`}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}